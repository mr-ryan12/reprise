import type { PrismaClient, Show } from "../../generated/prisma/client";
import type {
  PhishinVenue,
  PhishinShowSummary,
  PhishinShowDetail,
} from "./phishin.server";

/**
 * Upsert a Venue by its unique slug. Used by both the full seed and the
 * incremental update job so the two scripts can't drift.
 */
export async function upsertVenue(
  prisma: PrismaClient,
  venue: PhishinVenue,
): Promise<string> {
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

  return record.id;
}

interface UpsertShowParams {
  prisma: PrismaClient;
  show: PhishinShowSummary;
  venueId: string;
}

/**
 * Upsert a Show by its unique date.
 */
export async function upsertShow({
  prisma,
  show,
  venueId,
}: UpsertShowParams): Promise<Show> {
  return prisma.show.upsert({
    where: { date: new Date(show.date) },
    update: {
      duration: show.duration,
      tourName: show.tour_name,
      notes: show.taper_notes,
      albumCoverUrl: show.album_cover_url,
      venueId,
    },
    create: {
      date: new Date(show.date),
      duration: show.duration,
      tourName: show.tour_name,
      notes: show.taper_notes,
      albumCoverUrl: show.album_cover_url,
      venueId,
    },
  });
}

interface SyncShowTracksParams {
  prisma: PrismaClient;
  showId: string;
  detail: PhishinShowDetail;
  songSlugToId: Map<string, string>;
}

/**
 * Upsert every track for a show by its composite (showId, position) key.
 *
 * IMPORTANT: this never deletes tracks. TrackFavorite cascades on Track
 * delete, so a delete-then-recreate strategy would silently wipe users'
 * saved tracks. Idempotent re-runs simply update in place.
 *
 * Returns the count of tracks upserted.
 */
export async function syncShowTracks({
  prisma,
  showId,
  detail,
  songSlugToId,
}: SyncShowTracksParams): Promise<number> {
  let count = 0;

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

    await prisma.track.upsert({
      where: { showId_position: { showId, position: track.position } },
      update: {
        songId,
        setName: track.set_name,
        duration: track.duration,
        mp3Url: track.mp3_url ?? null,
      },
      create: {
        showId,
        songId,
        setName: track.set_name,
        position: track.position,
        duration: track.duration,
        mp3Url: track.mp3_url ?? null,
      },
    });

    count++;
  }

  return count;
}
