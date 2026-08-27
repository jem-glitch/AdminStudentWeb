import type { CourseDraftPayload, ValidationResult } from "./types.ts";

export function validateImportDraft(payload: CourseDraftPayload, existing: { courseId: number | null; existingVideoIds: string[] }): ValidationResult {
  const errors: string[] = [];
  const warnings = [...payload.warnings];
  if (payload.target.status !== "matched" || !payload.course.teacher_assignment_id) errors.push("لا يوجد Teacher Assignment مطابق للمسودة.");
  if (payload.course.title.trim().length < 3) errors.push("عنوان الكورس قصير أو مفقود.");
  if (!payload.lessons.length) errors.push("لا توجد دروس صالحة للإدراج.");
  const ids = payload.lessons.map((lesson) => lesson.youtube_video_id);
  const duplicate_video_ids = ids.filter((id, index) => ids.indexOf(id) !== index).filter((id, index, list) => list.indexOf(id) === index);
  if (duplicate_video_ids.length) errors.push("توجد فيديوهات مكررة داخل المسودة.");
  const invalid = payload.lessons.filter((lesson, index) => !/^[A-Za-z0-9_-]{6,20}$/.test(lesson.youtube_video_id) || !/^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(lesson.youtube_url) || lesson.sort_order !== index + 1);
  if (invalid.length) errors.push("توجد روابط أو Video IDs أو ترتيبات غير صالحة.");
  const duplicate_existing_video_ids = ids.filter((id) => existing.existingVideoIds.includes(id));
  if (duplicate_existing_video_ids.length) errors.push("يوجد فيديو مضاف مسبقاً داخل الكورس المستهدف.");
  if (existing.courseId) warnings.push("يبدو أن كورساً من القائمة نفسها موجود بالفعل؛ لن يتم إنشاء نسخة مكررة.");
  return { valid: errors.length === 0 && !existing.courseId, errors, warnings, duplicate_video_ids, duplicate_existing_video_ids, existing_course_id: existing.courseId };
}
