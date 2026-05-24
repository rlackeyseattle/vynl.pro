import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { crawlVenueIntelligence, callGrok } from "../src/lib/xai";

// Force load environmental variables for PostgreSQL cloud database access
dotenv.config();

const prisma = new PrismaClient();

// The remaining 18 hubs that were interrupted due to the network drop
const REMAINING_HUBS = [
  // South / Southeast (remaining)
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

// Robust Grok caller with built-in retries & exponential backoff
async function callGrokWithRetry(prompt: string, retries = 3, delay = 5000): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await callGrok(prompt);
    } catch (err: any) {
      console.warn(`   ⚠️ Grok Fetch Attempt ${attempt}/${retries} failed: ${err.message || err}`);
      if (attempt === retries) throw err;
      console.log(`   ⏳ Waiting ${delay / 1000}s before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
}

// Robust venue detail crawler with built-in retries
async function crawlVenueWithRetry(query: string, retries = 3, delay = 3000): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await crawlVenueIntelligence(query);
    } catch (err: any) {
      console.warn(`     ⚠️ Detail Crawl Attempt ${attempt}/${retries} failed for "${query}": ${err.message || err}`);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5;
    }
  }
}

async function nationwideVenueHarvestContinue() {
  console.log("\n=======================================================");
  console.log("🌎 NATIONWIDE VENUE HARVESTER v2.0 - RESUMPTION ENGINE");
  console.log(`📡 TARGET: Prisma Postgres Cloud`);
  console.log(`📍 RESUMING FOR: ${REMAINING_HUBS.length} Interrupted Music Hubs`);
  console.log("🛠️ ADVANCED RESILIENCE: 3x Retries + Exponential Backoff");
  console.log("=======================================================\n");

  let totalScouted = 0;
  let totalSaved = 0;

  for (let i = 0; i < REMAINING_HUBS.length; i++) {
    const hub = REMAINING_HUBS[i];
    console.log(`\n-------------------------------------------------------`);
    console.log(`📍 [${i + 1}/${REMAINING_HUBS.length}] SCOUTING HUB: ${hub.name} (${hub.region})`);
    console.log(`-------------------------------------------------------`);

    try {
      // 1. Scout music venues in this city with robust retries
      const scoutPrompt = `List 15 real, active music venues, bars, clubs, or concert halls that regularly pay local musicians or touring bands to perform in ${hub.name}. 
      Only return active, real performance spaces.
      Return a JSON object with a "venues" key containing an array of strings (names of the venues). 
      Example: {"venues": ["The Live Room", "Sparks Bar"]}`;

      console.log(`   Scouting active venues via Grok (with retry resilience)...`);
      const response = await callGrokWithRetry(scoutPrompt);
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

          const venueData = await crawlVenueWithRetry(query);

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
          await new Promise((resolve) => setTimeout(resolve, 800));

        } catch (crawlErr: any) {
          console.error(`     ❌ Error harvesting venue "${name}":`, crawlErr.message || crawlErr);
        }
      }

      console.log(`\n🎉 Completed Hub ${hub.name}. Cumulative Continuation Stats: Scouted: ${totalScouted} | Saved/Upserted: ${totalSaved}`);
      // Cooldown between major cities
      await new Promise((resolve) => setTimeout(resolve, 2000));

    } catch (scoutErr: any) {
      console.error(`   ❌ Failed to scout hub ${hub.name}:`, scoutErr.message || scoutErr);
    }
  }

  console.log("\n=======================================================");
  console.log("🏆 CONTINUATION HARVEST OPERATIONS COMPLETED!");
  console.log(`📊 NEW VENUES PROCESSED: ${totalScouted}`);
  console.log(`💾 NEW VENUES INGESTED TO POSTGRES: ${totalSaved}`);
  console.log("=======================================================\n");

  process.exit(0);
}

nationwideVenueHarvestContinue().catch((err) => {
  console.error("Fatal Resumption Harvester Error:", err);
  process.exit(1);
});
