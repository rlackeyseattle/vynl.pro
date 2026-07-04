import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching existing venues...");
  const venues = await prisma.venueProfile.findMany();
  console.log(`Found ${venues.length} venues in the database.`);

  const sampleVenuesData: Record<string, any> = {
    "1015 folsom": {
      bookingDays: "Thursday, Friday, Saturday",
      averagePay: "$1000 - $3000",
      payType: "FLAT",
      ageRequirement: "21+",
      capacity: 1000,
      targetBookingNights: "Friday EDM Nights, Saturday Underground Techno",
      targetBandsDescription: "Electronic producers, Live Synth/Keyboard players, EDM/Indie Pop crossover acts",
      interiorImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1770&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop"
    },
    "crocodile": {
      bookingDays: "Wednesday, Thursday, Friday, Saturday",
      averagePay: "$800 - $2500",
      payType: "DOOR",
      ageRequirement: "All Ages / 21+ Bars",
      capacity: 750,
      targetBookingNights: "Thursday Indie Showcase, Friday/Saturday Headliners",
      targetBandsDescription: "Alternative Rock, Indie Rock, Post-Punk, touring regional acts with established local draw",
      interiorImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1770&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=1974&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
    },
    "neumos": {
      bookingDays: "Wednesday, Thursday, Friday, Saturday, Sunday",
      averagePay: "$600 - $2000",
      payType: "DOOR",
      ageRequirement: "All Ages",
      capacity: 650,
      targetBookingNights: "Wednesday Metal/Punk Night, Friday Indie Wave, Saturday Local Showcase",
      targetBandsDescription: "Metal, Hardcore Punk, Indie Pop, Dream Pop, Shoegaze, active touring bands",
      interiorImage: "https://images.unsplash.com/photo-1489641499593-b54144a9994b?q=80&w=2070&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1935&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2070&auto=format&fit=crop"
    },
    "showbox": {
      bookingDays: "Thursday, Friday, Saturday",
      averagePay: "$1500 - $5000",
      payType: "FLAT",
      ageRequirement: "All Ages",
      capacity: 1150,
      targetBookingNights: "Thursday Regional Showcase, Friday/Saturday Touring Headliners",
      targetBandsDescription: "National touring bands, highly established regional acts with minimum 300+ local draw",
      interiorImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1770&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1579935110464-fcd041be62d0?q=80&w=2070&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1770&auto=format&fit=crop"
    },
    "tractor": {
      bookingDays: "Tuesday, Thursday, Friday, Saturday, Sunday",
      averagePay: "$500 - $1500",
      payType: "DOOR",
      ageRequirement: "21+",
      capacity: 400,
      targetBookingNights: "Tuesday Country/Bluegrass, Thursday Folk Night, Friday/Saturday Indie Rock",
      targetBandsDescription: "Folk, Americana, Country, Bluegrass, Roots Rock, acoustic singer-songwriters",
      interiorImage: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1935&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=1974&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
    },
    "triple door": {
      bookingDays: "Wednesday, Thursday, Friday, Saturday, Sunday",
      averagePay: "$750 - $2500",
      payType: "FLAT",
      ageRequirement: "All Ages",
      capacity: 300,
      targetBookingNights: "Thursday Jazz Sessions, Friday Lounge Pop, Saturday Acoustic Spotlight",
      targetBandsDescription: "Jazz, Lounge, Acoustic Pop, Neo-Soul, high-quality seating-room acts",
      interiorImage: "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1579935110464-fcd041be62d0?q=80&w=2070&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop"
    }
  };

  const usedSlugs = new Set<string>();

  for (const venue of venues) {
    const nameLower = venue.name.toLowerCase();
    
    // Find matching details
    let matchedData = null;
    let matchedKey = "";
    for (const key of Object.keys(sampleVenuesData)) {
      if (nameLower.includes(key)) {
        matchedData = sampleVenuesData[key];
        matchedKey = key;
        break;
      }
    }

    // Determine base slug
    let baseSlug = venue.slug || nameLower.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!baseSlug || baseSlug === "-") {
      baseSlug = `venue-${venue.id.slice(-6)}`;
    }

    // Resolve duplicates
    let finalSlug = baseSlug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    const dataToUpdate = matchedData || {
      bookingDays: "Friday, Saturday",
      averagePay: "$300 - $1000",
      payType: "FLAT",
      ageRequirement: "21+",
      capacity: venue.capacity || 250,
      targetBookingNights: "Weekend Live Music Nights",
      targetBandsDescription: "Open to various genres: Rock, Indie, Acoustic, Cover bands",
      interiorImage: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1935&auto=format&fit=crop",
      exteriorImage: "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop",
      stageImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1770&auto=format&fit=crop"
    };

    console.log(`Updating "${venue.name}" to slug "${finalSlug}"... (Match key: ${matchedKey || "FALLBACK"})`);
    await prisma.venueProfile.update({
      where: { id: venue.id },
      data: {
        slug: finalSlug,
        bookingDays: dataToUpdate.bookingDays,
        averagePay: dataToUpdate.averagePay,
        payType: dataToUpdate.payType,
        ageRequirement: dataToUpdate.ageRequirement,
        capacity: dataToUpdate.capacity,
        targetBookingNights: dataToUpdate.targetBookingNights,
        targetBandsDescription: dataToUpdate.targetBandsDescription,
        interiorImage: dataToUpdate.interiorImage,
        exteriorImage: dataToUpdate.exteriorImage,
        stageImage: dataToUpdate.stageImage,
      }
    });
  }

  console.log("Venues database successfully populated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
