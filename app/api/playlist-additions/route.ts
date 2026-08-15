import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PlaylistAddition = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number | null;
  duration: number | null;
  videoId: string;
  playlist: string;
};

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "playlist-additions.json");
    const additions = JSON.parse((await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "")) as PlaylistAddition[];
    return NextResponse.json({ additions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Playlist additions are unavailable." }, { status: 500 });
  }
}
