import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.venueProfile.count();
  console.log(`Current Venue Count: ${count}`);
}

main().finally(() => prisma.$disconnect());
