import { describe, expect, it } from "vitest";

describe("OpenRouter server secret", () => {
  it("is configured only in the server-side test environment", () => {
    const key = process.env.OPENROUTER_API_KEY;
    expect(key).toBeTruthy();
    expect(key).not.toMatch(/placeholder|your[_-]?key/i);
  });

  it.skipIf(process.env.RUN_OPENROUTER_INTEGRATION_TEST !== "true")(
    "accepts the configured key when explicit live integration testing is enabled",
    async () => {
      const key = process.env.OPENROUTER_API_KEY;
      const response = await fetch("https://openrouter.ai/api/v1/key", {
        headers: { Authorization: `Bearer ${key}` },
      });
      expect(response.status).toBe(200);
      const payload = (await response.json()) as { data?: unknown };
      expect(payload.data).toBeDefined();
    },
    30_000,
  );
});
