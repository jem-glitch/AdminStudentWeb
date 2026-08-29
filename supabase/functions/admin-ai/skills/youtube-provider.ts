import type { ExternalItem } from "./types.ts";

export type PlaylistVideoMetadata = {
  video_id: string;
  title: string | null;
  position: number;
  url: string;
  thumbnail_url: string | null;
  duration: string | null;
  description: string | null;
  channel: string | null;
};

export type PlaylistMetadata = {
  playlist_id: string | null;
  title: string | null;
  description: string | null;
  channel_name: string | null;
  video_count: number | null;
};

export type PlaylistIngestionResult = {
  provider: string;
  playlist: PlaylistMetadata;
  videos: PlaylistVideoMetadata[];
  pages: number;
  credits_used: number | null;
  truncated: boolean;
};

export interface YouTubePlaylistProvider {
  getPlaylistMetadata(input: string): Promise<PlaylistMetadata>;
  getPlaylistVideos(input: string): Promise<PlaylistIngestionResult>;
  getVideoMetadata?(videoId: string): Promise<PlaylistVideoMetadata | null>;
  getTranscript?(videoId: string): Promise<string | null>;
}

export class TranscriptApiProviderError extends Error {
  readonly status: number | null;
  readonly retryAfter: string | null;
  readonly provider = "transcriptapi";

  constructor(code: string, status: number | null = null, retryAfter: string | null = null) {
    super(code);
    this.name = "TranscriptApiProviderError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type TranscriptApiResponse = {
  results?: Array<{
    videoId?: unknown;
    title?: unknown;
    channelTitle?: unknown;
    thumbnails?: Array<{ url?: unknown }>;
    lengthText?: unknown;
    description?: unknown;
    index?: unknown;
  }>;
  playlist_info?: {
    title?: unknown;
    description?: unknown;
    ownerName?: unknown;
    numVideos?: unknown;
  };
  continuation_token?: unknown;
  has_more?: unknown;
};

const API_BASE = "https://transcriptapi.com/api/v2";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_PAGES = 50;
const MAX_ITEMS = 5_000;

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function safePlaylistId(input: string): string | null {
  try {
    const url = new URL(input);
    return url.searchParams.get("list") || null;
  } catch {
    return /^[A-Za-z0-9_-]{6,120}$/.test(input.trim()) ? input.trim() : null;
  }
}

function toVideo(item: NonNullable<TranscriptApiResponse["results"]>[number], fallbackPosition: number): PlaylistVideoMetadata | null {
  const videoId = textOrNull(item.videoId);
  if (!videoId || !/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) return null;
  const rawIndex = parseCount(item.index);
  return {
    video_id: videoId,
    title: textOrNull(item.title),
    position: rawIndex === null ? fallbackPosition : rawIndex + 1,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail_url: textOrNull(item.thumbnails?.[0]?.url),
    duration: textOrNull(item.lengthText),
    description: textOrNull(item.description),
    // TranscriptAPI returned a view-count-like value in channelTitle for this response; do not promote it to metadata.
    channel: null,
  };
}

export class TranscriptApiYouTubeProvider implements YouTubePlaylistProvider {
  private readonly apiKey: string;
  private readonly userAgent: string;

  constructor(apiKey: string, userAgent = "AkadimiyatMasarAdminAI/1.0") {
    if (!apiKey.trim()) throw new TranscriptApiProviderError("provider_key_missing");
    this.apiKey = apiKey;
    this.userAgent = userAgent;
  }

  private async request(params: { playlist?: string; continuation?: string }): Promise<TranscriptApiResponse> {
    const query = new URLSearchParams();
    if (params.playlist) query.set("playlist", params.playlist);
    if (params.continuation) query.set("continuation", params.continuation);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE}/youtube/playlist/videos?${query.toString()}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, "User-Agent": this.userAgent, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new TranscriptApiProviderError(`provider_http_${response.status}`, response.status, response.headers.get("retry-after"));
      const payload = await response.json() as TranscriptApiResponse;
      return payload;
    } catch (error) {
      if (error instanceof TranscriptApiProviderError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") throw new TranscriptApiProviderError("provider_timeout");
      throw new TranscriptApiProviderError("provider_request_failed");
    } finally {
      clearTimeout(timeout);
    }
  }

  async getPlaylistMetadata(input: string): Promise<PlaylistMetadata> {
    const payload = await this.request({ playlist: input });
    const info = payload.playlist_info ?? {};
    return {
      playlist_id: safePlaylistId(input),
      title: textOrNull(info.title),
      description: textOrNull(info.description),
      channel_name: textOrNull(info.ownerName),
      video_count: parseCount(info.numVideos),
    };
  }

  async getPlaylistVideos(input: string): Promise<PlaylistIngestionResult> {
    const playlist: PlaylistMetadata = { playlist_id: safePlaylistId(input), title: null, description: null, channel_name: null, video_count: null };
    const videos: PlaylistVideoMetadata[] = [];
    const seen = new Set<string>();
    let continuation: string | undefined;
    let pages = 0;
    let truncated = false;

    while (pages < MAX_PAGES && videos.length < MAX_ITEMS) {
      const payload = await this.request(continuation ? { continuation } : { playlist: input });
      pages += 1;
      const info = payload.playlist_info ?? {};
      playlist.title ||= textOrNull(info.title);
      playlist.description ||= textOrNull(info.description);
      playlist.channel_name ||= textOrNull(info.ownerName);
      playlist.video_count ||= parseCount(info.numVideos);
      for (const item of payload.results ?? []) {
        const video = toVideo(item, videos.length);
        if (video && !seen.has(video.video_id)) { seen.add(video.video_id); videos.push(video); }
        if (videos.length >= MAX_ITEMS) { truncated = true; break; }
      }
      const next = textOrNull(payload.continuation_token);
      if (payload.has_more === true && next && pages < MAX_PAGES && videos.length < MAX_ITEMS) continuation = next;
      else { truncated = payload.has_more === true && (!next || pages >= MAX_PAGES || videos.length >= MAX_ITEMS); break; }
    }

    return { provider: "transcriptapi", playlist, videos, pages, credits_used: pages, truncated };
  }
}

export function toExternalItems(result: PlaylistIngestionResult): ExternalItem[] {
  return result.videos.map((video, index) => ({
    video_id: video.video_id,
    url: video.url,
    title: video.title ?? undefined,
    description: video.description ?? undefined,
    channel: video.channel ?? undefined,
    thumbnail_url: video.thumbnail_url ?? undefined,
    sort_order: index + 1,
    title_source: video.title ? "source_page" : "derived",
    description_source: video.description ? "source_page" : "unavailable",
  }));
}
