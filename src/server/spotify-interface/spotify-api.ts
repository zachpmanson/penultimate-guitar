import { AccessReponse } from "./models";
import memoryCache from "memory-cache";
import { IndividualPlaylist, Track } from "@/models/models";
import _ from "lodash";
import { SpotifyPlaylistResponse } from "@/types/spotify";
export namespace SpotifyApi {
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
              accessResponse.expires_in - 100,
            );
          }
        });
    }

    return token;
  }

  async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function spotifyFetch(url: string): Promise<any> {
    const headers = await getAuthHeaders();
    return fetch(url, { method: "GET", headers }).then((res) => res.json());
  }

  function mapSpotifyTrack(item: any): Track {
    return {
      name: item.track.name,
      artists: item.track.artists.map((a: any) => a.name),
      trackId: item.track.uri.split(":").at(-1),
    };
  }

  export async function getPlaylist(
    playlistId: string,
  ): Promise<IndividualPlaylist> {
    let playlistPayload = await spotifyFetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,images,owner,description,tracks(total,items(track.name, track.artists(name), track.uri),limit,href,next)`,
    );

    console.log(
      `Pulling playlist ${playlistId} playlistPayload`,
      // JSON.stringify(playlistPayload, null, 2)
    );
    let playlist: IndividualPlaylist = {
      playlistId: playlistId,
      name: playlistPayload.name,
      image:
        playlistPayload?.images?.length > 0
          ? playlistPayload.images.at(-1).url
          : undefined,
      tracks: [],
      owner: playlistPayload.owner.display_name,
      description: playlistPayload.description,
    };

    // add first pageSize tracks
    let tracks: Track[] = playlistPayload.tracks.items.map(mapSpotifyTrack);

    if (playlistPayload.tracks.total > 100) {
      let pages = Math.floor(playlistPayload.tracks.total / PAGESIZE);
      let offsets = [...Array(pages).keys()].map(
        (pageNum) => (pageNum + 1) * PAGESIZE,
      );

      await Promise.all(
        offsets.map(async (offset) => {
          let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${PAGESIZE}&offset=${offset}`;
          const data = await spotifyFetch(url);
          tracks.push(...data.items.map(mapSpotifyTrack));
        }),
      );
    }

    playlist.tracks = _.uniqWith(tracks, _.isEqual);
    return playlist;
  }

  export async function getUserPlaylists(
    userId: string,
    page: number,
    pageSize: number = PLAYLISTS_PAGESIZE,
  ): Promise<SpotifyPlaylistResponse & { nextCursor?: number }> {
    console.log("getUserPlaylists", userId, page);
    let payload = (await spotifyFetch(
      `https://api.spotify.com/v1/users/${userId}/playlists?limit=${pageSize}&offset=${
        (page - 1) * pageSize
      }`,
    )) as SpotifyPlaylistResponse;
    // console.log(userId, page, payload);
    return {
      ...payload,
      nextCursor: payload.total > pageSize * page ? page + 1 : undefined,
    };
  }

  export async function getTrack(trackId: string): Promise<Track> {
    const start = new Date().getTime();
    let trackPayload = await spotifyFetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
    );
    // log time
    console.log("getTrack", new Date().getTime() - start);

    return {
      name: trackPayload.name,
      artists: trackPayload.artists.map((a: any) => a.name),
      trackId: trackPayload.id,
    };
  }
}

const PAGESIZE = 100;
const PLAYLISTS_PAGESIZE = 50;
