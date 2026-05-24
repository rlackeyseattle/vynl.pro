import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { crawlVenueIntelligence, callGrok } from "../src/lib/xai";

// Force load environmental variables for PostgreSQL cloud database access
dotenv.config();

const prisma = new PrismaClient();

// Comprehensive list of high-density US music hubs and high-sprawl cities
const US_MUSIC_HUBS = [
  // West Coast
  { name: "Seattle, WA", region: "West" },
  { name: "Portland, OR", region: "West" },
  { name: "San Francisco, CA", region: "West" },
  { name: "Los Angeles, CA", region: "West" },
  { name: "San Diego, CA", region: "West" },
  { name: "Denver, CO", region: "West" },
  { name: "Salt Lake City, UT", region: "West" },
  { name: "Phoenix, AZ", region: "West" },
  { name: "Las Vegas, NV", region: "West" },

  // South / Southeast
  { name: "Austin, TX", region: "South" },
  { name: "Nashville, TN", region: "South" },
  { name: "New Orleans, LA", region: "South" },
  { name: "Atlanta, GA", region: "South" },
  { name: "Miami, FL", region: "South" },
  { name: "Tampa, FL", region: "South" },
  { name: "Dallas, TX", region: "South" },
  { name: "Houston, TX", region: "South" },
  { name: "Charlotte, NC", region: "South" },
  { name: "Raleigh, NC", region: "South" },
  { name: "Memphis, TN", region: "South" },

  // Midwest
  { name: "Chicago, IL", region: "Midwest" },
  { name: "Minneapolis, MN", region: "Midwest" },
  { name: "Detroit, MI", region: "Midwest" },
  { name: "Columbus, OH", region: "Midwest" },
  { name: "Cleveland, OH", region: "Midwest" },
  { name: "Cincinnati, OH", region: "Midwest" },
  { name: "Kansas City, MO", region: "Midwest" },
  { name: "St. Louis, MO", region: "Midwest" },
  { name: "Milwaukee, WI", region: "Midwest" },

  // Northeast
  { name: "New York City, NY", region: "Northeast" },
  { name: "Philadelphia, PA", region: "Northeast" },
  { name: "Boston, MA", region: "Northeast" },
  { name: "Pittsburgh, PA", region: "Northeast" },
  { name: "Washington, DC", region: "Northeast" },
  { name: "Baltimore, MD", region: "Northeast" }
];

async function nationwideVenueHarvest() {
  console.log("\n=======================================================");
  console.log("🌎 NATIONWIDE MUSIC VENUE DATABASE HARVEST v2.0");
  console.log(`📡 TARGET: Prisma Postgres Cloud`);
  console.log(`📍 TOTAL DESTINATIONS: ${US_MUSIC_HUBS.length} US Music Hubs`);
  console.log("=======================================================\n");

  let totalScouted = 0;
  let totalSaved = 0;

  for (let i = 0; i < US_MUSIC_HUBS.length; i++) {
    const hub = US_MUSIC_HUBS[i];
    console.log(`\n-------------------------------------------------------`);
    console.log(`📍 [${i + 1}/${US_MUSIC_HUBS.length}] SCOUTING HUB: ${hub.name} (${hub.region})`);
    console.log(`-------------------------------------------------------`);

    try {
      // 1. Scout music venues in this city
      const scoutPrompt = `List 15 real, active music venues, bars, clubs, or concert halls that regularly pay local musicians or touring bands to perform in ${hub.name}. 
      Only return active, real performance spaces.
      Return a JSON object with a "venues" key containing an array of strings (names of the venues). 
      Example: {"venues": ["The Live Room", "Sparks Bar"]}`;

      console.log(`   Scouting active venues via Grok...`);
      const response = await callGrok(scoutPrompt);
      const venueNames: string[] = response.venues || [];

      if (!venueNames || venueNames.length === 0) {
        console.log(`   ⚠️ No venues returned for ${hub.name}. Response was:`, JSON.stringify(response));
        continue;
      }

      console.log(`   Found ${venueNames.length} active venues to details...`);
      totalScouted += venueNames.length;

      // 2. Crawl and ingest details for each venue
      for (const name of venueNames) {
        try {
          const query = `${name} in ${hub.name}`;
          console.log(`     [CRAWL] Ingesting details: "${query}"`);

          const venueData = await crawlVenueIntelligence(query);

          if (!venueData || !venueData.name) {
            console.log(`     ❌ Failed to retrieve structured booking info for: ${name}`);
            continue;
          }

          // 3. Save directly to Postgres
          const savedRecord = await prisma.venueProfile.upsert({
            where: { name: venueData.name },
            update: {
              ...venueData,
              lastCrawledAt: new Date()
            },
            create: {
              ...venueData,
              lastCrawledAt: new Date()
            }
          });

          console.log(`     ✅ Upserted: "${savedRecord.name}" | Genres: ${savedRecord.genres || "N/A"} | Pay: ${savedRecord.averagePay || "TBD"} (${savedRecord.payType || "Flat"})`);
          totalSaved++;

          // Throttle slightly between requests to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 500));

        } catch (crawlErr: any) {
          console.error(`     ❌ Error harvesting venue "${name}":`, crawlErr.message || crawlErr);
        }
      }

      console.log(`\n🎉 Completed Hub ${hub.name}. Cumulative Stats: Scouted: ${totalScouted} | Saved/Upserted: ${totalSaved}`);
      // Cooldown between major cities
      await new Promise((resolve) => setTimeout(resolve, 1500));

    } catch (scoutErr: any) {
      console.error(`   ❌ Failed to scout hub ${hub.name}:`, scoutErr.message || scoutErr);
    }
  }

  console.log("\n=======================================================");
  console.log("🏆 HARVEST OPERATIONS COMPLETED SUCCESSFULLY!");
  console.log(`📊 TOTAL ACTIVE VENUES PROCESSED: ${totalScouted}`);
  console.log(`💾 TOTAL VENUES INGESTED TO POSTGRES: ${totalSaved}`);
  console.log("=======================================================\n");

  process.exit(0);
}

nationwideVenueHarvest().catch((err) => {
  console.error("Fatal Harvester Error:", err);
  process.exit(1);
});
