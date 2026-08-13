"use client";

import { useEffect, useMemo, useState } from "react";

type Candidate = { videoId: string; title: string; channelTitle: string; publishedAt: string; description: string; url: string; needsReview: boolean };
type Song = { id: string; title: string; artist: string; film: string; candidates: Candidate[] };
type Approval = { id: string; videoId: string; approved: boolean };

function CandidateCard({ song, candidate, selected, saving, onSelect }: { song: Song; candidate: Candidate; selected: boolean; saving: boolean; onSelect: () => void }) {
  return <article className={`relative overflow-hidden rounded-2xl border p-3 transition ${selected ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/[.04] hover:border-white/30"}`}>
    <a href={candidate.url} target="_blank" rel="noreferrer" className="block">
      <img src={`https://i.ytimg.com/vi/${candidate.videoId}/hqdefault.jpg`} alt="" className="mb-3 aspect-video w-full rounded-xl object-cover" />
      <h3 className="line-clamp-2 text-sm font-semibold text-white">{candidate.title}</h3>
      <p className="mt-1 truncate text-xs text-white/60">{candidate.channelTitle}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/45">{candidate.description}</p>
    </a>
    <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold text-amber-100">
      <input type="radio" name={`song-${song.id}`} checked={selected} disabled={saving} onChange={onSelect} />
      {selected ? "Selected" : "Select this candidate"}
    </label>
  </article>;
}

export default function ReviewPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading review data…");

  useEffect(() => {
    fetch("/api/review").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load review data.");
      setSongs(data.songs); setApprovals(data.approvals); setMessage("");
    }).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  const filteredSongs = useMemo(() => songs.filter((song) => `${song.title} ${song.artist} ${song.film}`.toLowerCase().includes(query.toLowerCase())), [songs, query]);
  const approvedCount = approvals.filter((approval) => approval.approved && approval.videoId).length;
  const selectedId = (songId: string) => approvals.find((approval) => approval.id === songId && approval.approved)?.videoId || "";

  async function selectCandidate(songId: string, videoId: string) {
    setSavingId(songId); setMessage("Saving approval…");
    try {
      const response = await fetch("/api/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: songId, videoId, approved: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save approval.");
      setApprovals((current) => current.map((approval) => approval.id === songId ? data.approval : approval));
      setMessage("Saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save approval."); }
    finally { setSavingId(null); }
  }

  return <main className="min-h-dvh bg-[#17110f] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-amber-300">Local playlist review</p><h1 className="font-display text-4xl text-amber-50">Choose one video per song.</h1><p className="mt-2 max-w-2xl text-sm text-white/55">Review candidates manually. A selection is written to <code>data/youtube-approved.json</code>; nothing is added to the player automatically.</p></div><div className="text-sm text-white/60">{approvedCount} / {songs.length} approved</div></header><div className="sticky top-0 z-30 mb-6 flex flex-col gap-3 border-b border-white/10 bg-[#17110f]/95 py-3 backdrop-blur sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter songs…" className="w-full rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-amber-300/70 sm:max-w-md" /><p className="self-center text-xs text-white/45">{message || "Candidates are untrusted until you review them."}</p></div>{loading ? <p className="text-white/60">Loading…</p> : <div className="space-y-10">{filteredSongs.map((song, index) => <section key={song.id} className="scroll-mt-24"><div className="mb-3 flex items-baseline justify-between gap-4"><div><h2 className="text-xl font-semibold text-amber-50">{index + 1}. {song.title}</h2><p className="mt-1 text-sm text-white/55">{song.artist}{song.film ? ` · ${song.film}` : ""}</p></div><span className="shrink-0 text-xs text-white/40">{selectedId(song.id) ? "Approved" : "Needs review"}</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{song.candidates.map((candidate) => <CandidateCard key={candidate.videoId} song={song} candidate={candidate} selected={selectedId(song.id) === candidate.videoId} saving={savingId === song.id} onSelect={() => selectCandidate(song.id, candidate.videoId)} />)}</div></section>)}</div>}</div></main>;
}
