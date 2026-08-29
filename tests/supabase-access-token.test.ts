import { describe, expect, it } from "vitest";

describe("Supabase management access token", () => {
  it("can authenticate a lightweight project listing request", async () => {
    const token = process.env.SUPABASE_ACCESS_TOKEN;
    expect(token).toBeTruthy();

    const response = await fetch("https://api.supabase.com/v1/projects?limit=1", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    expect(response.status).toBe(200);
    const payload = await response.json() as unknown;
    expect(Array.isArray(payload)).toBe(true);
  }, 30_000);
});
