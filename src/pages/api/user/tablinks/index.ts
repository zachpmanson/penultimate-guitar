import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

const newTabSchema = z.object({
  taburl: z.string(),
  name: z.string(),
  artist: z.string(),
  type: z.string().optional(),
  version: z.number(),
  folder: z.string().optional(),
});
type DeleteSchema = z.infer<typeof newTabSchema>;

const schema = z.object({
  newTab: newTabSchema,
  folders: z.array(z.string()),
});
type PostSchema = z.infer<typeof schema>;

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log("tablinks", req.method, req.body);
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    const userId = (session.token as JWT & { account: any }).account
      .providerAccountId as string;

    switch (req.method) {
      case "GET": {
        const result = await prisma.userTablink.findMany({
          where: {
            spotifyUserId: userId,
          },
        });
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
          newTab: { taburl, name, artist, type, version },
          folders,
        } = req.body as PostSchema;

        for (const folder of folders) {
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
        }

        const result = await prisma.userTablink.deleteMany({
          where: {
            spotifyUserId: userId,
            taburl,
            NOT: {
              folder: {
                in: folders,
              },
            },
          },
        });

        res.status(200).json({ status: "success" });

        break;
      }

      case "DELETE": {
        const response = newTabSchema.safeParse(req.body);
        if (!response.success) {
          return res.status(400).json({
            error: response.error,
          });
        }
        const { taburl, folder } = req.body as DeleteSchema;

        const result = await prisma.userTablink.deleteMany({
          where: {
            spotifyUserId: userId,
            taburl,
            folder,
          },
        });

        console.log(result);

        res.status(200).json({ status: "success" });
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
