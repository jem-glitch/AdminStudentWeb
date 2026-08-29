import { describe, expect, it, vi } from "vitest";

import { buildImportDraft, normalizeAttachmentRows } from "../supabase/functions/admin-ai/skills/course-analysis";
import { approvalError } from "../supabase/functions/admin-ai/skills/approval-safety";
import { validateImportDraft } from "../supabase/functions/admin-ai/skills/validation";
import { playlistIdFromUrl, videoIdFromUrl } from "../supabase/functions/admin-ai/skills/youtube";
import { TranscriptApiProviderError, TranscriptApiYouTubeProvider } from "../supabase/functions/admin-ai/skills/youtube-provider";

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

  it("follows continuation tokens and preserves playlist order", async () => {
    const originalFetch = globalThis.fetch;
    let call = 0;
    vi.stubGlobal("fetch", async () => {
      call += 1;
      const body = call === 1
        ? { playlist_info: { title: "Test Playlist", numVideos: 2 }, results: [{ videoId: "dQw4w9WgXcQ", title: "One", index: 0 }], has_more: true, continuation_token: "next-page" }
        : { results: [{ videoId: "NfCo2LdZRew", title: "Two", index: 1 }], has_more: false };
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    try {
      const result = await new TranscriptApiYouTubeProvider("test-key").getPlaylistVideos("PL123456");
      expect(call).toBe(2);
      expect(result.pages).toBe(2);
      expect(result.credits_used).toBe(2);
      expect(result.videos.map((video) => video.video_id)).toEqual(["dQw4w9WgXcQ", "NfCo2LdZRew"]);
      expect(result.videos.map((video) => video.position)).toEqual([1, 2]);
    } finally {
      vi.stubGlobal("fetch", originalFetch);
    }
  });

  it("preserves provider status and Retry-After for rate-limit handling", async () => {
    const originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async () => new Response("", { status: 429, headers: { "Retry-After": "30" } }));
    try {
      await expect(new TranscriptApiYouTubeProvider("test-key").getPlaylistVideos("PL123456")).rejects.toMatchObject({ status: 429, retryAfter: "30" } satisfies Partial<TranscriptApiProviderError>);
    } finally {
      vi.stubGlobal("fetch", originalFetch);
    }
  });

  it.each([401, 402, 403, 404, 408, 422])("surfaces provider HTTP status %s without retrying", async (status) => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    vi.stubGlobal("fetch", async () => { calls += 1; return new Response("", { status }); });
    try {
      await expect(new TranscriptApiYouTubeProvider("test-key").getPlaylistVideos("PL123456")).rejects.toMatchObject({ status });
      expect(calls).toBe(1);
    } finally {
      vi.stubGlobal("fetch", originalFetch);
    }
  });
});
