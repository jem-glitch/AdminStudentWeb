import type { CourseDraftPayload, DraftIntent } from "./types.ts";

export async function fingerprint(value: unknown) { const bytes = new TextEncoder().encode(JSON.stringify(value)); const hash = await crypto.subtle.digest("SHA-256", bytes); return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
export function safeCourseSlug(title: string, suffix: string) { const normalized = title.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 150); return `${normalized || "course"}-${suffix}`.slice(0, 220); }
export function auditSummary(payload: CourseDraftPayload | Record<string, unknown>) { const course = (payload as { course?: { title?: string } }).course; const lessons = (payload as { lessons?: unknown[] }).lessons; return { course_title: course?.title ?? null, lesson_count: Array.isArray(lessons) ? lessons.length : 0 }; }
export function actionLabel(intent: DraftIntent) { return ({ course_import: "create_course", course_update: "update_course", course_delete: "delete_course", publish_course: "publish_course", unpublish_course: "unpublish_course" } as Record<DraftIntent, string>)[intent]; }
