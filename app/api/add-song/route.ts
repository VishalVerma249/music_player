import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { PLAYLISTS } from "../../../data/playlists";

export const runtime = "nodejs";
const dataDir = path.join(process.cwd(), "data");
const searchesPath = path.join(dataDir, "add-song-searches.json");
const additionsPath = path.join(dataDir, "playlist-additions.json");
const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
type Candidate = { videoId: string; title: string; channelTitle: string; description: string; publishedAt: string; thumbnailUrl: string; url: string };
type SearchRecord = { searchId: string; title: string; artist: string; film: string; candidates: Candidate[]; createdAt: number };
type Addition = { id: string; title: string; artist: string; film: string; year: number | null; duration: number | null; videoId: string; playlist: string };

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try { return JSON.parse((await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "")) as T; } catch { return fallback; }
}
function slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "song"; }

export async function POST(request: Request) {
  try {
    const body = await request.json() as { searchId?: unknown; videoId?: unknown; playlist?: unknown };
    const searchId = typeof body.searchId === "string" ? body.searchId : "";
    const videoId = typeof body.videoId === "string" ? body.videoId : "";
    const playlist = typeof body.playlist === "string" ? body.playlist : "";
    if (!searchId || !videoId || !PLAYLISTS[playlist]) return NextResponse.json({ error: "Choose a valid playlist and YouTube candidate." }, { status: 400 });
    if (!videoIdPattern.test(videoId)) return NextResponse.json({ error: "The selected YouTube candidate is invalid." }, { status: 400 });
    const searches = await readJson<SearchRecord[]>(searchesPath, []);
    const search = searches.find((entry) => entry.searchId === searchId && Date.now() - entry.createdAt < 30 * 60 * 1000);
    const candidate = search?.candidates.find((entry) => entry.videoId === videoId);
    if (!search || !candidate) return NextResponse.json({ error: "Select a candidate from the current YouTube search." }, { status: 400 });
    const additions = await readJson<Addition[]>(additionsPath, []);
    const allTracks = Object.values(PLAYLISTS).flatMap((entry) => entry.tracks);
    if (allTracks.some((track) => track.videoId === videoId) || additions.some((track) => track.videoId === videoId)) return NextResponse.json({ error: "This YouTube video is already in your playlist." }, { status: 409 });
    const duplicateDetails = [...allTracks, ...additions].some((track) => track.title.toLowerCase() === search.title.toLowerCase() && track.artist.toLowerCase() === search.artist.toLowerCase());
    const addition: Addition = { id: "add-" + slug(search.title) + "-" + videoId, title: search.title, artist: search.artist, film: search.film, year: null, duration: null, videoId, playlist };
    additions.push(addition);
    await fs.writeFile(additionsPath, JSON.stringify(additions, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true, song: addition, warning: duplicateDetails ? "A song with the same title and artist already exists; this video was still added." : undefined });
  } catch { return NextResponse.json({ error: "Could not save the song. Check that the data files are writable." }, { status: 500 }); }
}
