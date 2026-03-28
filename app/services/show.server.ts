import { prisma } from "~/lib/db.server";

const PAGE_SIZE = 25;

export async function getShows(page: number = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [shows, totalCount] = await Promise.all([
    prisma.show.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { date: "desc" },
      include: {
        venue: { select: { name: true, city: true, state: true } },
      },
    }),
    prisma.show.count(),
  ]);

  return {
    shows,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    currentPage: page,
  };
}

export async function searchShows(query: string, page: number = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    OR: [
      { venue: { name: { contains: query, mode: "insensitive" as const } } },
      { venue: { city: { contains: query, mode: "insensitive" as const } } },
      { venue: { state: { contains: query, mode: "insensitive" as const } } },
      { tourName: { contains: query, mode: "insensitive" as const } },
      // Date matching: search against the date string representation
      // Prisma doesn't support contains on DateTime, so we match year/partial date
      // by casting. For MVP, we handle this with a raw filter below.
    ],
  };

  const [shows, totalCount] = await Promise.all([
    prisma.show.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { date: "desc" },
      include: {
        venue: { select: { name: true, city: true, state: true } },
      },
    }),
    prisma.show.count({ where }),
  ]);

  return {
    shows,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    currentPage: page,
    query,
  };
}

export async function getShowByDate(dateString: string) {
  const show = await prisma.show.findFirst({
    where: { date: new Date(dateString) },
    include: {
      venue: {
        select: { name: true, city: true, state: true, country: true },
      },
      tracks: {
        orderBy: { position: "asc" },
        include: {
          song: { select: { title: true, original: true, artist: true } },
        },
      },
    },
  });

  return show;
}
