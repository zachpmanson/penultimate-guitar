import prisma from "./prisma";

export type Account = {
  id: string;
  username: string;
  spotifyUserId: string | null;
  spotifyRefreshToken: string | null;
};

// Resolve the edge identity (basicauth username) to the owning User row,
// creating it lazily on first sight. Folders / saved tabs hang off `User.id`
// (see schema), so every authed request resolves through here.
export async function getOrCreateAccountByUsername(username: string): Promise<Account> {
  return prisma.user.upsert({
    where: { username },
    create: { username },
    update: {},
  });
}