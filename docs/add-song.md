# Add a song

1. Open /add-song.
2. Enter the title, artist, optional album/movie/source, and playlist.
3. Click Search YouTube.
4. Review the candidates and select the correct video.
5. Click Add Song.
6. Return to the player; the persisted addition is refreshed automatically. Running npm run playlist:build is optional for regenerating the checked-in generated artifact.

The YouTube API key is configured server-side as YOUTUBE_API_KEY in .env.local. It is never sent to the browser. The add-song route stores incremental additions in data/playlist-additions.json; the existing 100 approved tracks remain generated from data/songs-to-import.json and data/youtube-approved.json.
