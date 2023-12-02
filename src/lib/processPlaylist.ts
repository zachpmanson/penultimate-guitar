import { Playlist } from "@/models/models";

// TODO if this is called a third time move it to a state action
export async function processPlaylist(playlistId: string): Promise<Playlist> {
  let playlist: Playlist | undefined = undefined;
  console.log("Searching for playlist", playlistId);

  await fetch("/api/playlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playlistId: playlistId,
    }),
  })
    .then((res) => res.json())
    .then((data: Playlist) => {
      playlist = data;
    })
    .catch(() => {});

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  return playlist;
}
