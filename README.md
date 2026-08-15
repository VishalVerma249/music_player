# Nostalgia Radio

Nostalgia Radio is a cinematic music-player experience built with Next.js. It combines a glassmorphism player, curated playlists, a single authoritative YouTube IFrame player, persistent playback state, and a server-side workflow for reviewing and adding songs.

## Features

- Cinematic looping background video with PNG fallback.
- Responsive desktop and mobile music-player layouts.
- Three runtime playlists:
  - Late Night Drive
  - Sunday Matinee
  - Mixtape 2000
- Single YouTube IFrame player for music playback.
- Play, pause, next, previous, seeking, runtime duration, ended-track handling, and error handling.
- Playlist switching with stale-callback protection.
- Playback persistence using browser localStorage.
- Server-side YouTube candidate search and manual approval.
- Add Song workflow at /add-song.
- Review workflow at /review.
- Runtime loading of persisted playlist additions without a database or state manager.

## Requirements

- Node.js with support for `--experimental-strip-types`.
- npm.
- A YouTube Data API key for search and import workflows.

The application does not make YouTube Data API requests during playback.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/VishalVerma249/music_player.git
cd music_player
npm install
```

Create a local environment file:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Save it as `.env.local` in the project root.

The key is used only by server-side routes and playlist-import scripts. Do not expose it through client-side environment variables, commit it, or print it in logs.

## Running locally

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

Useful routes:

| Route | Purpose |
| --- | --- |
| `/` | Main music player |
| `/add-song` | Search, review, and add a song |
| `/review` | Review YouTube candidates for imported songs |

## Add a song

1. Open `/add-song), or use the Add Song control in the main player.
2. Enter the song title and artist.
3. Optionally enter an album, movie, or source.
4. Select a playlist.
5. Click Search YouTube.
6. Review the returned candidates.
7. Explicitly select the correct video.
8. Click Add Song.
9. Return to the player.

The browser never submits a manually entered video ID. The selected candidate must belong to the current server-recorded search session and must contain a valid YouTube video ID.

The server validates:

- Required title and artist input.
- Valid playlist.
- Candidate membership in the current search.
- Valid YouTube video ID format.
- Duplicate video IDs.
- Duplicate title and artist warnings.
- Writable playlist data.

Successful additions are stored in:

```
data/playlist-additions.json
```

The player refreshes this persisted file through the local `/api/playlist-additions` route when it mounts. Running `npm run playlist:build` is optional for regenerating the checked-in generated artifact; it is not required for the player to see a persisted addition.

## Review and import workflow

The existing bulk workflow is:

```
songs-to-import.json
        |
        v
npm run playlist:search
        |
        v
data/youtube-candidates.json
        |
        v
/review
        |
        v
data/youtube-approved.json
        |
        v
npm run playlist:build
        |
        v
data/tracks.ts
```

Run the candidate importer with:

```bash
npm run playlist:search
```

This searches YouTube on the server side and writes candidate results to `data/youtube-candidates.json`.

Open `/review` to select one candidate per song. Approved selections are written to `data/youtube-approved.json`.

Regenerate the generated playlist source with:

```bash
npm run playlist:build
```

## Playlist and data architecture

The application keeps the original generated playlist data intact.

### Original approved tracks

The original 100 approved tracks are sourced from:

- `data/songs-to-import.json`
- `data/youtube-approved.json`

They are generated into:

- `data/tracks.ts`

The build script preserves the original tracks and can append valid Late Night Drive additions from `data/playlist-additions.json`.

### Runtime playlists

Runtime playlist composition lives in:

- `data/playlists.ts`

It combines:

- Generated Late Night Drive tracks from `data/tracks.ts`.
- Demo playlist seed tracks.
- Persisted additions from `data/playlist-additions.json`.

The runtime merge is idempotent and skips duplicate track IDs and video IDs.

### Add Song server routes

- `POST /api/add-song/search`
  - Uses the YouTube Data API server-side.
  - Returns a small candidate set.
  - Stores a short-lived search session.

- `POST /api/add-song`
  - Validates the selected candidate.
  - Rejects duplicate video IDs.
  - Persists the approved song.

- `GET /api/playlist-additions`
  - Reads local persisted additions.
  - Does not call YouTube.
  - Supplies additions to the player at runtime.

There is no database and no global state manager.

## Playback architecture

The player is implemented in `app/music-experience.tsx`.

There is exactly one YouTube player instance:

```text
Playlist data
    |
    v
Music Experience
    |
    v
Single YouTube IFrame Player
```

Track loading uses the stored `videoId` directly. Playback does not search YouTube, resolve titles, or call the YouTube Data API.

The player includes:

- Monotonic track-load generations.
- Active playlist/track/video identity checks.
- Stale callback rejection.
- Safe handling for YouTube errors.
- Genuine ENDED-event validation.
- Runtime duration polling.
- Elapsed-time persistence.
- Playlist-switch resets.
- Refresh restoration.

## Playback persistence

Playback state is stored in browser localStorage under:

```
nostalgia-radio-playback
```

The stored state includes:

- Playlist name.
- Track index.
- Elapsed seconds.

On refresh, the player restores the state after runtime playlist additions have been loaded. Invalid or malformed localStorage data is discarded safely.

Playback does not automatically start after refresh.

## Background video

The visual background is implemented with:

- `public/bg/scene-wide.mp4`
- `public/bg/scene-wide.png`
- `public/bg/scene-tall.png`

The video is:

- Muted.
- Autoplay-enabled.
- Looping.
- Inline.
- Fixed behind the UI.
- Covering the viewport without stretching.
- Hidden when reduced motion is requested.

The YouTube player remains completely separate from the decorative background video.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run playlist:search` | Search YouTube for bulk-import candidates |
| `npm run playlist:build` | Regenerate `data/tracks.ts` |
| `npx tsc --noEmit` | Run TypeScript validation |

## Validation

Before publishing changes, run:

```bash
npx tsc --noEmit
npm run build
git diff --check
```

Also verify that:

- `data/tracks.ts` still contains the original 100 tracks.
- Existing approved video IDs are unchanged.
- Only one `window.YT.Player` construction exists.
- No `<audio>` element has been introduced.
- The player contains no YouTube Data API request.
- `/add-song` and `/review` compile successfully.
- `.env.local` and API keys are not committed.

## Copyright and content safety

This repository does not automatically add copyrighted music or invent video IDs. YouTube candidates must be reviewed and explicitly approved by a user.

Only use video IDs and recordings that you have permission to use. The placeholder demo IDs are intentionally not real playable content.

## Troubleshooting

### YouTube search is unavailable

Confirm that `.env.local` contains:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Restart the development server after changing environment variables.

### A newly added song is not visible

Return to the main player so it can refresh `/api/playlist-additions`. No YouTube search or manual build is required for runtime visibility.

### Playback is slow to begin

The player loads the YouTube IFrame API and then YouTube loads or buffers the selected video. This is normal YouTube player behavior, not a runtime YouTube Data API search.

### Playback state is invalid

The player validates the `nostalgia-radio-playback` localStorage record. Invalid records are removed and playback falls back to the default playlist and track.

## License

No license has been declared for this repository. Add an appropriate license before distributing the project publicly.
