import { describe, expect, it } from "vitest";

describe("Supabase credentials", () => {
  it("can reach the Auth settings endpoint with the configured secret", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    expect(url).toBeTruthy();
    expect(secret).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: secret!,
        Authorization: `Bearer ${secret!}`,
      },
    });

    expect(response.status).toBe(200);
  }, 15000);
});
