import type { ExternalItem } from "./types.ts";

export function extractUrls(message: string) { return Array.from(new Set((message.match(/https?:\/\/[^\s<>"']+/gi) ?? []).map((raw) => raw.replace(/[),.;!?؟،؛]+$/g, "")))); }
export function isYoutubeHost(hostname: string) { const host = hostname.toLowerCase().replace(/^www\./, ""); return host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be"; }
export function youtubeKind(url: string) {
  try { const parsed = new URL(url); if (!isYoutubeHost(parsed.hostname)) return null; if (parsed.hostname.replace(/^www\./, "") === "youtu.be") return "video" as const; if (parsed.pathname === "/playlist" && parsed.searchParams.has("list")) return "playlist" as const; if (parsed.searchParams.has("list") && parsed.searchParams.has("v")) return "playlist" as const; if (["/watch", "/embed/", "/shorts/", "/live/"].some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(prefix))) return "video" as const; } catch { return null; }
  return null;
}
export function videoIdFromUrl(rawUrl: string) { try { const parsed = new URL(rawUrl); if (!isYoutubeHost(parsed.hostname)) return null; if (parsed.hostname.replace(/^www\./, "") === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null; return parsed.searchParams.get("v") ?? (parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null); } catch { return null; } }
export function playlistIdFromUrl(rawUrl: string) { try { const parsed = new URL(rawUrl); return isYoutubeHost(parsed.hostname) ? parsed.searchParams.get("list") : null; } catch { return null; } }
export function isValidVideoId(value: string | null) { return Boolean(value && /^[A-Za-z0-9_-]{6,20}$/.test(value)); }
export function titleFromHtml(html: string) { const og = html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']{1,300})/i); const title = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i); return (og?.[1] ?? title?.[1])?.replace(/\s+/g, " ").replace(/\s*-\s*YouTube\s*$/i, "").trim() || undefined; }
export function descriptionFromHtml(html: string) { const match = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']{1,1000})/i); return match?.[1]?.replace(/\s+/g, " ").trim() || undefined; }
export function thumbnailFromHtml(html: string) { const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](https?:\/\/[^"']+)/i); return match?.[1] || undefined; }
export function channelFromHtml(html: string) { const match = html.match(/<link[^>]+itemprop=["']name["'][^>]+content=["']([^"']{1,200})/i); return match?.[1]?.trim() || undefined; }
export function extractPlaylistItems(html: string) {
  const ids = Array.from(new Set(Array.from(html.matchAll(/"videoId":"([A-Za-z0-9_-]{6,20})"/g)).map((match) => match[1])));
  return ids.map((video_id, index) => ({ video_id, url: `https://www.youtube.com/watch?v=${video_id}`, sort_order: index + 1, title_source: "derived", description_source: "unavailable" } satisfies ExternalItem));
}
