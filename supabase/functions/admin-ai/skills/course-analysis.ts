import type { CourseDraftPayload, ExternalItem, LessonDraft } from "./types.ts";
// @ts-expect-error Deno Edge Functions require an explicit local module extension.
import { videoIdFromUrl } from "./youtube.ts";

const clean = (value: string) => value.replace(/\s+/g, " ").replace(/^[\-–—\s]+|[\-–—\s]+$/g, "").slice(0, 220).trim();

export function buildImportDraft(input: { sourceUrl: string | null; playlistId: string | null; sourceTitle?: string; sourceDescription?: string; sourceChannel?: string; items: ExternalItem[]; academic: Record<string, unknown> | null; warnings: string[] }): CourseDraftPayload {
  const seen = new Set<string>();
  const warnings = [...input.warnings];
  const lessons: LessonDraft[] = [];
  for (const item of input.items) {
    if (seen.has(item.video_id)) { warnings.push(`تم تجاهل فيديو مكرر داخل المصدر: ${item.video_id}.`); continue; }
    seen.add(item.video_id);
    const title = clean(item.title ?? `الدرس ${lessons.length + 1}`) || `الدرس ${lessons.length + 1}`;
    lessons.push({ title, title_source: item.title ? item.title_source : "derived", description: item.description ?? null, description_source: item.description ? item.description_source : "unavailable", youtube_url: item.url, youtube_video_id: item.video_id, image_url: item.thumbnail_url ?? null, sort_order: lessons.length + 1, original_sort_order: item.sort_order });
  }
  const academic = input.academic as { status?: "matched" | "not_matched"; stage?: { id: string } | null; subject?: { id: string } | null; teacher_assignment_id?: string | null } | null;
  const sourceTitle = clean(input.sourceTitle ?? "");
  const title = sourceTitle || "كورس مستورد من YouTube";
  const description = input.sourceDescription ? clean(input.sourceDescription).slice(0, 2000) : input.sourceChannel ? `محتوى تعليمي من قناة ${clean(input.sourceChannel)}. راجع الوصف قبل النشر.` : "مسودة محتوى مستوردة من مصدر خارجي. راجع الوصف قبل النشر.";
  return { version: 1, action: "course_import", source: { url: input.sourceUrl, playlist_id: input.playlistId, title: sourceTitle || null, description: input.sourceDescription ?? null, channel: input.sourceChannel ?? null, item_count: lessons.length }, target: { stage_id: academic?.stage?.id ?? null, subject_id: academic?.subject?.id ?? null, teacher_assignment_id: academic?.teacher_assignment_id ?? null, status: academic?.status === "matched" ? "matched" : academic ? "not_matched" : "not_requested" }, course: { title, description, category_id: null, teacher_assignment_id: academic?.teacher_assignment_id ?? null, source_playlist_id: input.playlistId, is_published: false }, lessons, warnings, provenance: { title: sourceTitle ? "source_page" : "derived", description: input.sourceDescription ? "source_page" : "derived" } };
}

export function normalizeAttachmentRows(rows: Array<Record<string, unknown>>) {
  const items: ExternalItem[] = [];
  const warnings: string[] = [];
  for (const [index, row] of rows.slice(0, 200).entries()) {
    const url = String(row.youtube_url ?? row.youtubeUrl ?? row.url ?? row.link ?? "").trim();
    const video_id = url ? videoIdFromUrl(url) : null;
    if (!video_id) { warnings.push(`تعذر قراءة رابط YouTube في صف الملف ${index + 1}.`); continue; }
    const title = String(row.title ?? row.name ?? "").trim();
    const description = String(row.description ?? row.desc ?? "").trim();
    items.push({ video_id, url, title: title || undefined, description: description || undefined, sort_order: Number(row.sort_order ?? row.order ?? index + 1) || index + 1, title_source: "file", description_source: description ? "file" : "unavailable" });
  }
  return { items, warnings };
}
