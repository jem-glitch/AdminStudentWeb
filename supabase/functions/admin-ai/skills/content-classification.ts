import type { DraftIntent, IntentKind } from "./types.ts";
import { extractUrls, youtubeKind } from "./youtube.ts";

export type DetectedRequest = { kind: IntentKind; urls: string[]; playlistUrls: string[]; videoUrls: string[]; platformRead: boolean; draftIntent: DraftIntent | null };

function hasAcademicTerms(value: string) { return /(صف|صفوف|مادة|مواد|مرحلة|خامس|سادس|علمي|مدرس|مدرسين|أستاذ|استاذ|معلم|كورس|كورسات|دورة|دورات|درس|دروس|حلقة|حلقات|course|teacher)/i.test(value); }

export function detectRequest(message: string): DetectedRequest {
  const urls = extractUrls(message);
  const playlistUrls = urls.filter((url) => youtubeKind(url) === "playlist");
  const videoUrls = urls.filter((url) => youtubeKind(url) === "video");
  const text = message.replace(/https?:\/\/[^\s<>"']+/gi, " ");
  const isDelete = /(احذف|حذف|delete)/i.test(text);
  const isUpdate = /(عدل|تعديل|حدّث|تحديث|rename|update)/i.test(text);
  const isPublish = /(انشر|نشر|publish)/i.test(text);
  const isUnpublish = /(اخف|إخفاء|الغاء النشر|إلغاء النشر|unpublish)/i.test(text);
  const isImport = /(أضف|اضف|أنشئ|انشئ|استورد|جهز|جهّز|ضعها|ضع هذا|import)/i.test(text) && urls.length > 0;
  const draftIntent: DraftIntent | null = isDelete ? "course_delete" : isUpdate ? "course_update" : isUnpublish ? "unpublish_course" : isPublish ? "publish_course" : isImport ? "course_import" : null;
  const platformRead = hasAcademicTerms(text);
  let kind: IntentKind = platformRead ? "PLATFORM_READ" : "CHAT";
  if (draftIntent === "course_import") kind = "COURSE_IMPORT";
  else if (draftIntent === "course_update") kind = "COURSE_UPDATE";
  else if (draftIntent === "course_delete") kind = "COURSE_DELETE";
  else if (draftIntent?.includes("publish")) kind = "PUBLISH";
  else if (urls.length) kind = platformRead ? "MIXED" : playlistUrls.length ? "YOUTUBE_PLAYLIST" : videoUrls.length === urls.length ? "YOUTUBE_VIDEO" : "EXTERNAL_URL";
  return { kind, urls, playlistUrls, videoUrls, platformRead, draftIntent };
}
