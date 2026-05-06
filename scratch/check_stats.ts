import { prisma } from "../src/lib/prisma";

async function checkData() {
  const venues = await prisma.venueProfile.count();
  const bands = await prisma.bandProfile.count();
  console.log(`📊 Database Stats:\nVenues: ${venues}\nBands: ${bands}`);
}

checkData().catch(console.error);
