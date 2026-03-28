import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { fetchShowDetail } from "../app/services/phishin.server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get all distinct show dates that have tracks without mp3Url
  const shows = await prisma.show.findMany({
    where: {
      tracks: {
        some: {
          mp3Url: null,
        },
      },
    },
    select: {
      id: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  console.log(`Found ${shows.length} shows with tracks missing mp3Url.`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < shows.length; i++) {
    const show = shows[i];
    const dateStr = show.date.toISOString().split("T")[0];

    if ((i + 1) % 100 === 0) {
      console.log(
        `  Progress: ${i + 1}/${shows.length} (${dateStr}) — ${updated} tracks updated`
      );
    }

    try {
      const detail = await fetchShowDetail(dateStr);

      for (const track of detail.tracks) {
        if (!track.mp3_url) continue;

        await prisma.track.updateMany({
          where: {
            showId: show.id,
            position: track.position,
            mp3Url: null,
          },
          data: {
            mp3Url: track.mp3_url,
          },
        });
        updated++;
      }
    } catch (err) {
      failed++;
      console.warn(
        `  Failed to fetch ${dateStr}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log(
    `\nDone. ${updated} tracks updated, ${failed} shows failed.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
