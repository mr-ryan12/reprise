import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { fetchAllShows, fetchShowDetail } from "../app/services/phishin.server";
import {
  upsertVenue,
  upsertShow,
  syncShowTracks,
} from "../app/services/show-sync.server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Overlap window (days) re-scanned on every run so late-arriving audio/mp3Urls
// on recently-added shows get filled in without re-processing the whole catalog.
const WINDOW_DAYS = 45;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function main() {
  console.log("🔄 Starting incremental update...");

  const latestShow = await prisma.show.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!latestShow) {
    console.log(
      "No shows found in the database. Run `yarn db:seed` first to perform an initial full seed."
    );
    return;
  }

  const windowStart = new Date(latestShow.date);
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);
  const startDate = formatDate(windowStart);

  console.log(`  Window start: ${startDate} (latest show: ${formatDate(latestShow.date)})`);

  const shows = await fetchAllShows({ startDate, sort: "date:asc" });
  console.log(`  Found ${shows.length} shows in window.`);

  const songSlugToId = new Map<string, string>();
  const allSongRecords = await prisma.song.findMany({ select: { id: true, slug: true } });
  for (const s of allSongRecords) {
    songSlugToId.set(s.slug, s.id);
  }

  let showCount = 0;
  let trackCount = 0;

  for (const show of shows) {
    showCount++;

    const venueId = await upsertVenue(prisma, show.venue);
    const showRecord = await upsertShow({ prisma, show, venueId });

    try {
      const detail = await fetchShowDetail(show.date);
      const n = await syncShowTracks({
        prisma,
        showId: showRecord.id,
        detail,
        songSlugToId,
      });
      trackCount += n;
    } catch (err) {
      console.warn(`  ⚠️  Failed to fetch tracks for ${show.date}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(
    `✅ Update complete. Window start: ${startDate}. ${showCount} shows scanned, ${trackCount} tracks upserted.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
