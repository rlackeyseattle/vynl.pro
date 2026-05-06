import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStats() {
  const venueCount = await prisma.venueProfile.count();
  const bandCount = await prisma.bandProfile.count();
  const resourceCount = await prisma.musicResource.count();
  const userCount = await prisma.user.count();

  console.log("\n📊 THE CIRCUIT PULSE:");
  console.log(`- Verified Venues:   ${venueCount}`);
  console.log(`- Active Artists:    ${bandCount}`);
  console.log(`- Industry Hubs:     ${resourceCount}`);
  console.log(`- Total Records:     ${venueCount + bandCount + resourceCount}`);
  console.log(`- Registered Users:  ${userCount}`);
  
  process.exit(0);
}

checkStats();
