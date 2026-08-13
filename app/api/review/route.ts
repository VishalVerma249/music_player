import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const candidatesPath = path.join(dataDir, "youtube-candidates.json");
const approvedPath = path.join(dataDir, "youtube-approved.json");

type Candidate = { videoId: string; title: string; channelTitle: string; publishedAt: string; description: string; url: string; needsReview: boolean };
type SongCandidates = { id: string; title: string; artist: string; film: string; candidates: Candidate[] };
type Approval = { id: string; videoId: string; approved: boolean };

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse((await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "")) as T;
}

export async function GET() {
  try {
    const [songs, approvals] = await Promise.all([
      readJson<SongCandidates[]>(candidatesPath),
      readJson<Approval[]>(approvedPath),
    ]);
    return NextResponse.json({ songs, approvals });
  } catch {
    return NextResponse.json({ error: "Review data is unavailable. Run npm run playlist:search first." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: string; videoId?: string; approved?: boolean };
    if (!body.id || typeof body.videoId !== "string" || body.approved !== true) {
      return NextResponse.json({ error: "Select one candidate before saving." }, { status: 400 });
    }
    const [songs, approvals] = await Promise.all([
      readJson<SongCandidates[]>(candidatesPath),
      readJson<Approval[]>(approvedPath),
    ]);
    const song = songs.find((entry) => entry.id === body.id);
    if (!song || !song.candidates.some((candidate) => candidate.videoId === body.videoId)) {
      return NextResponse.json({ error: "That candidate does not belong to this song." }, { status: 400 });
    }
    const nextApprovals = approvals.map((approval) => approval.id === body.id
      ? { ...approval, videoId: body.videoId, approved: true }
      : approval);
    if (!nextApprovals.some((approval) => approval.id === body.id)) {
      nextApprovals.push({ id: body.id, videoId: body.videoId, approved: true });
    }
    await fs.writeFile(approvedPath, `${JSON.stringify(nextApprovals, null, 2)}\n`, "utf8");
    return NextResponse.json({ ok: true, approval: { id: body.id, videoId: body.videoId, approved: true } });
  } catch {
    return NextResponse.json({ error: "Could not save the approval." }, { status: 500 });
  }
}
