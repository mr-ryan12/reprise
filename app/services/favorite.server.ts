import { prisma } from "~/lib/db.server";

export async function toggleFavorite(userId: string, showId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_showId: { userId, showId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return false; // unfavorited
  }

  await prisma.favorite.create({ data: { userId, showId } });
  return true; // favorited
}

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      show: {
        include: {
          venue: { select: { name: true, city: true, state: true } },
        },
      },
    },
  });
}

export async function isShowFavorited(
  userId: string,
  showId: string,
): Promise<boolean> {
  const fav = await prisma.favorite.findUnique({
    where: { userId_showId: { userId, showId } },
  });
  return fav !== null;
}

export async function getUserFavoriteShowIds(
  userId: string,
): Promise<Set<string>> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { showId: true },
  });
  return new Set(favorites.map((f) => f.showId));
}
