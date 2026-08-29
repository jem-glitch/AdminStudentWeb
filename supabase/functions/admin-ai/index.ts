import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PLATFORM_SYSTEM_RULES } from "./skills/platform-knowledge.ts";
import { detectRequest, type DetectedRequest } from "./skills/content-classification.ts";
import { buildImportDraft, normalizeAttachmentRows } from "./skills/course-analysis.ts";
import { extractPlaylistItems, extractUrls, videoIdFromUrl, playlistIdFromUrl, titleFromHtml, descriptionFromHtml, thumbnailFromHtml, channelFromHtml, youtubeKind } from "./skills/youtube.ts";
import { TranscriptApiYouTubeProvider, TranscriptApiProviderError } from "./skills/youtube-provider.ts";
import { actionLabel, auditSummary, fingerprint, safeCourseSlug } from "./skills/content-management.ts";
import { approvalError, isDraftIntent, parseAgentAction, safeDraftStatus } from "./skills/approval-safety.ts";
import { validateImportDraft } from "./skills/validation.ts";
import type { AgentAction, AttachmentInput, CourseDraftPayload, DraftIntent, ExternalItem, LessonDraft } from "./skills/types.ts";

const corsHeaders = { "Access-Control-Allow-Origin": Deno.env.get("ADMIN_AI_ALLOWED_ORIGIN") ?? "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json; charset=utf-8" };
const MAX_EXTERNAL_RESPONSE_BYTES = 1_000_000;
const MAX_EXTERNAL_REDIRECTS = 3;
const EXTERNAL_TIMEOUT_MS = 12_000;
const MAX_ATTACHMENTS = 2;
const MAX_ATTACHMENT_ROWS = 200;
const MAX_ATTACHMENT_TEXT_LENGTH = 300_000;
const STOP_WORDS = new Set(["ما", "هي", "هم", "من", "في", "عن", "على", "الى", "إلى", "هذا", "هذه", "الموجودة", "الموجودين", "موجود", "حاليا", "حاليًا", "المنصة", "كم", "عدد", "فيها", "لديكم", "عندي", "أريد", "اريد", "احذف", "حذف", "انشر", "نشر", "أضف", "اضف"]);

type CourseRow = { id: number; category_id: number | null; teacher_assignment_id: string | null; source_playlist_id?: string | null; title: string; description?: string | null; instructor: string | null; is_published: boolean };
type LessonRow = { id: number; course_id: number; title: string; youtube_video_id: string; sort_order: number; is_published: boolean };
type StageRow = { id: string; name: string; slug: string; is_active: boolean };
type SubjectRow = { id: string; name: string; slug: string; is_active: boolean };
type StageSubjectRow = { id: string; stage_id: string; subject_id: string };
type TeacherRow = { id: string; display_name: string; is_active: boolean };
type TeacherAssignmentRow = { id: string; teacher_id: string; stage_subject_id: string };
type AgentDraftRow = { id: string; created_by: string; intent: DraftIntent; status: string; payload: CourseDraftPayload; validation: Record<string, unknown>; expires_at: string; approved_by: string | null };

function json(body: Record<string, unknown>, status = 200) { return new Response(JSON.stringify(body), { status, headers: corsHeaders }); }
function logEvent(event: string, requestId: string, details: Record<string, unknown> = {}) { console.log(JSON.stringify({ event, request_id: requestId, ...details })); }
function errorMessage(error: unknown, fallback: string) { return error instanceof Error ? error.message.slice(0, 120) : fallback; }
function upstreamMessage(status: number) { if (status === 401) return "تعذر التحقق من إعدادات مزود الذكاء الاصطناعي."; if (status === 402) return "رصيد مزود الذكاء الاصطناعي غير كافٍ."; if (status === 408) return "انتهت مهلة الاتصال بالمساعد. حاول مرة أخرى."; if (status === 429) return "تم تجاوز حد الطلبات مؤقتاً. حاول مرة أخرى بعد قليل."; if (status >= 500) return "خدمة المساعد غير متاحة حالياً. حاول مرة أخرى لاحقاً."; return "تعذر الحصول على إجابة من المساعد."; }
function termsFromQuestion(question: string) { return question.replace(/[؟?!،,.:؛()[\]{}"']/g, " ").split(/\s+/).map((term) => term.trim()).filter((term) => term.length > 2 && !STOP_WORDS.has(term) && !STOP_WORDS.has(term.replace(/^ال/, ""))).slice(-5); }
function normalizeText(value: string) { return value.trim().toLocaleLowerCase(); }

function validateExternalUrl(rawUrl: string) {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error("external_url_invalid"); }
  if (parsed.protocol !== "https:") throw new Error("external_url_https_required");
  if (parsed.username || parsed.password || (parsed.port && parsed.port !== "443")) throw new Error("external_url_rejected");
  const host = parsed.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("external_url_private_host");
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) || host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) throw new Error("external_url_private_host");
  return parsed;
}

async function fetchExternalUrl(rawUrl: string) {
  let current = validateExternalUrl(rawUrl).toString();
  for (let redirect = 0; redirect <= MAX_EXTERNAL_REDIRECTS; redirect += 1) {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
    try {
      const response = await fetch(current, { redirect: "manual", signal: controller.signal, headers: { Accept: "text/html,text/plain;q=0.9" } });
      if (response.status >= 300 && response.status < 400) { const location = response.headers.get("location"); if (!location || redirect === MAX_EXTERNAL_REDIRECTS) throw new Error("external_redirect_rejected"); current = validateExternalUrl(new URL(location, current).toString()).toString(); continue; }
      if (!response.ok) throw new Error(`external_http_${response.status}`);
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) throw new Error("external_content_type_rejected");
      const reader = response.body?.getReader(); if (!reader) throw new Error("external_empty_response");
      const chunks: Uint8Array[] = []; let total = 0;
      while (true) { const part = await reader.read(); if (part.done) break; total += part.value.byteLength; if (total > MAX_EXTERNAL_RESPONSE_BYTES) throw new Error("external_response_too_large"); chunks.push(part.value); }
      const bytes = new Uint8Array(total); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      return { url: current, status: response.status, content: new TextDecoder().decode(bytes) };
    } catch (error) { if (error instanceof DOMException && error.name === "AbortError") throw new Error("external_timeout"); throw error; } finally { clearTimeout(timeout); }
  }
  throw new Error("external_redirect_rejected");
}

function attachmentInputs(value: unknown): AttachmentInput[] {
  if (!Array.isArray(value)) return [];
  const result: AttachmentInput[] = [];
  for (const candidate of value.slice(0, MAX_ATTACHMENTS)) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Record<string, unknown>; const name = typeof item.name === "string" ? item.name.slice(0, 160) : "attachment";
    const mime_type = typeof item.mime_type === "string" ? item.mime_type.slice(0, 120) : undefined;
    const text = typeof item.text === "string" ? item.text.slice(0, MAX_ATTACHMENT_TEXT_LENGTH) : undefined;
    const rows = Array.isArray(item.rows) ? item.rows.slice(0, MAX_ATTACHMENT_ROWS).filter((row) => row && typeof row === "object").map((row) => row as Record<string, unknown>) : undefined;
    if (text || rows?.length) result.push({ name, mime_type, text, rows });
  }
  return result;
}

function intentOf(question: string) { return { category: /(صف|صفوف|مادة|مواد|مرحلة|خامس|سادس|علمي|تصنيف)/i.test(question), teacher: /(مدرس|مدرسين|أستاذ|استاذ|اساتذة|معلم|معلمين|teacher)/i.test(question), course: /(كورس|كورسات|دورة|دورات|course)/i.test(question), lesson: /(درس|دروس|حلقة|حلقات)/i.test(question) }; }

async function readRelevantContent(client: ReturnType<typeof createClient>, question: string) {
  const intent = intentOf(question); const terms = termsFromQuestion(question); const context: Record<string, unknown> = { schema: { available_tables: ["stages", "subjects", "stage_subjects", "teachers", "teacher_assignments", "courses", "lessons", "course_categories"], relationships: ["stage_subjects.stage_id -> stages.id", "stage_subjects.subject_id -> subjects.id", "teacher_assignments.stage_subject_id -> stage_subjects.id", "teacher_assignments.teacher_id -> teachers.id", "courses.teacher_assignment_id -> teacher_assignments.id", "lessons.course_id -> courses.id"] }, rules: ["اعتمد على البيانات الواردة فقط.", "لا تخترع بيانات منصة أو metadata خارجية.", "لا تدّع تنفيذ تغيير قبل نجاح العملية." ] };
  if (intent.category || intent.teacher || (!intent.course && !intent.lesson)) {
    const [{ data: stages, error: stageError }, { data: subjects, error: subjectError }, { data: links, error: linkError }] = await Promise.all([client.from("stages").select("id,name,slug,is_active").eq("is_active", true).order("sort_order").limit(100), client.from("subjects").select("id,name,slug,is_active").eq("is_active", true).order("sort_order").limit(100), client.from("stage_subjects").select("id,stage_id,subject_id").limit(200)]);
    if (stageError || subjectError || linkError) throw new Error("academic_read_failed"); context.stages = (stages ?? []) as StageRow[]; context.subjects = (subjects ?? []) as SubjectRow[]; context.stage_subjects = (links ?? []) as StageSubjectRow[];
  }
  if (intent.teacher || intent.category) {
    const [{ data: teachers, error: teacherError }, { data: assignments, error: assignmentError }] = await Promise.all([client.from("teachers").select("id,display_name,is_active").eq("is_active", true).order("display_name").limit(100), client.from("teacher_assignments").select("id,teacher_id,stage_subject_id").limit(200)]);
    if (teacherError || assignmentError) throw new Error("teacher_read_failed"); context.teachers = (teachers ?? []) as TeacherRow[]; context.teacher_assignments = (assignments ?? []) as TeacherAssignmentRow[];
  }
  if (intent.course || intent.lesson) {
    const { data, error } = await client.from("courses").select("id,category_id,teacher_assignment_id,source_playlist_id,title,description,instructor,is_published").eq("is_published", true).order("title").limit(100); if (error) throw new Error("course_read_failed");
    const allCourses = (data ?? []) as CourseRow[]; const courses = terms.length ? allCourses.filter((course) => terms.some((term) => normalizeText(course.title).includes(normalizeText(term)) || normalizeText(course.instructor ?? "").includes(normalizeText(term)))) : allCourses; context.courses = courses;
    if (intent.lesson && courses.length) { const ids = courses.map((course) => course.id); const { data: lessons, error: lessonError } = await client.from("lessons").select("id,course_id,title,youtube_video_id,sort_order,is_published").eq("is_published", true).in("course_id", ids).order("course_id").order("sort_order").limit(200); if (lessonError) throw new Error("lesson_read_failed"); const list = (lessons ?? []) as LessonRow[]; context.lessons = list; context.course_lesson_counts = courses.map((course) => ({ course_id: course.id, course_title: course.title, lesson_count: list.filter((lesson) => lesson.course_id === course.id).length })); }
  }
  if (intent.category || intent.teacher || intent.course || intent.lesson) resolveAcademicMatch(context, question); return context;
}

function resolveAcademicMatch(context: Record<string, unknown>, question: string) {
  const stages = (context.stages ?? []) as StageRow[]; const subjects = (context.subjects ?? []) as SubjectRow[]; const teachers = (context.teachers ?? []) as TeacherRow[]; const links = (context.stage_subjects ?? []) as StageSubjectRow[]; const assignments = (context.teacher_assignments ?? []) as TeacherAssignmentRow[];
  const stage = stages.find((item) => question.includes(item.name)); const subject = subjects.find((item) => question.includes(item.name)); const teacher = teachers.find((item) => question.includes(item.display_name)); const link = stage && subject ? links.find((item) => item.stage_id === stage.id && item.subject_id === subject.id) : undefined; const assignment = link && teacher ? assignments.find((item) => item.stage_subject_id === link.id && item.teacher_id === teacher.id) : undefined;
  if (!stage && !subject && !teacher) return; context.academic_resolution = { status: assignment ? "matched" : "not_matched", stage: stage ? { id: stage.id, name: stage.name } : null, subject: subject ? { id: subject.id, name: subject.name } : null, teacher: teacher ? { id: teacher.id, name: teacher.display_name } : null, teacher_assignment_id: assignment?.id ?? null, instruction: assignment ? "العلاقة موجودة." : "لم أجد Teacher Assignment مطابقاً. يرجى إنشاؤه من إدارة المحتوى أولاً." };
}

async function gatherExternalData(detected: DetectedRequest, attachments: AttachmentInput[], requestId: string) {
  const resources: Array<Record<string, unknown>> = []; const playlistItems: ExternalItem[] = []; let sourceTitle: string | undefined; let sourceDescription: string | undefined; let sourceChannel: string | undefined;
  for (const url of detected.urls.slice(0, 5)) {
    const kind = youtubeKind(url); const localVideoId = kind === "video" ? videoIdFromUrl(url) : null; logEvent("WEB_FETCH_STARTED", requestId, { resource_type: kind === "playlist" ? "youtube_playlist" : kind === "video" ? "youtube_video" : "external_url" });
    try {
      const fetched = await fetchExternalUrl(url); logEvent("WEB_FETCH_SUCCESS", requestId, { status: fetched.status, resource_type: kind ?? "external_url" }); const title = titleFromHtml(fetched.content); const description = descriptionFromHtml(fetched.content); const channel = channelFromHtml(fetched.content); const thumbnail = thumbnailFromHtml(fetched.content);
      if (kind === "playlist") { const items = extractPlaylistItems(fetched.content).filter((item) => !playlistItems.some((existing) => existing.video_id === item.video_id)); playlistItems.push(...items.map((item, index) => ({ ...item, sort_order: playlistItems.length + index + 1 }))); resources.push({ type: "youtube_playlist", url, title, description, channel, item_count: items.length }); sourceTitle ||= title; sourceDescription ||= description; sourceChannel ||= channel; if (items.length) logEvent("PLAYLIST_DATA_EXTRACTED", requestId, { item_count: items.length }); }
      else if (kind === "video") { if (localVideoId && !playlistItems.some((item) => item.video_id === localVideoId)) playlistItems.push({ video_id: localVideoId, url, title, description, channel, thumbnail_url: thumbnail, sort_order: playlistItems.length + 1, title_source: title ? "source_page" : "derived", description_source: description ? "source_page" : "unavailable" }); resources.push({ type: "youtube_video", url, video_id: localVideoId, title, description, channel, thumbnail_url: thumbnail }); sourceTitle ||= title; sourceDescription ||= description; sourceChannel ||= channel; }
      else resources.push({ type: "external_url", url, title, status: fetched.status });
    } catch (error) { const reason = errorMessage(error, "external_fetch_failed"); logEvent("WEB_FETCH_FAILED", requestId, { reason }); if (kind === "video" && localVideoId && !playlistItems.some((item) => item.video_id === localVideoId)) playlistItems.push({ video_id: localVideoId, url, sort_order: playlistItems.length + 1, title_source: "derived", description_source: "unavailable" }); resources.push({ type: kind === "playlist" ? "youtube_playlist" : kind === "video" ? "youtube_video" : "external_url", url, ...(localVideoId ? { video_id: localVideoId } : {}), error: reason }); }
  }
  for (const attachment of attachments) {
    if (attachment.rows?.length) { const parsed = normalizeAttachmentRows(attachment.rows); playlistItems.push(...parsed.items.filter((item) => !playlistItems.some((existing) => existing.video_id === item.video_id)).map((item, index) => ({ ...item, sort_order: playlistItems.length + index + 1 }))); resources.push({ type: "content_file", file_name: attachment.name, row_count: attachment.rows.length, item_count: parsed.items.length }); if (parsed.warnings.length) resources.push({ type: "content_file_warnings", file_name: attachment.name, warnings: parsed.warnings }); }
    else if (attachment.text) { const urls = extractUrls(attachment.text); for (const url of urls) { const video_id = videoIdFromUrl(url); if (video_id && !playlistItems.some((item) => item.video_id === video_id)) playlistItems.push({ video_id, url, sort_order: playlistItems.length + 1, title_source: "derived", description_source: "unavailable" }); } resources.push({ type: "content_file", file_name: attachment.name, text_url_count: urls.length }); }
  }
  const playlistId = detected.playlistUrls.map(playlistIdFromUrl).find(Boolean) ?? null;
  const fallback = detected.playlistUrls.length && !playlistItems.length ? "تعرفت على أنها YouTube Playlist، لكن تعذر استخراج قائمة الفيديوهات تلقائياً. يمكنك لصق روابط الفيديوهات هنا أو إرفاق CSV/XLSX/JSON وسأجهزها للكورس." : undefined;
  return { resources, playlist_items: playlistItems, source_title: sourceTitle, source_description: sourceDescription, source_channel: sourceChannel, playlist_id: playlistId, fallback };
}

async function findExistingForDraft(client: ReturnType<typeof createClient>, payload: CourseDraftPayload) {
  if (!payload.course.teacher_assignment_id) return { courseId: null, existingVideoIds: [] as string[] };
  let courseId: number | null = null;
  if (payload.source.playlist_id) {
    const { data, error } = await client.from("courses").select("id").eq("teacher_assignment_id", payload.course.teacher_assignment_id).eq("source_playlist_id", payload.source.playlist_id).limit(1);
    if (error) throw new Error("duplicate_check_failed");
    courseId = (data?.[0] as { id: number } | undefined)?.id ?? null;
  } else {
    const { data: sameTitle, error: titleError } = await client.from("courses").select("id").eq("teacher_assignment_id", payload.course.teacher_assignment_id).ilike("title", payload.course.title).limit(1);
    if (titleError) throw new Error("duplicate_check_failed");
    courseId = (sameTitle?.[0] as { id: number } | undefined)?.id ?? null;
  }
  if (!courseId) return { courseId: null, existingVideoIds: [] as string[] };
  const { data: lessons, error: lessonsError } = await client.from("lessons").select("youtube_video_id").eq("course_id", courseId).limit(250); if (lessonsError) throw new Error("duplicate_check_failed"); return { courseId, existingVideoIds: (lessons ?? []).map((lesson) => (lesson as { youtube_video_id: string }).youtube_video_id) };
}

async function resolveActionCourse(client: ReturnType<typeof createClient>, question: string) {
  const explicitId = question.match(/(?:رقم|id|معرف)\s*#?\s*(\d+)/i)?.[1];
  const query = client.from("courses").select("id,title,description,category_id,teacher_assignment_id,is_published");
  if (explicitId) {
    const { data, error } = await query.eq("id", Number(explicitId)).limit(1);
    if (error) throw new Error("course_read_failed");
    return ((data ?? []) as CourseRow[])[0] ?? null;
  }
  const terms = termsFromQuestion(question); const { data, error } = await query.order("title").limit(100); if (error) throw new Error("course_read_failed"); const matched = ((data ?? []) as CourseRow[]).filter((course) => terms.some((term) => normalizeText(course.title).includes(normalizeText(term)))); return matched.length === 1 ? matched[0] : null;
}

function actionPayload(intent: DraftIntent, course: CourseRow | null, question: string): CourseDraftPayload {
  const errors = course ? [] : ["لم أجد كورساً واحداً مطابقاً. اذكر اسم الكورس بدقة قبل المتابعة."];
  return { version: 1, action: intent, source: { url: null, playlist_id: null, title: null, description: null, channel: null, item_count: 0 }, target: { stage_id: null, subject_id: null, teacher_assignment_id: course?.teacher_assignment_id ?? null, status: "not_requested" }, course: { id: course?.id, title: course?.title ?? "", description: course?.description ?? null, category_id: course?.category_id ?? null, teacher_assignment_id: course?.teacher_assignment_id ?? null, source_playlist_id: null, is_published: intent === "publish_course" ? true : intent === "unpublish_course" ? false : course?.is_published ?? false }, lessons: [], warnings: errors, provenance: { title: "derived", description: "unavailable" } };
}

async function audit(client: ReturnType<typeof createClient>, userId: string, draftId: string | null, action: string, resourceType: string, resourceId: string | null, outcome: "analyzed" | "approved" | "executed" | "rejected" | "failed" | "cancelled" | "updated", summary: Record<string, unknown>) { const { error } = await client.from("content_agent_audit_logs").insert({ actor_user_id: userId, draft_id: draftId, action, resource_type: resourceType, resource_id: resourceId, outcome, summary }); if (error) throw new Error("audit_log_failed"); }

async function storeDraft(client: ReturnType<typeof createClient>, userId: string, payload: CourseDraftPayload, validation: Record<string, unknown>) {
  const input_fingerprint = await fingerprint({ action: payload.action, source: payload.source, target: payload.target, course: payload.course, lessons: payload.lessons });
  const { data, error } = await client.from("content_agent_drafts").insert({ created_by: userId, intent: payload.action, source_url: payload.source.url, source_playlist_id: payload.source.playlist_id, input_fingerprint, payload, validation }).select("id,status,created_at,expires_at").single(); if (error || !data) throw new Error("draft_create_failed"); await audit(client, userId, data.id, actionLabel(payload.action), "draft", data.id, "analyzed", { phase: "analyzed", ...auditSummary(payload) }); return data as { id: string; status: string; created_at: string; expires_at: string };
}

async function getOwnedDraft(client: ReturnType<typeof createClient>, userId: string, draftId: string) { const { data, error } = await client.from("content_agent_drafts").select("id,created_by,intent,status,payload,validation,expires_at,approved_by").eq("id", draftId).maybeSingle(); if (error || !data) throw new Error("draft_not_found"); const draft = data as AgentDraftRow; if (draft.created_by !== userId) throw new Error("draft_access_denied"); if (new Date(draft.expires_at).getTime() < Date.now() && draft.status !== "executed") { await client.from("content_agent_drafts").update({ status: "expired" }).eq("id", draft.id); draft.status = "expired"; } return draft; }

async function executeDraft(client: ReturnType<typeof createClient>, userId: string, draft: AgentDraftRow) {
  const payload = draft.payload; const action = actionLabel(draft.intent);
  if (draft.intent === "course_import") {
    const fresh = await findExistingForDraft(client, payload); const validation = validateImportDraft(payload, fresh); if (!validation.valid) { await client.from("content_agent_drafts").update({ status: "failed", validation }).eq("id", draft.id); await audit(client, userId, draft.id, action, "course", null, "failed", { errors: validation.errors, ...auditSummary(payload) }); return { ok: false, status: 409, code: "final_validation_failed", message: validation.errors.join(" "), validation }; }
    const suffix = crypto.randomUUID().slice(0, 8); const { data: createdCourse, error: courseError } = await client.from("courses").insert({ title: payload.course.title, slug: safeCourseSlug(payload.course.title, suffix), description: payload.course.description, category_id: payload.course.category_id, teacher_assignment_id: payload.course.teacher_assignment_id, source_playlist_id: payload.source.playlist_id, is_published: false }).select("id,title").single();
    if (courseError || !createdCourse) throw new Error("course_create_failed");
    const lessons = payload.lessons.map((lesson) => ({ course_id: createdCourse.id, title: lesson.title, youtube_url: lesson.youtube_url, youtube_video_id: lesson.youtube_video_id, image_url: lesson.image_url, description: lesson.description, sort_order: lesson.sort_order, is_published: false })); const { error: lessonsError } = await client.from("lessons").insert(lessons); if (lessonsError) { await client.from("courses").delete().eq("id", createdCourse.id); throw new Error("lesson_create_failed"); }
    const result = { course_id: createdCourse.id, course_title: createdCourse.title, lessons_created: lessons.length, lessons_skipped: 0, published: false }; await client.from("content_agent_drafts").update({ status: "executed", executed_by: userId, executed_at: new Date().toISOString(), result }).eq("id", draft.id); await audit(client, userId, draft.id, action, "course", String(createdCourse.id), "executed", result); return { ok: true, result, message: `تم إنشاء الكورس كمسودة بنجاح. عدد الدروس المضافة: ${lessons.length}. استخدم نشر الكورس بعد مراجعته.` };
  }
  const courseId = payload.course.id; if (!courseId) return { ok: false, status: 422, code: "course_target_required", message: "اختر كورساً واحداً قبل التنفيذ." };
  if (draft.intent === "course_delete") { const { error } = await client.from("courses").delete().eq("id", courseId); if (error) throw new Error("course_delete_failed"); }
  else if (draft.intent === "course_update") { const { error } = await client.from("courses").update({ title: payload.course.title, description: payload.course.description, category_id: payload.course.category_id }).eq("id", courseId); if (error) throw new Error("course_update_failed"); }
  else { const { error } = await client.from("courses").update({ is_published: draft.intent === "publish_course" }).eq("id", courseId); if (error) throw new Error("course_publish_failed"); }
  const result = { course_id: courseId, action, published: draft.intent === "publish_course" ? true : draft.intent === "unpublish_course" ? false : undefined }; await client.from("content_agent_drafts").update({ status: "executed", executed_by: userId, executed_at: new Date().toISOString(), result }).eq("id", draft.id); await audit(client, userId, draft.id, action, "course", String(courseId), "executed", result); return { ok: true, result, message: draft.intent === "course_delete" ? "تم حذف الكورس والدروس المرتبطة به بعد اعتمادك." : draft.intent === "course_update" ? "تم تحديث الكورس بعد اعتمادك." : draft.intent === "publish_course" ? "تم نشر الكورس بعد اعتمادك." : "تم إلغاء نشر الكورس بعد اعتمادك." };
}

function previewFromDraft(draft: { id: string; status: string; expires_at?: string }, payload: CourseDraftPayload, validation: Record<string, unknown>, base: Record<string, unknown>) {
  return {
    ...base,
    intent: typeof base.intent === "string" ? base.intent : payload.action.toUpperCase(),
    source: typeof base.source === "string" ? base.source : payload.source.playlist_id ? "YouTube Playlist" : payload.source.url ? "YouTube Video" : "Content File",
    urls: Array.isArray(base.urls) ? base.urls : payload.source.url ? [payload.source.url] : [],
    playlist_items: Array.isArray(base.playlist_items) ? base.playlist_items : payload.lessons,
    resources: Array.isArray(base.resources) ? base.resources : [],
    warnings: Array.isArray(base.warnings) ? base.warnings : payload.warnings,
    draft: { id: draft.id, status: draft.status, expires_at: draft.expires_at, action: payload.action, source: payload.source, target: payload.target, course: payload.course, lessons: payload.lessons, validation },
    execution_enabled: draft.status === "approved",
  };
}

async function openRouterReply(key: string, model: string, requestId: string, input: Record<string, unknown>) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    let lastStatus = 502; for (const candidate of Array.from(new Set([model, "openai/gpt-4o-mini"]))) { logEvent("OPENROUTER_REQUEST_STARTED", requestId, { mode: "answer" }); const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", signal: controller.signal, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "HTTP-Referer": Deno.env.get("OPENROUTER_HTTP_REFERER") ?? "https://adminstudentweb.local", "X-OpenRouter-Title": Deno.env.get("OPENROUTER_APP_TITLE") ?? "Akadimiyat Masar Content Agent" }, body: JSON.stringify({ model: candidate, messages: [{ role: "system", content: PLATFORM_SYSTEM_RULES }, { role: "user", content: JSON.stringify(input) }], stream: false, temperature: 0.1, max_tokens: 900 }) }); lastStatus = upstream.status; logEvent("OPENROUTER_RESPONSE_RECEIVED", requestId, { status: upstream.status }); if (!upstream.ok) { if ((upstream.status >= 500 || upstream.status === 400) && candidate !== "openai/gpt-4o-mini") continue; return { error: { status: upstream.status, code: `openrouter_${upstream.status}`, message: upstreamMessage(upstream.status) } }; } const payload = await upstream.json() as { choices?: Array<{ message?: { content?: unknown } }> }; const content = payload.choices?.[0]?.message?.content; const text = typeof content === "string" ? content.trim() : ""; if (!text) return { error: { status: 502, code: "empty_response", message: "عاد المساعد دون إجابة نصية." } }; return { text, model: candidate }; }
    return { error: { status: 502, code: `openrouter_${lastStatus}`, message: upstreamMessage(lastStatus) } };
  } catch (error) { if (error instanceof DOMException && error.name === "AbortError") return { error: { status: 408, code: "timeout", message: "انتهت مهلة الاتصال بالمساعد. حاول مرة أخرى." } }; return { error: { status: 503, code: "openrouter_unavailable", message: "خدمة المساعد غير متاحة حالياً. حاول مرة أخرى لاحقاً." } }; } finally { clearTimeout(timeout); }
}

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID(); logEvent("REQUEST_RECEIVED", requestId, { method: req.method }); if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders }); if (req.method !== "POST") return json({ error: { code: "method_not_allowed", message: "يسمح هذا المسار بطلبات POST فقط." } }, 405);
  const authorization = req.headers.get("Authorization"); const hasBearer = Boolean(authorization?.toLowerCase().startsWith("bearer ")); logEvent("AUTH_HEADER_PRESENT", requestId, { present: hasBearer }); if (!hasBearer) return json({ error: { code: "unauthorized", message: "جلسة الإدارة غير صالحة أو انتهت." } }, 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL"); const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY"); const openRouterKey = Deno.env.get("OPENROUTER_API_KEY"); const model = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini"; if (!supabaseUrl || !supabaseAnonKey) return json({ error: { code: "server_configuration", message: "لم تكتمل إعدادات Supabase على الخادم." } }, 500);
  const token = authorization.slice(7).trim(); const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: authorization } } }); const { data: userData, error: userError } = await client.auth.getUser(token); if (userError || !userData.user) { logEvent("AUTH_FAILED", requestId, { status: 401, reason: "invalid_session" }); return json({ error: { code: "unauthorized", message: "جلسة الإدارة غير صالحة أو انتهت." } }, 401); }
  const userId = userData.user.id; logEvent("USER_AUTHENTICATED", requestId); const { data: profile, error: profileError } = await client.from("admin_profiles").select("user_id").eq("user_id", userId).eq("role", "admin").maybeSingle(); if (profileError || !profile) { logEvent("ADMIN_CHECK_FAILED", requestId, { status: profileError ? 500 : 403 }); return json({ error: { code: profileError ? "admin_check_failed" : "forbidden", message: profileError ? "تعذر التحقق من صلاحية Admin." : "هذا الحساب ليس ضمن قائمة Admin." } }, profileError ? 500 : 403); } logEvent("ADMIN_CHECK_PASSED", requestId);
  let body: { message?: unknown; action?: unknown; draft_id?: unknown; attachments?: unknown; draft_patch?: unknown; playlist_url?: unknown }; try { body = await req.json(); } catch { return json({ error: { code: "invalid_json", message: "صيغة الطلب غير صالحة." } }, 400); }
  const message = typeof body.message === "string" ? body.message.trim() : ""; const action = parseAgentAction(body.action); const draftId = typeof body.draft_id === "string" ? body.draft_id : null; const attachments = attachmentInputs(body.attachments);
  if (body.action === "test_playlist_provider") {
    const playlistUrl = typeof body.playlist_url === "string" ? body.playlist_url.trim() : "";
    if (!playlistUrl || youtubeKind(playlistUrl) !== "playlist" || !playlistIdFromUrl(playlistUrl)) return json({ error: { code: "playlist_url_invalid", message: "أرسل رابط YouTube Playlist عاماً صالحاً للاختبار." } }, 422);
    const providerKey = Deno.env.get("TRANSCRIPTAPI_API_KEY");
    if (!providerKey) return json({ error: { code: "transcriptapi_not_configured", message: "لم يتم ضبط TranscriptAPI على الخادم." } }, 503);
    logEvent("TRANSCRIPTAPI_REQUEST", requestId, { operation: "playlist_videos" });
    try {
      const provider = new TranscriptApiYouTubeProvider(providerKey);
      const result = await provider.getPlaylistVideos(playlistUrl);
      logEvent("TRANSCRIPTAPI_SUCCESS", requestId, { pages: result.pages, item_count: result.videos.length, credits_used: result.credits_used });
      logEvent("PLAYLIST_ITEMS_EXTRACTED", requestId, { item_count: result.videos.length, pages: result.pages });
      return json({ data: { provider: result.provider, playlist: result.playlist, videos: result.videos, pages: result.pages, credits_used: result.credits_used, truncated: result.truncated } });
    } catch (error) {
      const providerError = error instanceof TranscriptApiProviderError ? error : null;
      const status = providerError?.status ?? 503;
      logEvent(status === 429 ? "TRANSCRIPTAPI_RATE_LIMIT" : "TRANSCRIPTAPI_ERROR", requestId, { status, code: providerError?.message ?? "provider_request_failed" });
      return json({ error: { code: providerError?.message ?? "transcriptapi_unavailable", message: status === 429 ? "تعذر الحصول على بيانات Playlist بسبب حد مزود YouTube الخارجي." : "تعذر الحصول على بيانات Playlist من مزود YouTube الحالي.", retry_after: providerError?.retryAfter ?? undefined } }, status >= 400 && status < 600 ? status : 503);
    }
  }
  try {
    if (action !== "analyze") {
      if (!draftId) return json({ error: { code: "draft_id_required", message: "اختر مسودة صالحة أولاً." } }, 400); const draft = await getOwnedDraft(client, userId, draftId); const status = safeDraftStatus(draft.status); const blocked = approvalError(status, action); if (blocked) return json({ error: { code: "draft_state_invalid", message: blocked } }, 409);
      if (action === "cancel") { await client.from("content_agent_drafts").update({ status: "cancelled" }).eq("id", draft.id); await audit(client, userId, draft.id, actionLabel(draft.intent), "draft", draft.id, "cancelled", auditSummary(draft.payload)); return json({ data: { text: "تم إلغاء المسودة. لم يتم تغيير أي محتوى.", intent: draft.intent, preview: previewFromDraft({ id: draft.id, status: "cancelled", expires_at: draft.expires_at }, draft.payload, draft.validation, { warnings: [] }) } }); }
      if (action === "update_draft") { if (!body.draft_patch || typeof body.draft_patch !== "object") return json({ error: { code: "draft_patch_required", message: "أدخل تعديلات صالحة للمسودة." } }, 400); const patch = body.draft_patch as { course?: { title?: unknown; description?: unknown; category_id?: unknown } }; const course = { ...draft.payload.course }; if (typeof patch.course?.title === "string") course.title = patch.course.title.trim().slice(0, 220); if (typeof patch.course?.description === "string") course.description = patch.course.description.trim().slice(0, 2000) || null; if (typeof patch.course?.category_id === "number" || patch.course?.category_id === null) course.category_id = patch.course.category_id; const payload = { ...draft.payload, course }; const validation = draft.intent === "course_import" ? validateImportDraft(payload, await findExistingForDraft(client, payload)) : { valid: Boolean(course.id || draft.intent === "course_import"), errors: payload.warnings, warnings: payload.warnings, duplicate_video_ids: [], duplicate_existing_video_ids: [], existing_course_id: null }; const { error } = await client.from("content_agent_drafts").update({ payload, validation }).eq("id", draft.id); if (error) throw new Error("draft_update_failed"); await audit(client, userId, draft.id, actionLabel(draft.intent), "draft", draft.id, "updated", auditSummary(payload)); return json({ data: { text: "تم تحديث المسودة. راجعها ثم اضغط اعتماد.", intent: draft.intent, preview: previewFromDraft({ id: draft.id, status: draft.status, expires_at: draft.expires_at }, payload, validation, { warnings: validation.warnings }) } }); }
      if (action === "approve") { const validation = draft.intent === "course_import" ? validateImportDraft(draft.payload, await findExistingForDraft(client, draft.payload)) : { valid: Boolean(draft.payload.course.id), errors: draft.payload.warnings, warnings: draft.payload.warnings, duplicate_video_ids: [], duplicate_existing_video_ids: [], existing_course_id: null }; if (!validation.valid) return json({ error: { code: "draft_validation_failed", message: validation.errors.join(" ") || "لا يمكن اعتماد المسودة قبل معالجة التحذيرات." } }, 422); const { error } = await client.from("content_agent_drafts").update({ status: "approved", approved_by: userId, approved_at: new Date().toISOString(), validation }).eq("id", draft.id); if (error) throw new Error("draft_approve_failed"); await audit(client, userId, draft.id, actionLabel(draft.intent), "draft", draft.id, "approved", auditSummary(draft.payload)); return json({ data: { text: "تم اعتماد المسودة. اضغط تنفيذ لإجراء التحقق النهائي والتنفيذ.", intent: draft.intent, preview: previewFromDraft({ id: draft.id, status: "approved", expires_at: draft.expires_at }, draft.payload, validation, { warnings: validation.warnings }) } }); }
      const result = await executeDraft(client, userId, draft); if (!result.ok) return json({ error: { code: result.code, message: result.message, validation: result.validation } }, result.status ?? 422); logEvent("ACTION_EXECUTED", requestId, { action: draft.intent }); return json({ data: { text: result.message, intent: draft.intent, result: result.result, preview: previewFromDraft({ id: draft.id, status: "executed", expires_at: draft.expires_at }, draft.payload, draft.validation, { warnings: [] }) } });
    }
    if (!message) return json({ error: { code: "empty_message", message: "اكتب رسالة قبل الإرسال." } }, 400); if (message.length > 8000) return json({ error: { code: "message_too_long", message: "الرسالة طويلة جداً." } }, 413);
    const detected = detectRequest(message);
    if (attachments.length && !detected.draftIntent && /(أضف|اضف|أنشئ|انشئ|استورد|جهز|جهّز|import)/i.test(message)) {
      detected.draftIntent = "course_import";
      detected.kind = "COURSE_IMPORT";
      detected.platformRead = true;
    }
    logEvent("INTENT_DETECTED", requestId, { intent: detected.kind, url_count: detected.urls.length, attachment_count: attachments.length }); const relevantContent = detected.platformRead ? await readRelevantContent(client, message) : null; const external = detected.urls.length || attachments.length ? await gatherExternalData(detected, attachments, requestId) : null;
    if (detected.draftIntent && isDraftIntent(detected.draftIntent)) {
      const payload = detected.draftIntent === "course_import" ? buildImportDraft({ sourceUrl: detected.playlistUrls[0] ?? detected.videoUrls[0] ?? null, playlistId: external?.playlist_id ?? null, sourceTitle: external?.source_title, sourceDescription: external?.source_description, sourceChannel: external?.source_channel, items: external?.playlist_items ?? [], academic: (relevantContent?.academic_resolution as Record<string, unknown> | undefined) ?? null, warnings: [...(external?.fallback ? [external.fallback] : []), ...(external?.resources.filter((resource) => resource.error).map((resource) => `تعذر قراءة ${String(resource.type)}: ${String(resource.error)}`) ?? [])] }) : actionPayload(detected.draftIntent, await resolveActionCourse(client, message), message);
      const validation = detected.draftIntent === "course_import" ? validateImportDraft(payload, await findExistingForDraft(client, payload)) : { valid: Boolean(payload.course.id), errors: payload.warnings, warnings: payload.warnings, duplicate_video_ids: [], duplicate_existing_video_ids: [], existing_course_id: null }; const saved = await storeDraft(client, userId, payload, validation); const preview = previewFromDraft(saved, payload, validation, { intent: detected.kind, source: payload.source.playlist_id ? "YouTube Playlist" : payload.source.url ? "YouTube Video" : "Content File", urls: detected.urls, playlist_items: payload.lessons, resources: external?.resources ?? [], warnings: validation.warnings, academic_resolution: relevantContent?.academic_resolution ?? null }); logEvent("PREVIEW_GENERATED", requestId, { intent: detected.kind, item_count: payload.lessons.length, valid: validation.valid }); const text = validation.valid ? `جهزت مسودة ${payload.action === "course_import" ? "للكورس والدروس" : "للإجراء المطلوب"}. راجع المعاينة ثم اضغط اعتماد.` : `جهزت مسودة، لكنها تحتاج مراجعة قبل الاعتماد: ${validation.errors.join(" ") || validation.warnings.join(" ")}`; return json({ data: { text, intent: detected.kind, preview } });
    }
    const preview = external ? { intent: detected.kind, source: detected.playlistUrls.length ? "YouTube Playlist" : detected.videoUrls.length ? "YouTube Video" : attachments.length ? "Content File" : "External URL", urls: detected.urls, playlist_items: external.playlist_items, resources: external.resources, warnings: [...(external.fallback ? [external.fallback] : []), ...external.resources.filter((resource) => resource.error).map((resource) => `تعذر قراءة ${String(resource.type)}: ${String(resource.error)}`)], academic_resolution: relevantContent?.academic_resolution ?? null, execution_enabled: false } : null;
    if (!openRouterKey) return json({ error: { code: "server_configuration", message: "لم تكتمل إعدادات المساعد على الخادم." } }, 500);
    const answer = await openRouterReply(openRouterKey, model, requestId, { question: message, request_type: detected.kind, relevant_content: relevantContent, external_context: external ? { resources: external.resources, playlist_items: external.playlist_items, fallback: external.fallback } : null }); if ("error" in answer) { logEvent("OPENROUTER_REQUEST_FAILED", requestId, { code: answer.error.code }); return json({ error: { code: answer.error.code, message: answer.error.message } }, answer.error.status); } logEvent("RESPONSE_RETURNED", requestId, { status: 200 }); return json({ data: { text: answer.text, model: answer.model, intent: detected.kind, preview } });
  } catch (error) { const reason = errorMessage(error, "internal_error"); logEvent("INTERNAL_ERROR", requestId, { reason: reason.replace(/[^a-z_]/gi, "_").slice(0, 80) }); const status = ["draft_not_found", "draft_access_denied"].includes(reason) ? 404 : 500; return json({ error: { code: reason, message: reason.startsWith("draft_") ? "تعذر الوصول إلى مسودة الوكيل المطلوبة." : "تعذر إتمام عملية وكيل المحتوى بأمان." } }, status); }
});
