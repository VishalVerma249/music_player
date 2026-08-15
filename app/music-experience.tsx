"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { mergePlaylistAdditions, PLAYLISTS, type PlaylistAddition, type TrackItem } from "../data/playlists";
type YouTubePlayer = { loadVideoById: (id: string) => void; playVideo: () => void; pauseVideo: () => void; stopVideo?: () => void; seekTo: (seconds: number, allowSeekAhead: boolean) => void; destroy: () => void; getCurrentTime: () => number; getDuration: () => number; getVideoData?: () => { video_id?: string } };
type YouTubeEvent = { target: YouTubePlayer; data: number };
type YouTubeAPI = { Player: new (element: HTMLElement | string, options: { videoId: string; playerVars?: Record<string, number | string>; events: { onReady: (event: YouTubeEvent) => void; onStateChange: (event: YouTubeEvent) => void; onError: (event: { data: number; target?: YouTubePlayer }) => void } }) => YouTubePlayer };
declare global { interface Window { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void; } }

const PLAYING = 1;
const PAUSED = 2;
const ENDED = 0;
const isValidVideoId = (videoId: string) => /^[A-Za-z0-9_-]{11}$/.test(videoId);
const fmt = (seconds: number | null) => `${Math.floor((seconds ?? 0) / 60)}:${String(Math.floor((seconds ?? 0) % 60)).padStart(2, "0")}`;
const PLAYBACK_STORAGE_KEY = "nostalgia-radio-playback";
type PlaybackState = { playlistName: string; trackIndex: number; elapsed: number };
type TrackLoad = {
  generation: number;
  playlistName: string;
  trackIndex: number;
  videoId: string;
  requested: boolean;
  confirmed: boolean;
  errorHandled: boolean;
  endedHandled: boolean;
};
function savePlaybackState(state: PlaybackState) { try { window.localStorage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage may be unavailable. */ } }
function parsePlaybackState(value: unknown): PlaybackState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PlaybackState>;
  if (typeof candidate.playlistName !== "string" || !Object.prototype.hasOwnProperty.call(PLAYLISTS, candidate.playlistName)) return null;
  const trackIndex = candidate.trackIndex;
  const elapsed = candidate.elapsed;
  if (typeof trackIndex !== "number" || !Number.isInteger(trackIndex) || trackIndex < 0) return null;
  const playlist = PLAYLISTS[candidate.playlistName];
  if (trackIndex >= playlist.tracks.length) return null;
  if (typeof elapsed !== "number" || !Number.isFinite(elapsed) || elapsed < 0) return null;
  const track = playlist.tracks[trackIndex];
  if (track.duration !== null && elapsed > track.duration) return null;
  return { playlistName: candidate.playlistName, trackIndex, elapsed };
}
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
  const [playlistDataReady, setPlaylistDataReady] = useState(false);
  const item = PLAYLISTS[playlistName].tracks[trackIndex];
  const playerRef = useRef<YouTubePlayer | null>(null);
  const createdPlayerRef = useRef<YouTubePlayer | null>(null);
  const pendingPlayRef = useRef(false);
  const playerReadyRef = useRef(false);
  const playerInitializingRef = useRef(false);
  const playerGenerationRef = useRef(0);
  const loadGenerationRef = useRef(0);
  const activeLoadRef = useRef<TrackLoad | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);
  const elapsedRef = useRef(elapsed);
  const restoreElapsedRef = useRef(0);
  const lastPersistRef = useRef(0);
  const playlistNameRef = useRef(playlistName);
  const trackIndexRef = useRef(trackIndex);
  const itemRef = useRef(item);
  const handledErrorRef = useRef<string | null>(null);
  const duration = runtimeDuration > 0 ? runtimeDuration : (item.duration ?? 0);
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  playlistNameRef.current = playlistName;
  trackIndexRef.current = trackIndex;
  itemRef.current = item;
  elapsedRef.current = elapsed;

  const isCurrentPlayerEvent = useCallback((event: YouTubeEvent) => {
    const activeLoad = activeLoadRef.current;
    if (!activeLoad || event.target !== playerRef.current || !playerReadyRef.current) return null;
    const videoId = typeof event.target.getVideoData === "function" ? event.target.getVideoData()?.video_id : undefined;
    if (videoId !== activeLoad.videoId) return null;
    activeLoad.confirmed = true;
    return activeLoad;
  }, []);
  const loadTrack = useCallback((index: number, playlist = playlistNameRef.current) => {
    const next = PLAYLISTS[playlist].tracks[index];
    const activeLoad: TrackLoad = {
      generation: ++loadGenerationRef.current,
      playlistName: playlist,
      trackIndex: index,
      videoId: next.videoId,
      requested: true,
      confirmed: false,
      errorHandled: false,
      endedHandled: false,
    };
    activeLoadRef.current = activeLoad;
    if (loadTimeoutRef.current !== null) window.clearTimeout(loadTimeoutRef.current);
    restoreElapsedRef.current = 0;
    playlistNameRef.current = playlist;
    trackIndexRef.current = index;
    elapsedRef.current = 0;
    setTrackIndex(index);
    setElapsed(0);
    setRuntimeDuration(0);
    setPlaying(false);
    savePlaybackState({ playlistName: playlist, trackIndex: index, elapsed: 0 });

    const player = playerRef.current;
    if (playerReadyRef.current && player) {
      if (typeof player.stopVideo === "function") player.stopVideo();
      else if (typeof player.pauseVideo === "function") player.pauseVideo();
    }

    loadTimeoutRef.current = window.setTimeout(() => {
      loadTimeoutRef.current = null;
      if (activeLoadRef.current !== activeLoad || !playerReadyRef.current) return;
      const currentPlayer = playerRef.current;
      if (typeof currentPlayer?.loadVideoById === "function") currentPlayer.loadVideoById(activeLoad.videoId);
    }, 0);
  }, []);  const advanceTrack = useCallback(() => { const playlist = playlistNameRef.current; loadTrack((trackIndexRef.current + 1) % PLAYLISTS[playlist].tracks.length, playlist); }, [loadTrack]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/playlist-additions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Playlist additions unavailable");
        return await response.json() as { additions: PlaylistAddition[] };
      })
      .then((data) => {
        if (cancelled) return;
        mergePlaylistAdditions(Array.isArray(data.additions) ? data.additions : []);
        setPlaylistDataReady(true);
      })
      .catch(() => { if (!cancelled) setPlaylistDataReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!playlistDataReady) return;
    try {
      const raw = window.localStorage.getItem(PLAYBACK_STORAGE_KEY);
      const saved = raw ? parsePlaybackState(JSON.parse(raw)) : null;
      if (saved) {
        setPlaylistName(saved.playlistName);
        setTrackIndex(saved.trackIndex);
        setElapsed(saved.elapsed);
        elapsedRef.current = saved.elapsed;
        restoreElapsedRef.current = saved.elapsed;
      } else if (raw) {
        window.localStorage.removeItem(PLAYBACK_STORAGE_KEY);
      }
    } catch {
      try { window.localStorage.removeItem(PLAYBACK_STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
    } finally {
      setRestored(true);
    }
  }, [playlistDataReady]);  useEffect(() => { if (!restored) return;
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true; document.body.appendChild(script);
    const init = () => {
      if (!window.YT || playerReadyRef.current || playerInitializingRef.current) return;
      if (!activeLoadRef.current) {
        activeLoadRef.current = {
          generation: ++loadGenerationRef.current,
          playlistName: playlistNameRef.current,
          trackIndex: trackIndexRef.current,
          videoId: itemRef.current.videoId,
          requested: false,
          confirmed: false,
          errorHandled: false,
          endedHandled: false,
        };
      }
      playerInitializingRef.current = true;
      const playerGeneration = ++playerGenerationRef.current;
      createdPlayerRef.current = new window.YT.Player("youtube-player", {
        videoId: itemRef.current.videoId,
        playerVars: { controls: 1, modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            if (playerGeneration !== playerGenerationRef.current) return;
            playerRef.current = event.target;
            createdPlayerRef.current = event.target;
            playerReadyRef.current = true;
            playerInitializingRef.current = false;
            setPlayerReady(true);
            const activeLoad = activeLoadRef.current;
            if (activeLoad?.requested && typeof event.target.loadVideoById === "function") event.target.loadVideoById(activeLoad.videoId);
            if (pendingPlayRef.current && typeof event.target.playVideo === "function") {
              event.target.playVideo();
              pendingPlayRef.current = false;
            }
          },
          onStateChange: (event) => {
            const activeLoad = isCurrentPlayerEvent(event);
            if (!activeLoad) return;
            if (event.data === PLAYING) setPlaying(true);
            if (event.data === PAUSED) {
              setPlaying(false);
              if (restoreElapsedRef.current > 0) return;
              const player = event.target;
              const playerDuration = typeof player.getDuration === "function" ? player.getDuration() : 0;
              const current = Math.min(playerDuration > 0 ? playerDuration : durationRef.current, player.getCurrentTime());
              elapsedRef.current = current;
              setElapsed(current);
              savePlaybackState({ playlistName: activeLoad.playlistName, trackIndex: activeLoad.trackIndex, elapsed: current });
            }
            if (event.data === ENDED) {
              if (activeLoad.endedHandled || !isValidVideoId(activeLoad.videoId)) return;
              const playerDuration = typeof event.target.getDuration === "function" ? event.target.getDuration() : 0;
              const currentTime = typeof event.target.getCurrentTime === "function" ? event.target.getCurrentTime() : 0;
              if (playerDuration > 0 && currentTime < playerDuration - 1.5) return;
              activeLoad.endedHandled = true;
              advanceTrack();
            }
          },
          onError: (event) => {
            const player = event.target ?? playerRef.current;
            if (!player) return;
            const activeLoad = isCurrentPlayerEvent({ target: player, data: event.data });
            if (!activeLoad || activeLoad.errorHandled) return;
            activeLoad.errorHandled = true;
            setPlaying(false);
            track("youtube_track_error", {
              code: String(event.data),
              videoId: activeLoad.videoId,
              playlist: activeLoad.playlistName,
              trackIndex: activeLoad.trackIndex,
              loadGeneration: activeLoad.generation,
            });
          },
        },
      });
    };
    window.onYouTubeIframeAPIReady = init; if (window.YT) init();
    return () => {
      playerReadyRef.current = false;
      playerInitializingRef.current = false;
      playerGenerationRef.current += 1;
      activeLoadRef.current = null;
      loadGenerationRef.current += 1;
      if (loadTimeoutRef.current !== null) window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
      setPlayerReady(false);
      setRuntimeDuration(0);
      pendingPlayRef.current = false;
      const player = playerRef.current ?? createdPlayerRef.current;
      if (typeof player?.destroy === "function") player.destroy();
      playerRef.current = null;
      createdPlayerRef.current = null;
      script.remove();
    };
  }, [advanceTrack, isCurrentPlayerEvent, restored]);  useEffect(() => { const timer = window.setInterval(() => { if (playing && playerReadyRef.current && typeof playerRef.current?.getCurrentTime === "function") { const nextElapsed = Math.min(duration, playerRef.current.getCurrentTime()); elapsedRef.current = nextElapsed; setElapsed(nextElapsed); if (Date.now() - lastPersistRef.current >= 1000) { savePlaybackState({ playlistName: playlistNameRef.current, trackIndex: trackIndexRef.current, elapsed: nextElapsed }); lastPersistRef.current = Date.now(); } } }, 400); return () => window.clearInterval(timer); }, [playing, duration]);
  useEffect(() => { if (!playerReady) return; let cancelled = false; let timeout: number | undefined; const pollDuration = () => { if (cancelled) return; const player = playerRef.current; if (playerReadyRef.current && typeof player?.getDuration === "function") { const activeLoad = activeLoadRef.current; const videoData = typeof player.getVideoData === "function" ? player.getVideoData() : null; if (activeLoad && videoData?.video_id === activeLoad.videoId && activeLoad.videoId === itemRef.current.videoId) { const nextDuration = player.getDuration(); if (nextDuration > 0) { setRuntimeDuration(nextDuration); return; } } } timeout = window.setTimeout(pollDuration, 250); }; timeout = window.setTimeout(pollDuration, 0); return () => { cancelled = true; if (timeout !== undefined) window.clearTimeout(timeout); }; }, [playerReady, playlistName, trackIndex]);
  useEffect(() => {
    const savedElapsed = restoreElapsedRef.current;
    if (!playerReady || runtimeDuration <= 0 || savedElapsed <= 0) return;
    if (savedElapsed >= runtimeDuration) { restoreElapsedRef.current = 0; elapsedRef.current = 0; setElapsed(0); savePlaybackState({ playlistName: playlistNameRef.current, trackIndex: trackIndexRef.current, elapsed: 0 }); return; }
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
  const onNext = () => { const playlist = playlistNameRef.current; loadTrack((trackIndexRef.current + 1) % PLAYLISTS[playlist].tracks.length, playlist); };
  const onPrevious = () => { const playlist = playlistNameRef.current; loadTrack((trackIndexRef.current - 1 + PLAYLISTS[playlist].tracks.length) % PLAYLISTS[playlist].tracks.length, playlist); };
  const changePlaylist = (name: string) => { setPlaylistName(name); loadTrack(0, name); track("playlist_changed", { playlist: name }); };

  return <div className="flex min-h-dvh w-full flex-col items-center justify-between px-[max(1rem,env(safe-area-inset-left))] py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
    <header className="fixed left-[max(1rem,env(safe-area-inset-left))] right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 flex items-center justify-between"><Clock /><div className="absolute left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[.23em] text-white/65"><span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sun" />1,284 listening</div><nav className="flex gap-3 text-[10px] uppercase tracking-[.16em] text-white/60"><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">ig</a><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white">x</a><a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white">yt</a></nav></header>
    <div className="mt-[18vh] text-center"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.35em] text-sun/85">Frequency 98</p><h1 className="font-display text-5xl leading-none tracking-[-.04em] text-cream drop-shadow-[0_3px_15px_rgba(0,0,0,.3)] sm:text-7xl">songs that<br /><em className="font-normal text-white">stay with you.</em></h1><p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-white/65">A little radio time machine for the moments you never really left.</p></div>
    <div className="w-full max-w-xl pb-2"><div className="mb-3 flex items-center justify-between gap-3 px-2"><div className="min-w-0"><label htmlFor="playlist" className="mr-2 text-[9px] uppercase tracking-[.2em] text-white/45">Now browsing</label><select id="playlist" value={playlistName} onChange={(event) => changePlaylist(event.target.value)} className="max-w-[10rem] bg-transparent text-xs font-semibold text-white outline-none">{playlistNames.map((name) => <option key={name} className="bg-[#211915]" value={name}>{name}</option>)}</select></div><div className="flex shrink-0 items-center gap-2"><span className="text-[10px] text-white/40">{trackIndex + 1} / {PLAYLISTS[playlistName].tracks.length}</span><Link href="/add-song" className="whitespace-nowrap rounded-full border border-white/15 bg-white/[.06] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-white/65 transition hover:border-sun/50 hover:bg-white/10 hover:text-white">Add Song</Link></div></div><div className="relative"><SharedYouTubeArtwork trackItem={item} playing={playing} /><DesktopPlayer item={item} duration={duration} playing={playing} progress={progress} elapsed={elapsed} onSeek={onSeek} onPlayPause={onPlayPause} onPrevious={onPrevious} onNext={onNext} /><MobilePlayer item={item} duration={duration} playing={playing} progress={progress} elapsed={elapsed} onSeek={onSeek} onPlayPause={onPlayPause} onPrevious={onPrevious} onNext={onNext} /></div><p className="mt-3 text-center text-[9px] tracking-[.1em] text-white/35">LISTEN WITH THE WINDOW DOWN · VOL. 01</p></div>
  </div>;
}

