import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "https://blilfynbajhcleiknbtk.supabase.co";
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_4t7vm8z-4aNON6Nae3HeGw_A-JlY6P6";

export const supabaseConfigError = null;

if (supabaseConfigError) console.warn(supabaseConfigError);

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
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
  teacher_assignment_id: string | null;
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

export type SupabaseStage = { id: string; name: string; slug: string; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
export type SupabaseSubject = { id: string; name: string; slug: string; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
export type SupabaseStageSubject = { id: string; stage_id: string; subject_id: string; created_at: string };
export type SupabaseTeacher = { id: string; display_name: string; slug: string; is_active: boolean; created_at: string; updated_at: string };
export type SupabaseTeacherAssignment = { id: string; stage_subject_id: string; teacher_id: string; created_at: string; updated_at: string };
