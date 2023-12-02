import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

const newTabSchema = z.object({
  taburl: z.string(),
  folder: z.string(),
  name: z.string(),
  artist: z.string(),
  type: z.string(),
  version: z.number(),
});

const schema = z.object({
  newTab: newTabSchema,
});
type Schema = z.infer<typeof schema>;

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log("tablinks", req.method, req.body);
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    const userId = (session.token as JWT & { account: any }).account
      .providerAccountId as string;

    switch (req.method) {
      case "GET": {
        const result = await prisma.userTablink.findMany({
          where: {
            spotifyUserId: userId,
          },
        });
        console.log("result", result);
        res.status(200).json(result);

        break;
      }
      case "POST": {
        const response = schema.safeParse(req.body);
        if (!response.success) {
          return res.status(400).json({
            error: response.error,
          });
        }
        const {
          newTab: { taburl, folder, name, artist, type, version },
        } = req.body as Schema;

        const result = await prisma.userTablink.upsert({
          create: {
            id: `${userId}-${taburl}-${folder}`,
            spotifyUserId: userId,
            taburl,
            folder,
            name,
            artist,
            type,
            version,
          },
          update: {
            spotifyUserId: userId,
            taburl,
            folder,
            name,
            artist,
            type,
            version,
          },
          where: {
            id: `${userId}-${taburl}-${folder}`,
          },
        });

        res.status(200).json(result);

        break;
      }
      default:
        return res.status(405).json({ error: "Invalid method" });
    }
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
};
