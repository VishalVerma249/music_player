<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1e2a4a,100:5b2a8a&height=180&section=header&text=Nostalgia%20Radio&fontSize=50&fontColor=ffffff&animation=fadeIn&desc=A%20cinematic%20music-player%20experience&descAlignY=62&descSize=18"/>

<img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&size=18&pause=1200&color=A78BFA&center=true&vCenter=true&width=650&lines=Glassmorphism+player+%F0%9F%8E%A7;Curated+playlists+%F0%9F%92%BF;Single+authoritative+YouTube+player+%E2%96%B6%EF%B8%8F;Persistent+playback+state+%F0%9F%92%BE" alt="Typing SVG"/>

<br/>

<img src="https://img.shields.io/github/stars/VishalVerma249/music_player?style=for-the-badge&color=A78BFA&labelColor=1e2a4a"/>
<img src="https://img.shields.io/github/forks/VishalVerma249/music_player?style=for-the-badge&color=5b2a8a&labelColor=1e2a4a"/>
<img src="https://img.shields.io/github/last-commit/VishalVerma249/music_player?style=for-the-badge&color=6d28d9&labelColor=1e2a4a"/>
<img src="https://img.shields.io/github/repo-size/VishalVerma249/music_player?style=for-the-badge&color=7c3aed&labelColor=1e2a4a"/>

<br/><br/>

<img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/YouTube_Data_API-FF0000?style=flat&logo=youtube&logoColor=white"/>

<!-- Optional but highest-impact addition: replace with an actual screenshot/GIF of the player -->
<!-- <img src="docs/demo.gif" width="700"/> -->

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Running Locally](#-running-locally)
- [Add a Song](#-add-a-song)
- [Review & Import Workflow](#-review--import-workflow)
- [Architecture](#-architecture)
- [Scripts](#-scripts)
- [Troubleshooting](#-troubleshooting)
- [Copyright & Content Safety](#-copyright--content-safety)

---

## ✨ Features

| | |
|---|---|
| 🎬 | Cinematic looping background video with PNG fallback |
| 📱 | Responsive desktop and mobile music-player layouts |
| 🎧 | Three runtime playlists — *Late Night Drive*, *Sunday Matinee*, *Mixtape 2000* |
| ▶️ | Single YouTube IFrame player — play, pause, next, previous, seek, error handling |
| 🔁 | Playlist switching with stale-callback protection |
| 💾 | Playback persistence via browser `localStorage` |
| 🔍 | Server-side YouTube candidate search and manual approval |
| ➕ | Add Song workflow at `/add-song` |
| ✅ | Review workflow at `/review` |
| ⚡ | Runtime loading of persisted playlist additions — no database, no state manager |

---

## ⚙️ Requirements

- Node.js with support for `--experimental-strip-types`
- npm
- A YouTube Data API key (for search and import workflows only — **not required for playback**)

---

## 🚀 Installation

```bash
git clone https://github.com/VishalVerma249/music_player.git
cd music_player
npm install
```

Create `.env.local` in the project root:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
```

> ⚠️ This key is used only by server-side routes and import scripts. Never expose it client-side, commit it, or log it.

---

## 🖥️ Running Locally

```bash
npm run dev
```

Open **http://localhost:3000**

| Route | Purpose |
|---|---|
| `/` | Main music player |
| `/add-song` | Search, review, and add a song |
| `/review` | Review YouTube candidates for imported songs |

---

## ➕ Add a Song

1. Open `/add-song`, or use the **Add Song** control in the main player
2. Enter the song title and artist
3. Optionally enter an album, movie, or source
4. Select a playlist
5. Click **Search YouTube**
6. Review the returned candidates
7. Explicitly select the correct video
8. Click **Add Song**
9. Return to the player

<details>
<summary><b>What the server validates</b> (click to expand)</summary>

- Required title and artist input
- Valid playlist
- Candidate membership in the current search
- Valid YouTube video ID format
- Duplicate video IDs
- Duplicate title and artist warnings
- Writable playlist data

The browser never submits a manually entered video ID — the selected candidate must belong to the current server-recorded search session and contain a valid YouTube video ID.

Successful additions are stored in `data/playlist-additions.json`. The player refreshes this via `/api/playlist-additions` on mount. Running `npm run playlist:build` is optional — it regenerates the checked-in generated artifact but isn't required for the player to see a persisted addition.

</details>

---

## 🔄 Review & Import Workflow

The bulk import pipeline:

```text
songs-to-import.json
        │
        ▼
npm run playlist:search
        │
        ▼
data/youtube-candidates.json
        │
        ▼
      /review
        │
        ▼
data/youtube-approved.json
        │
        ▼
npm run playlist:build
        │
        ▼
data/tracks.ts
```

```bash
npm run playlist:search   # searches YouTube server-side, writes candidates
```

Open `/review` to select one candidate per song → writes to `data/youtube-approved.json`.

```bash
npm run playlist:build    # regenerates data/tracks.ts
```

---

## 🏗️ Architecture

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1e2a4a,100:5b2a8a&height=3&width=1000"/>
</p>

<details open>
<summary><b>Playback architecture</b></summary>

Implemented in `app/music-experience.tsx`. Exactly **one** YouTube player instance:

```text
Playlist data
    │
    ▼
Music Experience
    │
    ▼
Single YouTube IFrame Player
```

Track loading uses the stored `videoId` directly — playback never searches YouTube, resolves titles, or calls the YouTube Data API.

Includes: monotonic track-load generations, active playlist/track/video identity checks, stale callback rejection, safe YouTube error handling, genuine `ENDED`-event validation, runtime duration polling, elapsed-time persistence, playlist-switch resets, refresh restoration.

</details>

<details>
<summary><b>Playlist & data architecture</b></summary>

**Original approved tracks** — sourced from `data/songs-to-import.json` + `data/youtube-approved.json`, generated into `data/tracks.ts`. The build script preserves original tracks and can append valid *Late Night Drive* additions from `data/playlist-additions.json`.

**Runtime playlists** — composed in `data/playlists.ts`, combining generated `Late Night Drive` tracks, demo playlist seed tracks, and persisted additions. The merge is idempotent and skips duplicate track/video IDs.

**Add Song server routes:**

| Route | Behavior |
|---|---|
| `POST /api/add-song/search` | Uses YouTube Data API server-side, returns a small candidate set, stores a short-lived search session |
| `POST /api/add-song` | Validates selected candidate, rejects duplicate video IDs, persists the approved song |
| `GET /api/playlist-additions` | Reads local persisted additions, does not call YouTube, supplies additions to the player at runtime |

There is no database and no global state manager.

</details>

<details>
<summary><b>Playback persistence</b></summary>

State stored in `localStorage` under `nostalgia-radio-playback`, containing: playlist name, track index, elapsed seconds.

On refresh, state restores **after** runtime playlist additions load. Invalid/malformed data is discarded safely. Playback does not auto-start after refresh.

</details>

<details>
<summary><b>Background video</b></summary>

- `public/bg/scene-wide.mp4`
- `public/bg/scene-wide.png`
- `public/bg/scene-tall.png`

Muted, autoplay, looping, inline, fixed behind UI, covers viewport without stretching, hidden when reduced motion is requested. Completely separate from the YouTube player.

</details>

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run playlist:search` | Search YouTube for bulk-import candidates |
| `npm run playlist:build` | Regenerate `data/tracks.ts` |
| `npx tsc --noEmit` | Run TypeScript validation |

<details>
<summary><b>Pre-publish validation checklist</b></summary>

```bash
npx tsc --noEmit
npm run build
git diff --check
```

Also verify:

- `data/tracks.ts` still contains the original 100 tracks
- Existing approved video IDs are unchanged
- Only one `window.YT.Player` construction exists
- No `<audio>` element has been introduced
- The player contains no YouTube Data API request
- `/add-song` and `/review` compile successfully
- `.env.local` and API keys are not committed

</details>

---

## 🩺 Troubleshooting

<details>
<summary><b>YouTube search is unavailable</b></summary>

Confirm `.env.local` contains:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Restart the dev server after changing environment variables.

</details>

<details>
<summary><b>A newly added song is not visible</b></summary>

Return to the main player so it can refresh `/api/playlist-additions`. No YouTube search or manual build is required for runtime visibility.

</details>

<details>
<summary><b>Playback is slow to begin</b></summary>

The player loads the YouTube IFrame API, then YouTube loads/buffers the selected video. This is normal YouTube player behavior, not a runtime YouTube Data API search.

</details>

<details>
<summary><b>Playback state is invalid</b></summary>

The player validates the `nostalgia-radio-playback` localStorage record. Invalid records are removed and playback falls back to the default playlist and track.

</details>

---

## © Copyright & Content Safety

This repository does not automatically add copyrighted music or invent video IDs. YouTube candidates must be reviewed and explicitly approved by a user. Only use video IDs and recordings you have permission to use — placeholder demo IDs are intentionally not real playable content.

**License:** No license has been declared for this repository. Add one before distributing it publicly.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:5b2a8a,100:1e2a4a&height=100&section=footer"/>
</div>
