import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const searchesPath = path.join(process.cwd(), "data", "add-song-searches.json");
const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
type Candidate = { videoId: string; title: string; channelTitle: string; description: string; publishedAt: string; thumbnailUrl: string; url: string };
type SearchRecord = { searchId: string; title: string; artist: string; film: string; candidates: Candidate[]; createdAt: number };

async function readSearches(): Promise<SearchRecord[]> {
  try { return JSON.parse((await fs.readFile(searchesPath, "utf8")).replace(/^\uFEFF/, "")) as SearchRecord[]; } catch { return []; }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { title?: unknown; artist?: unknown; film?: unknown };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const artist = typeof body.artist === "string" ? body.artist.trim() : "";
    const film = typeof body.film === "string" ? body.film.trim() : "";
    if (!title || !artist) return NextResponse.json({ error: "Song title and artist are required." }, { status: 400 });
    const apiKey = process.env.YOUTUBE_API_KEY || "";
    if (!apiKey) return NextResponse.json({ error: "YouTube search is not configured. Add YOUTUBE_API_KEY to .env.local." }, { status: 503 });
    const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
    endpoint.searchParams.set("part", "snippet"); endpoint.searchParams.set("type", "video"); endpoint.searchParams.set("maxResults", "5");
    endpoint.searchParams.set("q", [title, artist, film].filter(Boolean).join(" ")); endpoint.searchParams.set("key", apiKey);
    const response = await fetch(endpoint);
    if (!response.ok) return NextResponse.json({ error: "YouTube search failed. Check the API configuration and quota." }, { status: 502 });
    const payload = await response.json() as { items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; description?: string; publishedAt?: string; thumbnails?: { medium?: { url?: string }; default?: { url?: string } } } }> };
    const candidates = (payload.items ?? []).flatMap((item): Candidate[] => {
      const videoId = item.id?.videoId; if (!videoId || !videoIdPattern.test(videoId)) return [];
      const snippet = item.snippet ?? {};
      return [{ videoId, title: snippet.title ?? "Untitled video", channelTitle: snippet.channelTitle ?? "Unknown channel", description: snippet.description ?? "", publishedAt: snippet.publishedAt ?? "", thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg", url: "https://www.youtube.com/watch?v=" + videoId }];
    });
    if (!candidates.length) return NextResponse.json({ error: "No YouTube candidates were found." }, { status: 404 });
    const record: SearchRecord = { searchId: randomUUID(), title, artist, film, candidates, createdAt: Date.now() };
    const searches = (await readSearches()).filter((entry) => Date.now() - entry.createdAt < 30 * 60 * 1000);
    searches.push(record);
    await fs.writeFile(searchesPath, JSON.stringify(searches, null, 2) + "\n", "utf8");
    return NextResponse.json({ searchId: record.searchId, candidates });
  } catch { return NextResponse.json({ error: "Could not search YouTube." }, { status: 500 }); }
}
