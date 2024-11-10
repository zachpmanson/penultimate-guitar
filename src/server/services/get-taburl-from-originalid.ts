import prisma from "../prisma";

export async function getTabFromOriginalId(originalId: number) {
  return await prisma.possibleSong.findFirst({
    where: {
      originalId: originalId,
    },
  });
}
