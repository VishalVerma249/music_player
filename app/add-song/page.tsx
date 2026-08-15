import { PLAYLISTS } from "../../data/playlists";
import AddSongForm from "./add-song-form";

export default function AddSongPage() {
  const playlists = Object.values(PLAYLISTS).map((playlist) => ({ id: playlist.id, name: playlist.name }));
  return <AddSongForm playlists={playlists} />;
}
