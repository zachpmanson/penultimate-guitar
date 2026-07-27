import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
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
    // "Log in with Nextcloud" — PoC of unified SSO via Nextcloud's OIDC
    // Identity Provider app. Only registered when the client env vars are
    // present, so deployments without them keep the Spotify-only flow.
    ...(process.env.NEXTCLOUD_ISSUER && process.env.NEXTCLOUD_CLIENT_ID
      ? [
          {
            id: "nextcloud",
            name: "Nextcloud",
            type: "oauth" as const,
            // NextAuth reads the discovery doc for the concrete endpoints.
            // The index.php form works regardless of Nextcloud's URL rewriting.
            wellKnown: `${process.env.NEXTCLOUD_ISSUER}/index.php/apps/oidc/openid-configuration`,
            authorization: { params: { scope: "openid profile email" } },
            idToken: true,
            // Nextcloud's oidc app supports PKCE on recent versions. If the
            // token exchange fails on an older build, drop this to ["state"].
            checks: ["pkce", "state"] as ("pkce" | "state")[],
            clientId: process.env.NEXTCLOUD_CLIENT_ID!,
            clientSecret: process.env.NEXTCLOUD_CLIENT_SECRET!,
            profile(profile: { sub: string; name?: string; preferred_username?: string; email?: string; picture?: string }) {
              return {
                id: profile.sub,
                name: profile.name ?? profile.preferred_username,
                email: profile.email,
                image: profile.picture,
              };
            },
          },
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    session({ session, token, user }) {
      if (token.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
        };
      }
      return session;
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
      // The user table is keyed on spotifyUserId, so only persist a row for
      // Spotify sign-ins. Nextcloud PoC logins get a valid JWT session but no
      // saved-tabs persistence yet — see the account model note in the PR.
      if (message.account?.provider !== "spotify") return;
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
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthOptions;

// Use it in server contexts
export function getServerAuthSession(
  ...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []
) {
  // console.log("getServerAuthSession", args);
  return getServerSession(...args, authOptions);
}

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
    } & DefaultSession["user"];
  }
}
