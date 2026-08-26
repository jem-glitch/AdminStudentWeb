import { describe, expect, it } from "vitest";

describe("OpenRouter server secret", () => {
  it("accepts the configured key without exposing it", async () => {
    const key = process.env.OPENROUTER_API_KEY;
    expect(key).toBeTruthy();
    const response = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${key}` },
    });
    expect(response.status).toBe(200);
    const payload = await response.json() as { data?: unknown };
    expect(payload.data).toBeDefined();
  }, 30_000);
});
