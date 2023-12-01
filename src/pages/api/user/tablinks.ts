import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log("tablinks", req.method, req.body);
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    const userId = (session.token as JWT & { account: any }).account
      .providerAccountId;
    if (req.method === "GET") {
      const result = await prisma.user.findFirst({
        where: {
          spotifyUserId: userId,
        },
      });
      res.status(200).json(result);
    } else if (req.method === "POST") {
      await prisma.user.upsert({
        where: {
          spotifyUserId: userId,
        },
        update: {
          tablink: req.body.tablinks,
        },
        create: {
          spotifyUserId: userId,
          tablink: req.body.tablinks,
        },
      });
    }
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
};
