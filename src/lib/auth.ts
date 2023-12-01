import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Spotify from "next-auth/providers/spotify";

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
      console.log(
        "signIn",
        JSON.stringify({ user, account, profile, email, credentials }, null, 2)
      );
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    session({ session, token }) {
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.account = account;
      }
      return token;
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
