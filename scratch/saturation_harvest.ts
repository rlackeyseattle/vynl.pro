import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { crawlBandIntelligence, crawlVenueIntelligence, callGrok } from "../src/lib/xai";

// Force load the .env for cloud access
dotenv.config();

const prisma = new PrismaClient();

async function standaloneSaturate() {
  const regions = [
    "Austin, TX", "Nashville, TN", "Seattle, WA", "New Orleans, LA", 
    "Portland, OR", "Denver, CO", "Atlanta, GA", "Chicago, IL",
    "San Francisco, CA", "Las Vegas, NV", "Miami, FL", "Brooklyn, NY",
    "Los Angeles, CA", "Memphis, TN", "Philadelphia, PA", "Boston, MA",
    "Minneapolis, MN", "Detroit, MI", "Kansas City, MO", "Athens, GA"
  ];

  // Prioritizing Studios and Rehearsals for this sweep
  const categories = ["STUDIO", "REHEARSAL", "VENUE", "SHOP", "BAND"];

  console.log(`🚀 HUB SWEEP INITIATED: FOCUSING ON STUDIOS & REHEARSAL`);
  console.log(`📡 TARGET: Prisma Postgres Cloud // 20 HUBs`);

  for (const region of regions) {
    console.log(`\n📍 SCOUTING HUB: ${region}`);
    
    for (const type of categories) {
      try {
        console.log(`   Scouting ${type}s...`);
        const scoutPrompt = `List 8 famous or active ${type === "STUDIO" ? "Recording Studios" : type === "REHEARSAL" ? "Rehearsal Spaces" : type}s in ${region}. Return as a JSON array of strings: ["Name 1", "Name 2", ...]`;
        const targets = await callGrok(scoutPrompt);

        if (!targets || !Array.isArray(targets)) continue;

        console.log(`   - Found ${targets.length} ${type}s. Injecting...`);

        for (const name of targets) {
          console.log(`     [${type}] -> ${name}`);
          const query = `${name} ${region}`;
          
          if (type === "VENUE") {
            const data = await crawlVenueIntelligence(query);
            if (data) {
              await prisma.venueProfile.upsert({
                where: { name: data.name },
                update: { ...data, lastCrawledAt: new Date() },
                create: { ...data, lastCrawledAt: new Date() }
              });
            }
          } else if (type === "BAND") {
            const data = await crawlBandIntelligence(query);
            if (data && data.name) {
              const email = `${data.name.toLowerCase().replace(/ /g, '')}@vynl.pro`;
              const user = await prisma.user.upsert({
                where: { email },
                update: { name: data.name },
                create: { email, name: data.name, role: "BAND" }
              });
              const { name: bName, members, ...profileData } = data;
              const membersString = Array.isArray(members) ? members.join(", ") : members;
              await prisma.bandProfile.upsert({
                where: { userId: user.id },
                update: { ...profileData, members: membersString, lastCrawledAt: new Date(), lastGigDate: data.lastGigDate ? new Date(data.lastGigDate) : null },
                create: { ...profileData, userId: user.id, members: membersString, lastCrawledAt: new Date(), lastGigDate: data.lastGigDate ? new Date(data.lastGigDate) : null }
              });
            }
          } else {
            // Logic for STUDIO, REHEARSAL, SHOP
            const prompt = `Extract professional info for the music resource: "${query}" (Type: ${type}). Return a JSON object with: name, type, address, latitude, longitude, phone, email, website, description, services, rates, brands. Ensure latitude and longitude are accurate.`;
            const data = await callGrok(prompt);
            if (data && data.name) {
              await prisma.musicResource.upsert({
                where: { name: data.name },
                update: { 
                  address: data.address,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  phone: data.phone,
                  email: data.email,
                  website: data.website,
                  description: data.description,
                  services: Array.isArray(data.services) ? data.services.join(", ") : data.services,
                  rates: data.rates,
                  brands: Array.isArray(data.brands) ? data.brands.join(", ") : data.brands,
                  type, 
                  lastCrawledAt: new Date() 
                },
                create: { 
                  name: data.name,
                  address: data.address,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  phone: data.phone,
                  email: data.email,
                  website: data.website,
                  description: data.description,
                  services: Array.isArray(data.services) ? data.services.join(", ") : data.services,
                  rates: data.rates,
                  brands: Array.isArray(data.brands) ? data.brands.join(", ") : data.brands,
                  type, 
                  lastCrawledAt: new Date() 
                }
              });
            }
          }
        }
      } catch (e) {
        console.error(`   ❌ Failed to sync ${type} in ${region}:`, e.message);
      }
    }
  }

  console.log("\n✅ HUB SWEEP COMPLETE.");
}

standaloneSaturate().catch(console.error);
