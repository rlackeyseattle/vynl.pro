import { prisma } from "../src/lib/prisma";

const sampleVenues = [
  {
    name: "The Fillmore",
    address: "1805 Geary Blvd, San Francisco, CA 94115",
    latitude: 37.7841,
    longitude: -122.4331,
    venueType: "CLUB",
    averagePay: "$1500-$5000",
    bookingEmail: "booking@fillmore.com",
  },
  {
    name: "Red Rocks Amphitheatre",
    address: "18300 W Alameda Pkwy, Morrison, CO 80465",
    latitude: 39.6654,
    longitude: -105.2057,
    venueType: "STADIUM",
    averagePay: "$10000+",
    bookingEmail: "events@redrocks.com",
  },
  {
    name: "First Avenue",
    address: "701 N 1st Ave, Minneapolis, MN 55403",
    latitude: 44.9789,
    longitude: -93.2725,
    venueType: "CLUB",
    averagePay: "$800-$3000",
    bookingEmail: "booking@first-avenue.com",
  },
  {
    name: "Stubbs BBQ",
    address: "801 Red River St, Austin, TX 78701",
    latitude: 30.2685,
    longitude: -97.7362,
    venueType: "CLUB",
    averagePay: "$500-$2500",
    bookingEmail: "booking@stubbsaustin.com",
  },
  {
    name: "The Bowery Ballroom",
    address: "6 Delancey St, New York, NY 10002",
    latitude: 40.7204,
    longitude: -73.9934,
    venueType: "CLUB",
    averagePay: "$1000-$4000",
    bookingEmail: "booking@boweryballroom.com",
  }
];

const sampleBands = [
  {
    name: "The Cosmic Echoes",
    genre: "Psychedelic Rock",
    latitude: 37.7749,
    longitude: -122.4194,
    location: "San Francisco, CA",
    coverOrOriginal: "ORIGINAL",
    bandType: "Full Band",
  },
  {
    name: "Neon Nights",
    genre: "Synthwave",
    latitude: 34.0522,
    longitude: -118.2437,
    location: "Los Angeles, CA",
    coverOrOriginal: "DJ",
    bandType: "Duo",
  },
  {
    name: "Bluegrass Junction",
    genre: "Bluegrass",
    latitude: 36.1627,
    longitude: -86.7816,
    location: "Nashville, TN",
    coverOrOriginal: "ORIGINAL",
    bandType: "Quartet",
  }
];

async function main() {
  console.log("Seeding database...");
  
  for (const v of sampleVenues) {
    await prisma.venueProfile.upsert({
      where: { name: v.name },
      update: v,
      create: v,
    });
  }

  for (const b of sampleBands) {
    const user = await prisma.user.upsert({
      where: { email: `${b.name.toLowerCase().replace(/ /g, '')}@example.com` },
      update: {},
      create: {
        email: `${b.name.toLowerCase().replace(/ /g, '')}@example.com`,
        role: "BAND",
        name: b.name,
      }
    });

    await prisma.bandProfile.upsert({
      where: { userId: user.id },
      update: b,
      create: {
        ...b,
        userId: user.id,
      }
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
