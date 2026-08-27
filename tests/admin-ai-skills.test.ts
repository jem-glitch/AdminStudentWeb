import { describe, expect, it } from "vitest";

import { buildImportDraft, normalizeAttachmentRows } from "../supabase/functions/admin-ai/skills/course-analysis";
import { approvalError } from "../supabase/functions/admin-ai/skills/approval-safety";
import { validateImportDraft } from "../supabase/functions/admin-ai/skills/validation";
import { playlistIdFromUrl, videoIdFromUrl } from "../supabase/functions/admin-ai/skills/youtube";

const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

describe("content-agent skills", () => {
  it("extracts a YouTube Video ID and a Playlist ID locally", () => {
    expect(videoIdFromUrl(videoUrl)).toBe("dQw4w9WgXcQ");
    expect(playlistIdFromUrl("https://www.youtube.com/playlist?list=PL1234567890")).toBe("PL1234567890");
    expect(videoIdFromUrl("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("normalizes supported file rows and rejects invalid Video IDs", () => {
    const parsed = normalizeAttachmentRows([
      { title: "درس صالح", youtube_url: videoUrl, sort_order: "2", description: "وصف" },
      { title: "درس غير صالح", youtube_url: "https://example.com/video", sort_order: "3" },
    ]);

    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]).toMatchObject({ title: "درس صالح", video_id: "dQw4w9WgXcQ", sort_order: 2 });
    expect(parsed.warnings).toHaveLength(1);
  });

  it("warns when source duplicates are normalized and blocks corrupted duplicate Drafts", () => {
    const payload = buildImportDraft({
      sourceUrl: null,
      playlistId: null,
      items: [
        { video_id: "dQw4w9WgXcQ", url: videoUrl, title: "درس أول", sort_order: 1, title_source: "file", description_source: "unavailable" },
        { video_id: "dQw4w9WgXcQ", url: videoUrl, title: "درس مكرر", sort_order: 2, title_source: "file", description_source: "unavailable" },
      ],
      academic: { status: "matched", stage: { id: "stage" }, subject: { id: "subject" }, teacher_assignment_id: "assignment" },
      warnings: [],
    });

    expect(payload.lessons).toHaveLength(1);
    expect(payload.warnings).toContain("تم تجاهل فيديو مكرر داخل المصدر: dQw4w9WgXcQ.");
    const duplicatePayload = { ...payload, lessons: [...payload.lessons, { ...payload.lessons[0], sort_order: 2 }] };
    const validation = validateImportDraft(duplicatePayload, { courseId: null, existingVideoIds: [] });
    expect(validation.valid).toBe(false);
    expect(validation.duplicate_video_ids).toEqual(["dQw4w9WgXcQ"]);
  });

  it("reports an executed Draft as non-repeatable before generic approval validation", () => {
    expect(approvalError("executed", "execute")).toBe("هذه المسودة نُفذت سابقاً ولا يمكن تنفيذها مرة أخرى.");
  });
});
