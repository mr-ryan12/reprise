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

/**
 * Parse a query string into a date range if it looks like a date.
 * Supports: YYYY, MM/DD/YYYY, MM-DD-YYYY, YYYY-MM-DD, MM/YYYY, MM-YYYY
 */
function parseDateRange(
  query: string,
): { gte: Date; lt: Date } | null {
  const q = query.trim();

  // YYYY — full year
  if (/^\d{4}$/.test(q)) {
    const year = parseInt(q, 10);
    if (year >= 1983 && year <= 2100) {
      return { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) };
    }
  }

  // YYYY-MM-DD
  const isoMatch = q.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const d = new Date(`${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`);
    if (!isNaN(d.getTime())) {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return { gte: d, lt: next };
    }
  }

  // MM/DD/YYYY or MM-DD-YYYY
  const usMatch = q.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (usMatch) {
    const d = new Date(`${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`);
    if (!isNaN(d.getTime())) {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return { gte: d, lt: next };
    }
  }

  // MM/YYYY or MM-YYYY — full month
  const monthYearMatch = q.match(/^(\d{1,2})[/-](\d{4})$/);
  if (monthYearMatch) {
    const month = parseInt(monthYearMatch[1], 10);
    const year = parseInt(monthYearMatch[2], 10);
    if (month >= 1 && month <= 12) {
      return {
        gte: new Date(`${year}-${String(month).padStart(2, "0")}-01`),
        lt: new Date(month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`),
      };
    }
  }

  return null;
}

export async function searchShows(query: string, page: number = 1) {
  const skip = (page - 1) * PAGE_SIZE;
  const dateRange = parseDateRange(query);

  const textFilters = [
    { venue: { name: { contains: query, mode: "insensitive" as const } } },
    { venue: { city: { contains: query, mode: "insensitive" as const } } },
    { venue: { state: { contains: query, mode: "insensitive" as const } } },
    { tourName: { contains: query, mode: "insensitive" as const } },
    {
      tracks: {
        some: {
          song: { title: { contains: query, mode: "insensitive" as const } },
        },
      },
    },
  ];

  const orFilters: Record<string, unknown>[] = [...textFilters];
  if (dateRange) {
    orFilters.push({ date: { gte: dateRange.gte, lt: dateRange.lt } });
  }

  const where = { OR: orFilters };

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
