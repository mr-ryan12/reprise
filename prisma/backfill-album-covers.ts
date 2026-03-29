import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { fetchAllShows } from "../app/services/phishin.server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🖼️  Backfilling album cover URLs...");

  const shows = await fetchAllShows();
  console.log(`  Fetched ${shows.length} shows from Phish.in`);

  let updated = 0;
  for (const show of shows) {
    if (show.album_cover_url) {
      await prisma.show.updateMany({
        where: { date: new Date(show.date) },
        data: { albumCoverUrl: show.album_cover_url },
      });
      updated++;
    }
  }

  console.log(`✅ Updated ${updated} shows with album cover URLs`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
