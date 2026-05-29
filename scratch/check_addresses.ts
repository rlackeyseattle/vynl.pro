import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const venues = await prisma.venueProfile.findMany({
    take: 20,
    select: {
      id: true,
      name: true,
      address: true,
    }
  });
  console.log("Venues addresses:");
  venues.forEach(v => {
    console.log(`- [${v.name}]: "${v.address}"`);
  });
}

main().finally(() => prisma.$disconnect());
