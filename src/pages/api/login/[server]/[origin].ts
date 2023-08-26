import { getApp, getRedirectURI } from "@/lib/mastodon/utils";
import { SpotifyAdapter } from "@/lib/spotify-interface/spotify-interface";
import { Playlist } from "@/models/models";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET":
      let { server, origin, code } = req.query;

      if (!server || Array.isArray(server) || !origin || Array.isArray(origin))
        return res.status(400);

      server = server.toLocaleLowerCase().trim();
      origin = decodeURIComponent(origin);
      const app = await getApp(origin, server);

      if (!app) {
        return res
          .status(400)
          .json({ error: `App not registered for server: ${server}` });
      }

      if (!code) {
        return res.status(422).json({ error: `Missing authentication code` });
      }

      try {
        const result: any = await fetch(`https://${server}/oauth/token`, {
          method: "POST",
          body: JSON.stringify({
            client_id: app.client_id,
            client_secret: app.client_secret,
            redirect_uri: getRedirectURI(origin, server),
            grant_type: "authorization_code",
            code,
            scope: "read write follow push",
          }),
          // retry: 3,
        }).then((res) => res.json());

        const url = `/signin/callback?${stringifyQuery({
          server,
          token: result.access_token,
          vapid_key: app.vapid_key,
        })}`;
        await sendRedirect(event, url, 302);
      } catch (e) {
        throw createError({
          statusCode: 400,
          statusMessage: "Could not complete log in.",
        });
      }

      break;
    default:
      return res.status(405).json({ error: "Invalid method" });
  }
}

export function stringifyQuery(query: { [k: string]: string }) {
  return Object.keys(query)
    .filter((k) => query[k] !== undefined)
    .map((k) => [k, query[k]])
    .join("&");
}
