import { ApiSearchResult, SearchResult, TabType } from "@/models/models";
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

export function getApiHeaders() {
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
    ).then((res) => {
      return res.json();
    });
    const items: ApiSearchResult[] = results.tabs;
    return items;
  }
}
