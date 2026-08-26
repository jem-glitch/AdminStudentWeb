import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError = !supabaseUrl || !supabasePublishableKey
  ? "لم يتم ضبط VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY في إعدادات Netlify."
  : null;

if (supabaseConfigError) console.warn(supabaseConfigError);

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabasePublishableKey ?? "placeholder-publishable-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export type SupabaseCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
};

export type SupabaseCourse = {
  id: number;
  category_id: number | null;
  title: string;
  alternate_title: string | null;
  slug: string;
  description: string | null;
  instructor: string | null;
  image_url: string | null;
  cover_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type SupabaseLesson = {
  id: number;
  course_id: number;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export function extractYoutubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const segments = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(segments[0] ?? "")) return segments[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function isValidYoutubeVideoId(value: string | null): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{6,20}$/.test(value));
}
