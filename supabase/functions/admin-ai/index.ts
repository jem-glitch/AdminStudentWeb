import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ADMIN_AI_ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function errorMessage(status: number) {
  if (status === 401) return "جلسة الإدارة غير صالحة أو انتهت. سجّل الدخول من جديد.";
  if (status === 403) return "هذا الحساب ليس ضمن قائمة Admin المسموح لها باستخدام المساعد.";
  if (status === 408) return "انتهت مهلة الاتصال بمزود الذكاء الاصطناعي. حاول مرة أخرى.";
  if (status === 429) return "تم تجاوز حد الطلبات مؤقتاً. انتظر قليلاً ثم حاول مرة أخرى.";
  if (status === 402) return "رصيد OpenRouter غير كافٍ لتنفيذ الطلب.";
  if (status === 502 || status === 503) return "خدمة OpenRouter غير متاحة حالياً. حاول مرة أخرى لاحقاً.";
  return "تعذر الحصول على استجابة من مساعد الذكاء الاصطناعي.";
}

function extractText(payload: unknown): string {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.filter((item) => typeof item === "string").join(" ").trim();
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: { code: "method_not_allowed", message: "يسمح هذا المسار بطلبات POST فقط." } }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.toLowerCase().startsWith("bearer ")) return json({ error: { code: "unauthorized", message: errorMessage(401) } }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const model = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini";
  if (!supabaseUrl || !supabaseAnonKey || !openRouterKey) return json({ error: { code: "server_configuration", message: "لم تكتمل إعدادات مساعد الإدارة على الخادم." } }, 500);

  const token = authorization.slice(7).trim();
  const userClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: { code: "unauthorized", message: errorMessage(401) } }, 401);

  const { data: profile, error: profileError } = await userClient.from("admin_profiles").select("user_id").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
  if (profileError) return json({ error: { code: "admin_check_failed", message: "تعذر التحقق من صلاحية Admin." } }, 500);
  if (!profile) return json({ error: { code: "forbidden", message: errorMessage(403) } }, 403);

  let body: { message?: unknown };
  try { body = await req.json(); } catch { return json({ error: { code: "invalid_json", message: "صيغة الطلب غير صالحة." } }, 400); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: { code: "empty_message", message: "اكتب رسالة قبل الإرسال." } }, 400);
  if (message.length > 8000) return json({ error: { code: "message_too_long", message: "الرسالة طويلة جداً. الحد الأقصى 8000 حرف." } }, 413);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("OPENROUTER_HTTP_REFERER") ?? "https://adminstudentweb.local",
        "X-OpenRouter-Title": Deno.env.get("OPENROUTER_APP_TITLE") ?? "Akadimiyat Masar Admin Assistant",
      },
      body: JSON.stringify({ model, messages: [{ role: "system", content: "أنت مساعد إداري تجريبي. أجب بوضوح وباختصار. لا تنفذ أي عمليات على قاعدة البيانات ولا تقترح أنك نفذت تغييرات." }, { role: "user", content: message }], stream: false, temperature: 0.2, max_tokens: 800 }),
    });
    if (!upstream.ok) return json({ error: { code: `openrouter_${upstream.status}`, message: errorMessage(upstream.status) } }, upstream.status === 401 ? 502 : upstream.status === 429 ? 429 : upstream.status >= 500 ? 502 : 502);
    const payload = await upstream.json();
    const text = extractText(payload);
    if (!text) return json({ error: { code: "empty_response", message: "عاد OpenRouter دون نص قابل للعرض." } }, 502);
    return json({ data: { text, model } });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return json({ error: { code: "timeout", message: errorMessage(408) } }, 408);
    return json({ error: { code: "openrouter_unavailable", message: errorMessage(503) } }, 503);
  } finally {
    clearTimeout(timeout);
  }
});
