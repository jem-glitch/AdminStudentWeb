import { describe, expect, it } from "vitest";

describe("TranscriptAPI server secret", () => {
  it("authenticates without exposing the key", async () => {
    const key = process.env.TRANSCRIPTAPI_API_KEY;
    expect(key).toBeTruthy();

    const response = await fetch(
      "https://transcriptapi.com/api/v2/youtube/playlist/videos?playlist=invalid-playlist-id",
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "User-Agent": "AkadimiyatMasarAdminAI/1.0",
        },
      },
    );

    // An invalid playlist may return a validation/not-found/quota response, but
    // an auth failure means the server-side secret is not usable.
    expect([401, 403]).not.toContain(response.status);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  }, 30_000);
});
