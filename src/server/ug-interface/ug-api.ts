import { toParams } from "@/utils/url";
import crypto from "crypto";
import md5 from "md5";
import { z } from "zod";

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
  const searchResultSchema = z.object({
    id: z.number(),
    song_id: z.number(),
    song_name: z.string(),
    artist_id: z.number(),
    artist_name: z.string(),
    type: z.string(),
    part: z.string(),
    version: z.number(),
    votes: z.number(),
    rating: z.number(),
    date: z.string(),
    status: z.string(),
    preset_id: z.number(),
    tab_access_type: z.string(),
    tp_version: z.number(),
    tonality_name: z.string(),
    version_description: z.string().nullable(),
    verified: z.number(),
  });
  const searchPayloadSchema = z.object({
    tabs: searchResultSchema.array(),
  });

  export type SearchResult = z.infer<typeof searchResultSchema>;

  // export type TabInfo = {
  //   id: number;
  //   song_id: number;
  //   song_name: string;
  //   artist_id: number;
  //   artist_name: string;
  //   type: string;
  //   part: string;
  //   version: number;
  //   votes: number;
  //   difficulty: string;
  //   rating: number;
  //   date: string;
  //   status: string;
  //   preset_id: number;
  //   tab_access_type: string;
  //   tp_version: number;
  //   tonality_name: string;
  //   version_description: string | null;
  //   verified: number;
  //   recording: {
  //     is_acoustic: number;
  //     tonality_name: string;
  //     performance: string | null;
  //     recording_artists: any[];
  //   };
  //   album_cover: {
  //     has_album_cover: boolean;
  //     app_album_cover: {
  //       small: string;
  //     };
  //   };
  //   artist_cover: {
  //     has_artist_cover: boolean;
  //     app_artist_cover: {
  //       small: string;
  //     };
  //   };
  //   versions: Array<{
  //     id: number;
  //     song_id: number;
  //     song_name: string;
  //     artist_id: number;
  //     artist_name: string;
  //     type: string;
  //     part: string;
  //     version: number;
  //     votes: number;
  //     difficulty: string;
  //     rating: number;
  //     date: string;
  //     status: string;
  //     preset_id: number;
  //     tab_access_type: string;
  //     tp_version: number;
  //     tonality_name: string;
  //     version_description: string | null;
  //     verified: number;
  //     recording: {
  //       is_acoustic: number;
  //       tonality_name: string;
  //       performance: string | null;
  //       recording_artists: any[];
  //     };
  //     album_cover: {
  //       has_album_cover: boolean;
  //       app_album_cover: {
  //         small: string;
  //       };
  //     };
  //     artist_cover: {
  //       has_artist_cover: boolean;
  //       app_artist_cover: {
  //         small: string;
  //       };
  //     };
  //   }>;
  //   userRating: number;
  //   tuning: string;
  //   capo: number;
  //   urlWeb: string;
  //   strumming: any[];
  //   videosCount: number;
  //   comments_count: number;
  //   contributor: {
  //     user_id: number;
  //     username: string;
  //   };
  //   content: string;
  // };

  export const tabInfoSchema = z.object({
    id: z.number(),
    song_id: z.number(),
    song_name: z.string(),
    artist_id: z.number(),
    artist_name: z.string(),
    type: z.string(),
    part: z.string(),
    version: z.number(),
    votes: z.number(),
    difficulty: z.string(),
    rating: z.number(),
    date: z.string(),
    status: z.string(),
    preset_id: z.number(),
    tab_access_type: z.string(),
    tp_version: z.number(),
    tonality_name: z.string(),
    version_description: z.string().nullable(),
    verified: z.number(),

    userRating: z.number(),
    tuning: z.string(),
    capo: z.number(),
    urlWeb: z.string(),
    // strumming: z.array(z.string()),
    videosCount: z.number(),
    comments_count: z.number(),
    contributor: z.object({
      user_id: z.number(),
      username: z.string(),
    }),
    content: z.string(),
    versions: z.array(
      z.object({
        id: z.number(),
        song_id: z.number(),
        song_name: z.string(),
        artist_id: z.number(),
        artist_name: z.string(),
        type: z.string(),
        part: z.string().optional(), // Optional because it can be empty
        version: z.number(),
        votes: z.number(),
        difficulty: z.string().optional(), // Optional because it can be empty
        rating: z.number(),
        date: z.string(), // Assuming it's a string (e.g., timestamp)
        status: z.string(),
        preset_id: z.number(),
        tab_access_type: z.string(),
        tp_version: z.number(),
        tonality_name: z.string().optional(), // Optional because it can be empty
        version_description: z.string().nullable(), // Nullable because it can be null
        verified: z.number(),
      })
    ),
  });
  export type TabInfo = z.infer<typeof tabInfoSchema>;

  export async function getSearch(params: {
    title: string;
    page: number;
    type?: number;
  }) {
    const start = new Date().getTime();
    const query = toParams(params);
    const headers = getApiHeaders();
    const data = await fetch(
      `https://api.ultimate-guitar.com/api/v1/tab/search?${query}`,
      {
        headers,
      }
    );
    const status = data.status;

    const results = await data.json();

    console.log("getSearch fetch time", new Date().getTime() - start);
    // console.log(results);

    const { tabs } =
      status === 404 ? { tabs: [] } : searchPayloadSchema.parse(results);
    // return items;
    console.log("getSearch", new Date().getTime() - start);

    return (tabs ?? []).filter(
      (i) => !["Power", "Official", "Pro"].includes(i.type)
    );
  }

  export async function getTab(params: { tab_id: number }) {
    const start = new Date().getTime();
    const query = toParams({ ...params, tab_access_type: "public" });

    const headers = getApiHeaders();
    const res = await fetch(
      `https://api.ultimate-guitar.com/api/v1/tab/info?${query}`,
      {
        headers,
      }
    );
    const data = await res.json();

    // console.log(data);
    console.log(`Fetched ${params.tab_id}`);

    const tab = tabInfoSchema.parse(data);
    tab.content = tab.content.replace(/\r\n/g, "\n");

    console.log("getTab", new Date().getTime() - start);
    return tab;
  }
}
