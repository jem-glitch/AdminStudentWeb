import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ADMIN_AI_ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const STOP_WORDS = new Set(["ما", "هي", "هم", "من", "في", "عن", "على", "الى", "إلى", "هذا", "هذه", "الموجودة", "الموجودين", "موجود", "حاليا", "حاليًا", "المنصة", "كم", "عدد", "فيها", "لديكم", "عندي", "أريد", "اريد"]);

type CourseRow = { id: number; category_id: number | null; title: string; instructor: string | null; is_published: boolean };
type LessonRow = { id: number; course_id: number; title: string; youtube_video_id: string; sort_order: number; is_published: boolean };
type CategoryRow = { id: number; name: string; slug: string; is_active: boolean };

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function logEvent(event: string, requestId: string, details: Record<string, unknown> = {}) {
  // Diagnostic fields are deliberately allow-listed: never include message, headers, tokens, secrets, or provider bodies.
  console.log(JSON.stringify({ event, request_id: requestId, ...details }));
}

function upstreamMessage(status: number) {
  if (status === 401) return "تعذر التحقق من إعدادات مزود الذكاء الاصطناعي.";
  if (status === 402) return "رصيد مزود الذكاء الاصطناعي غير كافٍ.";
  if (status === 408) return "انتهت مهلة الاتصال بالمساعد. حاول مرة أخرى.";
  if (status === 429) return "تم تجاوز حد الطلبات مؤقتاً. حاول مرة أخرى بعد قليل.";
  if (status >= 500) return "خدمة المساعد غير متاحة حالياً. حاول مرة أخرى لاحقاً.";
  return "تعذر الحصول على إجابة من المساعد.";
}

function termsFromQuestion(question: string) {
  return question
    .replace(/[؟?!،,.:؛()[\]{}"']/g, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term) && !STOP_WORDS.has(term.replace(/^ال/, "")))
    .slice(-4);
}

function escapeLike(term: string) {
  return term.replace(/[\\%_,]/g, "").slice(0, 80);
}

function intentOf(question: string) {
  return {
    category: /(صف|صفوف|مادة|مواد|مرحلة|خامس|سادس|علمي|تصنيف)/i.test(question),
    teacher: /(مدرس|مدرسين|أستاذ|استاذ|اساتذة|معلم|معلمين|teacher)/i.test(question),
    course: /(كورس|كورسات|دورة|دورات|course)/i.test(question),
    lesson: /(درس|دروس|حلقة|حلقات|فيديو|يوتيوب|youtube)/i.test(question),
  };
}

async function readRelevantContent(client: ReturnType<typeof createClient>, question: string) {
  const intent = intentOf(question);
  const terms = termsFromQuestion(question).map(escapeLike).filter(Boolean);
  const context: Record<string, unknown> = {
    schema: {
      available_tables: ["course_categories", "courses", "lessons"],
      relationships: ["courses.category_id -> course_categories.id", "lessons.course_id -> courses.id"],
      unavailable_entities: ["Stage/الصف المستقل", "Subject/المادة المستقلة", "Teacher/المدرس المستقل"],
      teacher_storage: "courses.instructor (text)",
    },
    rules: ["اعتمد على البيانات الواردة فقط.", "إذا لم توجد البيانات المطلوبة فقل: لم أجد هذه البيانات في المنصة.", "لا تخترع صفوفاً أو مواد أو مدرسين أو كورسات أو دروساً أو روابط YouTube.", "لا تقل إنك نفذت أي تغيير."],
  };

  if (intent.category || (!intent.course && !intent.teacher && !intent.lesson)) {
    const { data, error } = await client.from("course_categories").select("id,name,slug,is_active").eq("is_active", true).order("name").limit(100);
    if (error) throw new Error("category_read_failed");
    context.categories = (data ?? []) as CategoryRow[];
  }

  if (intent.course || intent.teacher || intent.lesson) {
    let query = client.from("courses").select("id,category_id,title,instructor,is_published").eq("is_published", true).order("title").limit(100);
    if (terms.length) {
      const filters = terms.flatMap((term) => [`title.ilike.%${term}%`, `instructor.ilike.%${term}%`]).join(",");
      query = query.or(filters);
    }
    const { data, error } = await query;
    if (error) throw new Error("course_read_failed");
    const courses = (data ?? []) as CourseRow[];
    context.courses = courses;

    if (intent.lesson && courses.length > 0) {
      const courseIds = courses.map((course) => course.id);
      const { data: lessons, error: lessonError } = await client.from("lessons").select("id,course_id,title,youtube_video_id,sort_order,is_published").eq("is_published", true).in("course_id", courseIds).order("course_id").order("sort_order").limit(200);
      if (lessonError) throw new Error("lesson_read_failed");
      context.lessons = (lessons ?? []) as LessonRow[];
    }
  }

  return context;
}

function extractText(payload: unknown): string {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.filter((item) => typeof item === "string").join(" ").trim();
  return "";
}

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  logEvent("REQUEST_RECEIVED", requestId, { method: req.method });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: { code: "method_not_allowed", message: "يسمح هذا المسار بطلبات POST فقط." } }, 405);

  const authorization = req.headers.get("Authorization");
  const hasBearer = Boolean(authorization?.toLowerCase().startsWith("bearer "));
  logEvent("AUTH_HEADER_PRESENT", requestId, { present: hasBearer });
  if (!hasBearer) {
    logEvent("AUTH_FAILED", requestId, { status: 401, reason: "missing_bearer" });
    return json({ error: { code: "unauthorized", message: "جلسة الإدارة غير صالحة أو انتهت." } }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const model = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini";
  if (!supabaseUrl || !supabaseAnonKey || !openRouterKey) return json({ error: { code: "server_configuration", message: "لم تكتمل إعدادات المساعد على الخادم." } }, 500);

  const token = authorization.slice(7).trim();
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    logEvent("AUTH_FAILED", requestId, { status: 401, reason: "invalid_session" });
    return json({ error: { code: "unauthorized", message: "جلسة الإدارة غير صالحة أو انتهت." } }, 401);
  }
  logEvent("USER_AUTHENTICATED", requestId);

  const { data: profile, error: profileError } = await client.from("admin_profiles").select("user_id").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
  if (profileError) {
    logEvent("ADMIN_CHECK_FAILED", requestId, { status: 500, reason: "profile_query_failed" });
    return json({ error: { code: "admin_check_failed", message: "تعذر التحقق من صلاحية Admin." } }, 500);
  }
  if (!profile) {
    logEvent("ADMIN_CHECK_FAILED", requestId, { status: 403, reason: "not_admin" });
    return json({ error: { code: "forbidden", message: "هذا الحساب ليس ضمن قائمة Admin المسموح لها باستخدام المساعد." } }, 403);
  }
  logEvent("ADMIN_CHECK_PASSED", requestId);

  let body: { message?: unknown };
  try { body = await req.json(); } catch { return json({ error: { code: "invalid_json", message: "صيغة الطلب غير صالحة." } }, 400); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: { code: "empty_message", message: "اكتب رسالة قبل الإرسال." } }, 400);
  if (message.length > 8000) return json({ error: { code: "message_too_long", message: "الرسالة طويلة جداً." } }, 413);

  try {
    const relevantContent = await readRelevantContent(client, message);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      logEvent("OPENROUTER_REQUEST_STARTED", requestId);
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": Deno.env.get("OPENROUTER_HTTP_REFERER") ?? "https://adminstudentweb.local",
          "X-OpenRouter-Title": Deno.env.get("OPENROUTER_APP_TITLE") ?? "Akadimiyat Masar Admin Assistant",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "أنت AI Assistant إداري لمنصة أكاديمية مسار. AdminStudentWeb هي لوحة الإدارة، وStudent App يعرض المحتوى للطلاب، وSupabase مصدر المحتوى. أجب بالعربية اعتماداً حصراً على السياق المحدد المرفق. لا تتصل بقاعدة البيانات بنفسك، ولا تنفذ أي عملية، ولا تخترع بيانات. إذا لم تجد المطلوب في السياق فقل حرفياً: لم أجد هذه البيانات في المنصة." },
            { role: "user", content: JSON.stringify({ question: message, relevant_content: relevantContent }) },
          ],
          stream: false,
          temperature: 0.1,
          max_tokens: 800,
        }),
      });
      logEvent("OPENROUTER_RESPONSE_RECEIVED", requestId, { status: upstream.status });
      if (!upstream.ok) {
        let providerReason = "unknown";
        try {
          const errorPayload = await upstream.clone().json() as { error?: { code?: unknown; type?: unknown; message?: unknown } };
          const raw = `${String(errorPayload.error?.code ?? "")} ${String(errorPayload.error?.type ?? "")} ${String(errorPayload.error?.message ?? "")}`.toLowerCase();
          if (raw.includes("model")) providerReason = "model_configuration";
          else if (raw.includes("token") || raw.includes("message") || raw.includes("request")) providerReason = "request_shape";
          else if (raw.includes("auth") || raw.includes("key") || raw.includes("credential")) providerReason = "provider_auth";
          else if (raw.includes("credit") || raw.includes("balance") || raw.includes("fund")) providerReason = "provider_credits";
          else if (raw.includes("rate") || raw.includes("limit")) providerReason = "provider_rate_limit";
        } catch {
          providerReason = "unparseable_provider_error";
        }
        logEvent("OPENROUTER_HTTP_ERROR", requestId, { status: upstream.status, reason: providerReason });
        return json({ error: { code: `openrouter_${upstream.status}`, message: upstreamMessage(upstream.status) } }, upstream.status === 401 ? 502 : upstream.status === 429 ? 429 : upstream.status >= 500 ? 502 : 502);
      }
      let payload: unknown;
      try { payload = await upstream.json(); } catch {
        logEvent("OPENROUTER_REQUEST_FAILED", requestId, { reason: "invalid_json", status: upstream.status });
        return json({ error: { code: "openrouter_invalid_response", message: "تعذر قراءة استجابة المساعد." } }, 502);
      }
      const text = extractText(payload);
      if (!text) {
        logEvent("EMPTY_RESPONSE", requestId, { status: upstream.status });
        return json({ error: { code: "empty_response", message: "عاد المساعد دون إجابة نصية." } }, 502);
      }
      logEvent("RESPONSE_RETURNED", requestId, { status: 200 });
      return json({ data: { text, model } });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        logEvent("OPENROUTER_TIMEOUT", requestId, { status: 408 });
        return json({ error: { code: "timeout", message: "انتهت مهلة الاتصال بالمساعد. حاول مرة أخرى." } }, 408);
      }
      logEvent("OPENROUTER_REQUEST_FAILED", requestId, { reason: "fetch_failed" });
      return json({ error: { code: "openrouter_unavailable", message: "خدمة المساعد غير متاحة حالياً. حاول مرة أخرى لاحقاً." } }, 503);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof Error && ["category_read_failed", "course_read_failed", "lesson_read_failed"].includes(error.message)) {
      logEvent("INTERNAL_ERROR", requestId, { reason: "content_read_failed" });
      return json({ error: { code: "content_read_failed", message: "تعذر قراءة بيانات المحتوى المطلوبة." } }, 502);
    }
    logEvent("INTERNAL_ERROR", requestId, { reason: "unhandled_error" });
    return json({ error: { code: "openrouter_unavailable", message: "خدمة المساعد غير متاحة حالياً. حاول مرة أخرى لاحقاً." } }, 503);
  }
});
