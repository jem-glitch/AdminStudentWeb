export type IntentKind = "CHAT" | "PLATFORM_READ" | "EXTERNAL_URL" | "YOUTUBE_PLAYLIST" | "YOUTUBE_VIDEO" | "COURSE_IMPORT" | "COURSE_UPDATE" | "COURSE_DELETE" | "PUBLISH" | "MIXED";
export type DraftIntent = "course_import" | "course_update" | "course_delete" | "publish_course" | "unpublish_course";
export type AgentAction = "analyze" | "approve" | "execute" | "cancel" | "update_draft";

export type ExternalItem = {
  video_id: string;
  url: string;
  title?: string;
  description?: string;
  channel?: string;
  thumbnail_url?: string;
  sort_order: number;
  title_source: "source_page" | "file" | "derived";
  description_source: "source_page" | "file" | "unavailable";
};

export type AttachmentInput = {
  name: string;
  mime_type?: string;
  rows?: Array<Record<string, unknown>>;
  text?: string;
};

export type LessonDraft = {
  title: string;
  title_source: "source_page" | "file" | "derived";
  description: string | null;
  description_source: "source_page" | "file" | "unavailable";
  youtube_url: string;
  youtube_video_id: string;
  image_url: string | null;
  sort_order: number;
  original_sort_order: number;
};

export type CourseDraftPayload = {
  version: 1;
  action: DraftIntent;
  source: { url: string | null; playlist_id: string | null; title: string | null; description: string | null; channel: string | null; item_count: number };
  target: { stage_id: string | null; subject_id: string | null; teacher_assignment_id: string | null; status: "matched" | "not_matched" | "not_requested" };
  course: { id?: number; title: string; description: string | null; category_id: number | null; teacher_assignment_id: string | null; source_playlist_id: string | null; is_published: boolean };
  lessons: LessonDraft[];
  warnings: string[];
  provenance: { title: "source_page" | "file" | "derived"; description: "source_page" | "file" | "derived" | "unavailable" };
};

export type ValidationResult = { valid: boolean; errors: string[]; warnings: string[]; duplicate_video_ids: string[]; duplicate_existing_video_ids: string[]; existing_course_id: number | null };
