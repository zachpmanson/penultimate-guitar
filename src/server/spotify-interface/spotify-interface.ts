import { AccessReponse } from "./models";
import memoryCache from "memory-cache";
import { Playlist, Track } from "@/models/models";
import _ from "lodash";
import { SpotifyPlaylistResponse } from "@/types/spotify";
export namespace SpotifyAdapter {
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
    const authHeader: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };
    let playlistPayload = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        method: "GET",
        headers: authHeader,
      }
    ).then((res) => res.json());

    let playlist: Playlist = {
      name: playlistPayload.name,
      image:
        playlistPayload?.images?.length > 0
          ? playlistPayload.images[0].url
          : undefined,
      tracks: [],
      owner: playlistPayload.owner.display_name,
      description: playlistPayload.description,
    };

    // add first pageSize tracks
    let tracks: Track[] = playlistPayload.tracks.items.map((i: any) => ({
      name: i.track.name,
      artists: i.track.artists.map((a: any) => a.name),
    }));

    if (playlistPayload.tracks.total > 100) {
      let pages = Math.floor(playlistPayload.tracks.total / PAGESIZE);
      let offsets = [...Array(pages).keys()].map(
        (pageNum) => (pageNum + 1) * PAGESIZE
      );

      await Promise.all(
        offsets.map((offset) => {
          let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${PAGESIZE}&offset=${offset}`;
          return fetch(url, {
            method: "GET",
            headers: authHeader,
          })
            .then((res) => res.json())
            .then((data) => {
              tracks.push(
                ...data.items.map((i: any) => ({
                  name: i?.track?.name,
                  artists: i?.track?.artists.map((a: any) => a.name),
                }))
              );
            });
        })
      );
    }

    playlist.tracks = _.uniqWith(tracks, _.isEqual);
    return playlist;
  }

  export async function getUserPlaylists(
    userId: string,
    page: number
  ): Promise<SpotifyPlaylistResponse & { nextCursor?: number }> {
    console.log("getUserPlaylists", userId, page);
    const token = await getToken();
    const authHeader: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };
    let payload = (await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists?limit=${PLAYLISTS_PAGESIZE}&offset=${
        (page - 1) * PLAYLISTS_PAGESIZE
      }`,
      {
        method: "GET",
        headers: authHeader,
      }
    ).then((res) => res.json())) as SpotifyPlaylistResponse;
    // console.log(userId, page, payload);
    return {
      ...payload,
      nextCursor:
        payload.total > PLAYLISTS_PAGESIZE * page ? page + 1 : undefined,
    };
  }
}

const PAGESIZE = 100;
const PLAYLISTS_PAGESIZE = 50;
