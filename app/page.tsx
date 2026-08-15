import MusicExperience from "./music-experience";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <div aria-hidden="true" className="hero-bg fixed inset-0 -z-30 bg-cover bg-center" />
      <video aria-hidden="true" autoPlay loop muted playsInline preload="auto" poster="/bg/scene-wide.png" className="cinematic-bg pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover" tabIndex={-1}><source src="/bg/scene-wide.mp4" type="video/mp4" /></video>
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      <div aria-hidden="true" className="grain fixed inset-0 -z-10" />
      <MusicExperience />
    </main>
  );
}
