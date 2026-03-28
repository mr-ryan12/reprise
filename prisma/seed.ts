import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  fetchAllShows,
  fetchShowDetail,
  fetchAllSongs,
  type PhishinVenue,
} from "../app/services/phishin.server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Fetch and upsert songs
  console.log("Fetching songs from Phish.in...");
  const songs = await fetchAllSongs();
  console.log(`  Found ${songs.length} songs. Upserting...`);
  for (const song of songs) {
    await prisma.song.upsert({
      where: { slug: song.slug },
      update: { title: song.title, original: song.original, artist: song.artist },
      create: {
        slug: song.slug,
        title: song.title,
        original: song.original,
        artist: song.artist,
      },
    });
  }
  console.log("  Songs done.");

  // 2. Fetch all shows (includes venue data)
  console.log("Fetching shows from Phish.in...");
  const shows = await fetchAllShows();
  console.log(`  Found ${shows.length} shows.`);

  // 3. Upsert venues from show data (dedupe by slug)
  const venueMap = new Map<string, PhishinVenue>();
  for (const show of shows) {
    if (!venueMap.has(show.venue.slug)) {
      venueMap.set(show.venue.slug, show.venue);
    }
  }
  console.log(`  Found ${venueMap.size} unique venues. Upserting...`);
  const venueIdBySlug = new Map<string, string>();
  for (const venue of venueMap.values()) {
    const record = await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {
        name: venue.name,
        city: venue.city,
        state: venue.state,
        country: venue.country,
      },
      create: {
        slug: venue.slug,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        country: venue.country,
      },
    });
    venueIdBySlug.set(venue.slug, record.id);
  }
  console.log("  Venues done.");

  // 4. Upsert shows and fetch track details
  console.log("Upserting shows and fetching track data...");
  const songSlugToId = new Map<string, string>();
  const allSongRecords = await prisma.song.findMany({ select: { id: true, slug: true } });
  for (const s of allSongRecords) {
    songSlugToId.set(s.slug, s.id);
  }

  let showCount = 0;
  for (const show of shows) {
    showCount++;
    if (showCount % 100 === 0) {
      console.log(`  Processing show ${showCount}/${shows.length} (${show.date})...`);
    }

    const venueId = venueIdBySlug.get(show.venue.slug)!;
    const showRecord = await prisma.show.upsert({
      where: { date: new Date(show.date) },
      update: {
        duration: show.duration,
        tourName: show.tour_name,
        notes: show.taper_notes,
        venueId,
      },
      create: {
        date: new Date(show.date),
        duration: show.duration,
        tourName: show.tour_name,
        notes: show.taper_notes,
        venueId,
      },
    });

    // Fetch track/setlist detail for this show
    try {
      const detail = await fetchShowDetail(show.date);
      // Delete existing tracks for idempotent re-runs
      await prisma.track.deleteMany({ where: { showId: showRecord.id } });

      for (const track of detail.tracks) {
        const song = track.songs[0];
        if (!song) continue;

        let songId = songSlugToId.get(song.slug);
        if (!songId) {
          // Song not in catalog — create it
          const newSong = await prisma.song.upsert({
            where: { slug: song.slug },
            update: {},
            create: {
              slug: song.slug,
              title: song.title,
              original: song.original,
              artist: song.artist,
            },
          });
          songId = newSong.id;
          songSlugToId.set(song.slug, songId);
        }

        await prisma.track.create({
          data: {
            showId: showRecord.id,
            songId,
            setName: track.set_name,
            position: track.position,
            duration: track.duration,
          },
        });
      }
    } catch (err) {
      console.warn(`  ⚠️  Failed to fetch tracks for ${show.date}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`✅ Seed complete. ${showCount} shows processed.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
