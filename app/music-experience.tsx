"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { PLAYLISTS as GENERATED_PLAYLISTS } from "../data/tracks";

type TrackItem = { id: string; title: string; artist: string; film: string; year: number | null; duration: number | null; videoId: string };
type YouTubePlayer = { loadVideoById: (id: string) => void; playVideo: () => void; pauseVideo: () => void; seekTo: (seconds: number, allowSeekAhead: boolean) => void; destroy: () => void; getCurrentTime: () => number; getDuration: () => number; getVideoData?: () => { video_id?: string } };
type YouTubeEvent = { target: YouTubePlayer; data: number };
type YouTubeAPI = { Player: new (element: HTMLElement | string, options: { videoId: string; playerVars?: Record<string, number | string>; events: { onReady: (event: YouTubeEvent) => void; onStateChange: (event: YouTubeEvent) => void; onError: (event: { data: number }) => void } }) => YouTubePlayer };
declare global { interface Window { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void; } }

// Generated approved tracks are the source of truth for the active playlist.
const DEMO_PLAYLISTS: Record<string, TrackItem[]> = {
  "Sunday Matinee": [
    { id: "sm-01", title: "The opening credits", artist: "Rights holder upload", film: "Your film", year: 1995, duration: 201, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
    { id: "sm-02", title: "A song for the road", artist: "Rights holder upload", film: "Your film", year: 2003, duration: 234, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
  ],
  "Mixtape 2000": [
    { id: "m2k-01", title: "Press play", artist: "Rights holder upload", film: "Your film", year: 2000, duration: 225, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
    { id: "m2k-02", title: "Keep the window down", artist: "Rights holder upload", film: "Your film", year: 2002, duration: 262, videoId: "REPLACE_WITH_RIGHTS_HOLDER_VIDEO_ID" },
  ],
};

const PLAYLISTS: Record<string, TrackItem[]> = {
  "Late Night Drive": [...GENERATED_PLAYLISTS["Late Night Drive"]],
  ...DEMO_PLAYLISTS,
};
const PLAYING = 1;
const PAUSED = 2;
const ENDED = 0;
const fmt = (seconds: number | null) => `${Math.floor((seconds ?? 0) / 60)}:${String(Math.floor((seconds ?? 0) % 60)).padStart(2, "0")}`;
const PLAYBACK_STORAGE_KEY = "nostalgia-radio-playback";
type PlaybackState = { playlistName: string; trackIndex: number; elapsed: number };
function savePlaybackState(state: PlaybackState) { try { window.localStorage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage may be unavailable. */ } }

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const parts = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(now);
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value;
  return <div className="text-[11px] font-bold tracking-[.18em] text-white/80"><span>{hour}</span><span className="clock-colon px-0.5">:</span><span>{minute}</span> <span className="text-[9px] text-white/50">{dayPeriod}</span><span className="ml-2 text-[9px] font-normal tracking-[.1em] text-white/45">IST</span></div>;
}

function Transport({ playing, onPlayPause, onPrevious, onNext, mobile = false }: { playing: boolean; onPlayPause: () => void; onPrevious: () => void; onNext: () => void; mobile?: boolean }) {
  return <div className={`flex items-center justify-center ${mobile ? "gap-3" : "gap-1"}`}>
    <button aria-label="Previous track" onClick={onPrevious} className="grid min-h-11 min-w-11 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"><span className="text-lg">⏮</span></button>
    <button aria-label={playing ? "Pause" : "Play"} onClick={onPlayPause} className={`${mobile ? "h-[52px] w-[52px]" : "h-11 w-11"} grid place-items-center rounded-full bg-gradient-to-b from-sun to-coral text-[#321b16] ring-1 ring-white/25 drop-shadow-[0_5px_10px_rgba(244,123,98,.38)] transition hover:scale-105`}><span className={playing ? "text-base" : "ml-0.5 text-lg"}>{playing ? "Ⅱ" : "▶"}</span></button>
    <button aria-label="Next track" onClick={onNext} className="grid min-h-11 min-w-11 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"><span className="text-lg">⏭</span></button>
  </div>;
}

function Artwork({ size, playing }: { size: "desktop" | "mobile"; playing: boolean }) {
  return <div className={`${size === "desktop" ? "h-20 w-20" : "h-16 w-16"} vinyl-spin relative shrink-0 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/20`} style={{ animationPlayState: playing ? "running" : "paused" }}><span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" /></div>;
}

function SharedYouTubeArtwork({ trackItem, playing }: { trackItem: TrackItem; playing: boolean }) {
  return <div className="pointer-events-auto absolute left-3 top-3 z-20 h-20 w-20 overflow-hidden rounded-full max-sm:left-4 max-sm:top-4 max-sm:h-16 max-sm:w-16" style={{ animation: "spin 8s linear infinite", animationPlayState: playing ? "running" : "paused" }}><div id="youtube-player" className="absolute inset-0 aspect-video" data-video-id={trackItem.videoId} title={`${trackItem.title} by ${trackItem.artist}`} /><span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" /></div>;
}

function SeekBar({ progress, onSeek }: { progress: number; onSeek: (event: React.PointerEvent<HTMLDivElement>) => void }) {
  return <div className="seek-wrap group relative h-6 touch-none cursor-pointer" onPointerDown={onSeek} role="slider" aria-label="Seek track" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} tabIndex={0}><div className="seek-rail absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"><div className="seek-fill relative h-full rounded-full" style={{ width: `${progress}%` }}><span className="seek-knob absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-sun ring-2 ring-white/30" /></div></div></div>;
}

function DesktopPlayer({ item, duration, playing, progress, elapsed, onSeek, onPlayPause, onPrevious, onNext }: { item: TrackItem; duration: number; playing: boolean; progress: number; elapsed: number; onSeek: (event: React.PointerEvent<HTMLDivElement>) => void; onPlayPause: () => void; onPrevious: () => void; onNext: () => void }) {
  return <section className="glass hidden w-full items-center gap-3 rounded-full p-3 pr-5 backdrop-blur-3xl backdrop-saturate-[1.7] sm:flex" aria-label="Music player"><Artwork playing={playing} size="desktop" /><div className="min-w-0 flex-1 pl-[68px]"><div className="mb-0.5 truncate text-[15px] font-semibold">{item.title}</div><div className="mb-1 truncate text-[12.5px] text-white/70">{item.artist} <span className="text-white/35">· {item.film} · {item.year}</span></div><SeekBar progress={progress} onSeek={onSeek} /><div className="-mt-1 flex justify-between text-[10.5px] tabular-nums text-white/55"><span>{fmt(elapsed)}</span><span>{fmt(duration)}</span></div></div><Transport playing={playing} onPlayPause={onPlayPause} onPrevious={onPrevious} onNext={onNext} /></section>;
}

function MobilePlayer({ item, duration, playing, progress, elapsed, onSeek, onPlayPause, onPrevious, onNext }: { item: TrackItem; duration: number; playing: boolean; progress: number; elapsed: number; onSeek: (event: React.PointerEvent<HTMLDivElement>) => void; onPlayPause: () => void; onPrevious: () => void; onNext: () => void }) {
  return <section className="glass flex w-full flex-col gap-3 rounded-[26px] p-4 backdrop-blur-3xl backdrop-saturate-[1.7] sm:hidden" aria-label="Music player"><div className="flex items-center gap-3"><Artwork playing={playing} size="mobile" /><div className="min-w-0 pl-[68px]"><div className="truncate text-[15px] font-semibold">{item.title}</div><div className="truncate text-[12.5px] text-white/70">{item.artist}</div></div></div><SeekBar progress={progress} onSeek={onSeek} /><div className="flex items-center justify-between"><div className="text-[10.5px] tabular-nums text-white/55">{fmt(elapsed)} / {fmt(duration)}</div><Transport mobile playing={playing} onPlayPause={onPlayPause} onPrevious={onPrevious} onNext={onNext} /></div></section>;
}

export default function MusicExperience() {
  const playlistNames = useMemo(() => Object.keys(PLAYLISTS), []);
  const [playlistName, setPlaylistName] = useState(playlistNames[0]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [runtimeDuration, setRuntimeDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const item = PLAYLISTS[playlistName][trackIndex];
  const playerRef = useRef<YouTubePlayer | null>(null);
  const createdPlayerRef = useRef<YouTubePlayer | null>(null);
  const pendingPlayRef = useRef(false);
  const playerReadyRef = useRef(false);
  const playerInitializingRef = useRef(false);
  const pendingVideoIdRef = useRef<string | null>(null);
  const elapsedRef = useRef(elapsed);
  const restoreElapsedRef = useRef(0);
  const lastPersistRef = useRef(0);
  const playlistNameRef = useRef(playlistName);
  const trackIndexRef = useRef(trackIndex);
  const itemRef = useRef(item);
  const handledErrorRef = useRef<string | null>(null);
  const duration = runtimeDuration > 0 ? runtimeDuration : (item.duration ?? 0);
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  playlistNameRef.current = playlistName;
  trackIndexRef.current = trackIndex;
  itemRef.current = item;
  elapsedRef.current = elapsed;

  const loadTrack = useCallback((index: number, playlist = playlistNameRef.current) => { const next = PLAYLISTS[playlist][index]; handledErrorRef.current = null; restoreElapsedRef.current = 0; playlistNameRef.current = playlist; trackIndexRef.current = index; elapsedRef.current = 0; setTrackIndex(index); setElapsed(0); setRuntimeDuration(0); setPlaying(false); savePlaybackState({ playlistName: playlist, trackIndex: index, elapsed: 0 }); pendingVideoIdRef.current = next.videoId; window.setTimeout(() => { if (playerReadyRef.current && typeof playerRef.current?.loadVideoById === "function") { playerRef.current.loadVideoById(next.videoId); pendingVideoIdRef.current = null; } }, 0); }, []);
  const advanceTrack = useCallback(() => { const playlist = playlistNameRef.current; loadTrack((trackIndexRef.current + 1) % PLAYLISTS[playlist].length, playlist); }, [loadTrack]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PLAYBACK_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PlaybackState>;
        const playlist = typeof saved.playlistName === "string" ? PLAYLISTS[saved.playlistName] : undefined;
        const valid = Boolean(playlist) && Number.isInteger(saved.trackIndex) && (saved.trackIndex as number) >= 0 && (saved.trackIndex as number) < (playlist?.length ?? 0) && typeof saved.elapsed === "number" && Number.isFinite(saved.elapsed) && saved.elapsed >= 0;
        if (valid) {
          setPlaylistName(saved.playlistName as string);
          setTrackIndex(saved.trackIndex as number);
          setElapsed(saved.elapsed as number);
          elapsedRef.current = saved.elapsed as number;
          restoreElapsedRef.current = saved.elapsed as number;
        } else {
          window.localStorage.removeItem(PLAYBACK_STORAGE_KEY);
        }
      }
    } catch {
      try { window.localStorage.removeItem(PLAYBACK_STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
    } finally {
      setRestored(true);
    }
  }, []);
  useEffect(() => { if (!restored) return;
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true; document.body.appendChild(script);
    const init = () => { if (!window.YT || playerReadyRef.current || playerInitializingRef.current) return; playerInitializingRef.current = true; createdPlayerRef.current = new window.YT.Player("youtube-player", { videoId: itemRef.current.videoId, playerVars: { controls: 1, modestbranding: 1, playsinline: 1, rel: 0 }, events: { onReady: (event) => { playerRef.current = event.target; createdPlayerRef.current = event.target; playerReadyRef.current = true; playerInitializingRef.current = false; setPlayerReady(true); if (pendingVideoIdRef.current && typeof event.target.loadVideoById === "function") { event.target.loadVideoById(pendingVideoIdRef.current); pendingVideoIdRef.current = null; } if (pendingPlayRef.current && typeof event.target.playVideo === "function") { event.target.playVideo(); pendingPlayRef.current = false; } }, onStateChange: (event) => { if (event.data === PLAYING) setPlaying(true); if (event.data === PAUSED) { setPlaying(false); const player = event.target; const current = typeof player.getCurrentTime === "function" ? Math.min(duration, player.getCurrentTime()) : elapsedRef.current; elapsedRef.current = current; setElapsed(current); savePlaybackState({ playlistName: playlistNameRef.current, trackIndex: trackIndexRef.current, elapsed: current }); } if (event.data === ENDED) advanceTrack(); }, onError: (event) => { const current = itemRef.current; const key = `${playlistNameRef.current}:${trackIndexRef.current}:${current.videoId}:${event.data}`; if (handledErrorRef.current === key) return; handledErrorRef.current = key; track("youtube_track_error", { code: String(event.data), videoId: current.videoId }); advanceTrack(); } } }); };
    window.onYouTubeIframeAPIReady = init; if (window.YT) init();
    return () => { playerReadyRef.current = false; playerInitializingRef.current = false; pendingVideoIdRef.current = null; setPlayerReady(false); setRuntimeDuration(0); pendingPlayRef.current = false; const player = playerRef.current ?? createdPlayerRef.current; if (typeof player?.destroy === "function") player.destroy(); playerRef.current = null; createdPlayerRef.current = null; script.remove(); };
  }, [advanceTrack, restored]);
  useEffect(() => { const timer = window.setInterval(() => { if (playing && playerReadyRef.current && typeof playerRef.current?.getCurrentTime === "function") { const nextElapsed = Math.min(duration, playerRef.current.getCurrentTime()); elapsedRef.current = nextElapsed; setElapsed(nextElapsed); if (Date.now() - lastPersistRef.current >= 1000) { savePlaybackState({ playlistName: playlistNameRef.current, trackIndex: trackIndexRef.current, elapsed: nextElapsed }); lastPersistRef.current = Date.now(); } } }, 400); return () => window.clearInterval(timer); }, [playing, duration]);
  useEffect(() => { if (!playerReady) return; let cancelled = false; let timeout: number | undefined; const pollDuration = () => { if (cancelled) return; const player = playerRef.current; if (playerReadyRef.current && typeof player?.getDuration === "function") { const videoData = typeof player.getVideoData === "function" ? player.getVideoData() : null; if (!videoData?.video_id || videoData.video_id === itemRef.current.videoId) { const nextDuration = player.getDuration(); if (nextDuration > 0) { setRuntimeDuration(nextDuration); return; } } } timeout = window.setTimeout(pollDuration, 250); }; timeout = window.setTimeout(pollDuration, 0); return () => { cancelled = true; if (timeout !== undefined) window.clearTimeout(timeout); }; }, [playerReady, playlistName, trackIndex]);
  useEffect(() => {
    const savedElapsed = restoreElapsedRef.current;
    if (!playerReady || runtimeDuration <= 0 || savedElapsed <= 0) return;
    if (savedElapsed >= runtimeDuration) { restoreElapsedRef.current = 0; return; }
    const player = playerRef.current;
    const videoData = typeof player?.getVideoData === "function" ? player.getVideoData() : null;
    if (playerReadyRef.current && typeof player?.seekTo === "function" && (!videoData?.video_id || videoData.video_id === itemRef.current.videoId)) {
      player.seekTo(savedElapsed, true);
      elapsedRef.current = savedElapsed;
      setElapsed(savedElapsed);
      restoreElapsedRef.current = 0;
    }
  }, [playerReady, runtimeDuration, playlistName, trackIndex]);
  const onSeek = (event: React.PointerEvent<HTMLDivElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const next = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)); const nextElapsed = next * duration; elapsedRef.current = nextElapsed; setElapsed(nextElapsed); savePlaybackState({ playlistName: playlistNameRef.current, trackIndex: trackIndexRef.current, elapsed: nextElapsed }); if (playerReadyRef.current && typeof playerRef.current?.seekTo === "function") playerRef.current.seekTo(nextElapsed, true); };
  const onPlayPause = () => { if (!playerReadyRef.current || !playerRef.current) { if (!playing) pendingPlayRef.current = true; return; } if (playing) { if (typeof playerRef.current.getCurrentTime === "function") { const current = Math.min(duration, playerRef.current.getCurrentTime()); elapsedRef.current = current; setElapsed(current); savePlaybackState({ playlistName: playlistNameRef.current, trackIndex: trackIndexRef.current, elapsed: current }); } if (typeof playerRef.current.pauseVideo === "function") playerRef.current.pauseVideo(); } else if (typeof playerRef.current.playVideo === "function") playerRef.current.playVideo(); };
  const onNext = () => { const playlist = playlistNameRef.current; loadTrack((trackIndexRef.current + 1) % PLAYLISTS[playlist].length, playlist); };
  const onPrevious = () => { const playlist = playlistNameRef.current; loadTrack((trackIndexRef.current - 1 + PLAYLISTS[playlist].length) % PLAYLISTS[playlist].length, playlist); };
  const changePlaylist = (name: string) => { restoreElapsedRef.current = 0; playlistNameRef.current = name; trackIndexRef.current = 0; elapsedRef.current = 0; setPlaylistName(name); setTrackIndex(0); setElapsed(0); setRuntimeDuration(0); setPlaying(false); savePlaybackState({ playlistName: name, trackIndex: 0, elapsed: 0 }); pendingVideoIdRef.current = PLAYLISTS[name][0].videoId; window.setTimeout(() => { if (playerReadyRef.current && typeof playerRef.current?.loadVideoById === "function") { playerRef.current.loadVideoById(PLAYLISTS[name][0].videoId); pendingVideoIdRef.current = null; } }, 0); track("playlist_changed", { playlist: name }); };

  return <div className="flex min-h-dvh w-full flex-col items-center justify-between px-[max(1rem,env(safe-area-inset-left))] py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
    <header className="fixed left-[max(1rem,env(safe-area-inset-left))] right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 flex items-center justify-between"><Clock /><div className="absolute left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[.23em] text-white/65"><span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sun" />1,284 listening</div><nav className="flex gap-3 text-[10px] uppercase tracking-[.16em] text-white/60"><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">ig</a><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white">x</a><a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white">yt</a></nav></header>
    <div className="mt-[18vh] text-center"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.35em] text-sun/85">Frequency 98</p><h1 className="font-display text-5xl leading-none tracking-[-.04em] text-cream drop-shadow-[0_3px_15px_rgba(0,0,0,.3)] sm:text-7xl">songs that<br /><em className="font-normal text-white">stay with you.</em></h1><p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-white/65">A little radio time machine for the moments you never really left.</p></div>
    <div className="w-full max-w-xl pb-2"><div className="mb-3 flex items-center justify-between px-2"><div><label htmlFor="playlist" className="mr-2 text-[9px] uppercase tracking-[.2em] text-white/45">Now browsing</label><select id="playlist" value={playlistName} onChange={(event) => changePlaylist(event.target.value)} className="bg-transparent text-xs font-semibold text-white outline-none"><option className="bg-[#211915]" value="Late Night Drive">Late Night Drive</option><option className="bg-[#211915]" value="Sunday Matinee">Sunday Matinee</option><option className="bg-[#211915]" value="Mixtape 2000">Mixtape 2000</option></select></div><span className="text-[10px] text-white/40">{trackIndex + 1} / {PLAYLISTS[playlistName].length}</span></div><div className="relative"><SharedYouTubeArtwork trackItem={item} playing={playing} /><DesktopPlayer item={item} duration={duration} playing={playing} progress={progress} elapsed={elapsed} onSeek={onSeek} onPlayPause={onPlayPause} onPrevious={onPrevious} onNext={onNext} /><MobilePlayer item={item} duration={duration} playing={playing} progress={progress} elapsed={elapsed} onSeek={onSeek} onPlayPause={onPlayPause} onPrevious={onPrevious} onNext={onNext} /></div><p className="mt-3 text-center text-[9px] tracking-[.1em] text-white/35">LISTEN WITH THE WINDOW DOWN · VOL. 01</p></div>
  </div>;
}

