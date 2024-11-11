import crypto from "crypto";
import md5 from "md5";

function getClientId() {
  return crypto.randomBytes(8).toString("hex");
}

function getApiKey(clientId: string) {
  const now = new Date();
  const date = `${now.toISOString().slice(0, 10)}`;
  const hour = new Date().getUTCHours();
  return `${clientId}${date}:${hour}createLog()`;
}

function getApiHeaders() {
  const clientId = getClientId();
  const apiKey = getApiKey(clientId);
  return {
    "X-UG-CLIENT-ID": clientId,
    "X-UG-API-KEY": md5(apiKey),
    Accept: "application/json",
    "User-Agent": "UG_ANDROID/7.0.7 (Pixel; Android 11)",
  };
}

export namespace UGApi {
  export type SearchResult = {
    id: number;
    song_id: number;
    song_name: string;
    artist_id: number;
    artist_name: string;
    type: string;
    part: string;
    version: number;
    votes: number;
    rating: number;
    date: string;
    status: string;
    preset_id: number;
    tab_access_type: string;
    tp_version: number;
    tonality_name: string;
    version_description: string;
    verified: number;
    recording: {};
  };

  export type TabInfo = {
    id: number;
    song_id: number;
    song_name: string;
    artist_id: number;
    artist_name: string;
    type: string;
    part: string;
    version: number;
    votes: number;
    difficulty: string;
    rating: number;
    date: string;
    status: string;
    preset_id: number;
    tab_access_type: string;
    tp_version: number;
    tonality_name: string;
    version_description: string | null;
    verified: number;
    recording: {
      is_acoustic: number;
      tonality_name: string;
      performance: string | null;
      recording_artists: any[];
    };
    album_cover: {
      has_album_cover: boolean;
      app_album_cover: {
        small: string;
      };
    };
    artist_cover: {
      has_artist_cover: boolean;
      app_artist_cover: {
        small: string;
      };
    };
    versions: Array<{
      id: number;
      song_id: number;
      song_name: string;
      artist_id: number;
      artist_name: string;
      type: string;
      part: string;
      version: number;
      votes: number;
      difficulty: string;
      rating: number;
      date: string;
      status: string;
      preset_id: number;
      tab_access_type: string;
      tp_version: number;
      tonality_name: string;
      version_description: string | null;
      verified: number;
      recording: {
        is_acoustic: number;
        tonality_name: string;
        performance: string | null;
        recording_artists: any[];
      };
      album_cover: {
        has_album_cover: boolean;
        app_album_cover: {
          small: string;
        };
      };
      artist_cover: {
        has_artist_cover: boolean;
        app_artist_cover: {
          small: string;
        };
      };
    }>;
    userRating: number;
    tuning: string;
    capo: number;
    urlWeb: string;
    strumming: any[];
    videosCount: number;
    comments_count: number;
    contributor: {
      user_id: number;
      username: string;
    };
    content: string;
  };

  export async function getSearch(params: {
    title: string;
    page: number;
    type?: number;
  }) {
    const stringifiedParams = Object.fromEntries(
      Object.entries(params)
        .filter(([k, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    console.log(stringifiedParams);
    const paramString = new URLSearchParams(stringifiedParams).toString();
    const headers = getApiHeaders();
    console.log("headers", headers);
    console.log(paramString);
    const results = await fetch(
      "https://api.ultimate-guitar.com/api/v1/tab/search?" + paramString,
      {
        headers,
      }
    ).then((res) => res.json());
    console.log({ ...results, tabs: undefined });
    const items: SearchResult[] = results.tabs;
    // return items;
    return (items ?? []).filter(
      (i) => !["Power", "Official", "Pro"].includes(i.type)
    );
  }

  export async function getTab(params: { tab_id: number }) {
    const stringifiedParams = Object.fromEntries(
      Object.entries(params)
        .filter(([k, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    console.log(stringifiedParams);
    const paramString = new URLSearchParams({
      ...stringifiedParams,
      tab_access_type: "public",
    }).toString();
    const headers = getApiHeaders();
    console.log("headers", headers);
    console.log(paramString);
    const results: TabInfo = await fetch(
      "https://api.ultimate-guitar.com/api/v1/tab/info?" + paramString,
      {
        headers,
      }
    ).then((res) => res.json());
    return results;
  }
}
