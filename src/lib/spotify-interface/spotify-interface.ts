import { AccessReponse } from "./models";
import memoryCache from "memory-cache";
import { Playlist } from "@/models";

async function getToken(): Promise<string> {
  let token = memoryCache.get("spotify-token");
  if (!token) {
    const clientCreds = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
    const auth_header: HeadersInit = {
      Authorization: `Basic ${Buffer.from(clientCreds).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const auth_body: URLSearchParams = new URLSearchParams();
    auth_body.set("grant_type", "client_credentials");

    let accessResponse: AccessReponse = {
      access_token: "",
      token_type: "",
      expires_in: 1,
    };

    await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: auth_header,
      body: auth_body.toString(),
    })
      .then((res) => res.json())
      .then((data) => {
        accessResponse = data;
        token = accessResponse.access_token;
        if (accessResponse.expires_in - 100 > 1) {
          memoryCache.put(
            "spotify-token",
            token,
            accessResponse.expires_in - 100
          );
        }
      });
  }

  return token;
}

export async function getPlaylist(playlistId: string): Promise<Playlist> {
  const token = await getToken();
  const authHeader: HeadersInit = { Authorization: `Bearer ${token}` };
  let playlist: Playlist = { name: "", tracks: [] };

  await Promise.all([
    // get tracks
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "GET",
      headers: authHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        playlist.tracks = data.items.map((i: any) => ({
          name: i.track.name,
          artists: i.track.artists.map((a: any) => a.name),
        }));
      }),
    // get name
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      method: "GET",
      headers: authHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        playlist.name = data.name;
      }),
  ]);

  return playlist;
}
