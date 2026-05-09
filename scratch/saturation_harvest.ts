import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { crawlBandIntelligence, crawlVenueIntelligence, callGrok } from "../src/lib/xai";

// Force load the .env for cloud access
dotenv.config();

const prisma = new PrismaClient();

async function standaloneSaturate() {
  const hubSystem = [
    { hub: "Austin, TX", sprawl: ["San Marcos, TX", "Round Rock, TX", "Bastrop, TX", "New Braunfels, TX"] },
    { hub: "Nashville, TN", sprawl: ["Franklin, TN", "Murfreesboro, TN", "Hendersonville, TN", "Mount Juliet, TN"] },
    { hub: "Seattle, WA", sprawl: ["Tacoma, WA", "Bellevue, WA", "Everett, WA", "Olympia, WA"] },
    { hub: "Los Angeles, CA", sprawl: ["Pasadena, CA", "Long Beach, CA", "Anaheim, CA", "Santa Monica, CA"] },
    { hub: "Chicago, IL", sprawl: ["Evanston, IL", "Naperville, IL", "Gary, IN", "Joliet, IL"] },
    { hub: "New Orleans, LA", sprawl: ["Metairie, LA", "Kenner, LA", "Slidell, LA", "Baton Rouge, LA"] },
    { hub: "Atlanta, GA", sprawl: ["Decatur, GA", "Marietta, GA", "Athens, GA", "Savannah, GA"] },
    { hub: "Denver, CO", sprawl: ["Boulder, CO", "Fort Collins, CO", "Colorado Springs, CO", "Golden, CO"] },
    { hub: "Portland, OR", sprawl: ["Eugene, OR", "Salem, OR", "Vancouver, WA", "Bend, OR"] },
    { hub: "Brooklyn, NY", sprawl: ["Queens, NY", "Jersey City, NJ", "Hoboken, NJ", "Newark, NJ"] }
  ];

  const categories = ["STUDIO", "REHEARSAL", "VENUE", "BAND"];

  console.log(`🚀 CLOUD HARVESTER v2.2: THE NATIONAL SPRAWL INITIATED`);
  console.log(`📡 TARGET: Prisma Postgres Cloud // Sprawl Logic Active`);

  for (const system of hubSystem) {
    const targets = [system.hub, ...system.sprawl];
    
    for (const location of targets) {
      console.log(`\n📍 SCOUTING: ${location} ${location === system.hub ? '(MAIN HUB)' : '(SPRAWL)'}`);
      
      for (const type of categories) {
        try {
          console.log(`   Scouting ${type}s...`);
          const scoutPrompt = `List 6 active ${type === "STUDIO" ? "Recording Studios" : type === "REHEARSAL" ? "Rehearsal Spaces" : type}s in ${location}. Return as a JSON array of strings: ["Name 1", "Name 2", ...]`;
          const scoutedNames = await callGrok(scoutPrompt);

          if (!scoutedNames || !Array.isArray(scoutedNames)) continue;

          console.log(`   - Found ${scoutedNames.length} ${type}s. Injecting...`);

          for (const name of scoutedNames) {
            console.log(`     [${type}] -> ${name}`);
            const query = `${name} ${location}`;
            
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
              const prompt = `Extract professional info for the music resource: "${query}" (Type: ${type}). Return a JSON object with: name, type, address, latitude, longitude, phone, email, website, description, services, rates, brands.`;
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
          console.error(`   ❌ Failed to sync ${type} in ${location}:`, e.message);
        }
      }
    }
  }

  console.log("\n✅ NATIONAL SPRAWL COMPLETE.");
}

standaloneSaturate().catch(console.error);
