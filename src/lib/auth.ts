import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Spotify from "next-auth/providers/spotify";
import prisma from "./prisma";

export const authOptions = {
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      // console.log(
      //   "signIn",
      //   JSON.stringify({ user, account, profile, email, credentials }, null, 2)
      // );
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async session({ session, token }) {
      const extendedSession = { ...session, token: token };
      return extendedSession;
    },
    async jwt({ token, account }) {
      if (account) {
        token.account = account;
      }
      return token;
    },
  },
  events: {
    async signIn(message) {
      console.log("signIn", JSON.stringify(message, null, 2));
      const result = await prisma.user.upsert({
        where: {
          spotifyUserId: message.user.id,
        },
        create: {
          spotifyUserId: message.user.id,
        },
        update: {},
      });
    },
  },
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
