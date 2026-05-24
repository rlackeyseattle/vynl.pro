import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { crawlBandIntelligence, crawlVenueIntelligence, callGrok } from "../src/lib/xai";

// Force load the .env for cloud access
dotenv.config();

const prisma = new PrismaClient();

async function megaSaturate() {
  const hubs = [
    // Northeast
    { hub: "New York, NY", sprawl: ["Brooklyn, NY", "Queens, NY", "Manhattan, NY", "Bronx, NY", "Staten Island, NY", "Jersey City, NJ", "Hoboken, NJ", "Newark, NJ", "Yonkers, NY", "White Plains, NY"] },
    { hub: "Philadelphia, PA", sprawl: ["Camden, NJ", "Wilmington, DE", "Allentown, PA", "Reading, PA", "Trenton, NJ"] },
    { hub: "Boston, MA", sprawl: ["Cambridge, MA", "Somerville, MA", "Worcester, MA", "Providence, RI", "Salem, MA", "Quincy, MA"] },
    { hub: "Pittsburgh, PA", sprawl: ["Morgantown, WV", "Wheeling, WV", "Erie, PA", "Youngstown, OH"] },
    
    // Southeast
    { hub: "Nashville, TN", sprawl: ["Franklin, TN", "Murfreesboro, TN", "Hendersonville, TN", "Mount Juliet, TN", "Knoxville, TN", "Chattanooga, TN", "Memphis, TN"] },
    { hub: "Atlanta, GA", sprawl: ["Decatur, GA", "Marietta, GA", "Athens, GA", "Savannah, GA", "Alpharetta, GA", "Augusta, GA"] },
    { hub: "New Orleans, LA", sprawl: ["Metairie, LA", "Kenner, LA", "Slidell, LA", "Baton Rouge, LA", "Lafayette, LA", "Shreveport, LA"] },
    { hub: "Miami, FL", sprawl: ["Fort Lauderdale, FL", "West Palm Beach, FL", "Coral Gables, FL", "Miami Beach, FL", "Orlando, FL", "Tampa, FL", "Jacksonville, FL"] },
    { hub: "Charlotte, NC", sprawl: ["Raleigh, NC", "Durham, NC", "Asheville, NC", "Wilmington, NC", "Greensboro, NC"] },
    
    // Midwest
    { hub: "Chicago, IL", sprawl: ["Evanston, IL", "Naperville, IL", "Gary, IN", "Joliet, IL", "Rockford, IL", "Aurora, IL", "Milwaukee, WI", "Madison, WI"] },
    { hub: "Detroit, MI", sprawl: ["Ann Arbor, MI", "Grand Rapids, MI", "Lansing, MI", "Flint, MI", "Windsor, ON"] },
    { hub: "Minneapolis, MN", sprawl: ["St. Paul, MN", "Rochester, MN", "Duluth, MN", "Bloomington, MN"] },
    { hub: "St. Louis, MO", sprawl: ["Kansas City, MO", "Springfield, MO", "Columbia, MO", "Overland Park, KS"] },
    { hub: "Columbus, OH", sprawl: ["Cleveland, OH", "Cincinnati, OH", "Akron, OH", "Dayton, OH", "Toledo, OH"] },
    
    // Southwest
    { hub: "Austin, TX", sprawl: ["San Marcos, TX", "Round Rock, TX", "Bastrop, TX", "New Braunfels, TX", "San Antonio, TX", "Houston, TX", "Dallas, TX", "Fort Worth, TX", "El Paso, TX"] },
    { hub: "Phoenix, AZ", sprawl: ["Scottsdale, AZ", "Tempe, AZ", "Mesa, AZ", "Tucson, AZ", "Flagstaff, AZ"] },
    { hub: "Las Vegas, NV", sprawl: ["Henderson, NV", "Reno, NV", "North Las Vegas, NV"] },
    
    // West
    { hub: "Los Angeles, CA", sprawl: ["Pasadena, CA", "Long Beach, CA", "Anaheim, CA", "Santa Monica, CA", "Irvine, CA", "Riverside, CA", "San Diego, CA", "Santa Barbara, CA"] },
    { hub: "Seattle, WA", sprawl: ["Tacoma, WA", "Bellevue, WA", "Everett, WA", "Olympia, WA", "Spokane, WA", "Bellingham, WA", "Vancouver, WA"] },
    { hub: "Portland, OR", sprawl: ["Eugene, OR", "Salem, OR", "Bend, OR", "Medford, OR", "Beaverton, OR"] },
    { hub: "Denver, CO", sprawl: ["Boulder, CO", "Fort Collins, CO", "Colorado Springs, CO", "Golden, CO", "Aurora, CO", "Aspen, CO"] },
    { hub: "San Francisco, CA", sprawl: ["Oakland, CA", "San Jose, CA", "Berkeley, CA", "Sacramento, CA", "Santa Cruz, CA", "Palo Alto, CA"] },
    { hub: "Salt Lake City, UT", sprawl: ["Provo, UT", "Ogden, UT", "Park City, UT"] }
  ];

  const categories = ["VENUE", "BAND", "STUDIO", "REHEARSAL", "SHOP"];

  console.log(`🚀 MEGA HARVESTER v3.0: THE 10K INITIATIVE`);
  console.log(`📡 TARGET: Prisma Postgres Cloud // Massive Sprawl Active`);

  for (const hubData of hubs) {
    const targets = [hubData.hub, ...hubData.sprawl];
    
    for (const location of targets) {
      console.log(`\n📍 SCOUTING: ${location}`);
      
      for (const type of categories) {
        try {
          console.log(`   Scouting ${type}s...`);
          // Increase count to 20 for hubs, 10 for sprawl
          const count = targets.indexOf(location) === 0 ? 25 : 12;
          const scoutPrompt = `List ${count} real, active ${type === "STUDIO" ? "Recording Studios" : type === "REHEARSAL" ? "Rehearsal Spaces" : type}s in ${location}. Return as a JSON object with a "names" key containing an array of strings. Example: {"names": ["Name 1", "Name 2"]}`;
          
          const response = await callGrok(scoutPrompt);
          let scoutedNames = [];
          
          if (Array.isArray(response)) {
            scoutedNames = response;
          } else if (response && typeof response === 'object') {
            // Try common keys
            scoutedNames = response.names || response.targets || response.venues || response.bands || response.studios || Object.values(response).find(val => Array.isArray(val)) || [];
          }

          if (!scoutedNames || !Array.isArray(scoutedNames) || scoutedNames.length === 0) {
            console.log(`   - No names found for ${type} in ${location}. Response:`, JSON.stringify(response));
            continue;
          }

          console.log(`   - Found ${scoutedNames.length} ${type}s. Injecting...`);

          for (const name of scoutedNames) {
            console.log(`     [${type}] -> ${name}`);
            const query = `${name} ${location}`;
            
            if (type === "VENUE") {
              const data = await crawlVenueIntelligence(query);
              if (data && data.name) {
                await prisma.venueProfile.upsert({
                  where: { name: data.name },
                  update: { ...data, lastCrawledAt: new Date() },
                  create: { ...data, lastCrawledAt: new Date() }
                });
              }
            } else if (type === "BAND") {
              const data = await crawlBandIntelligence(query);
              if (data && data.name) {
                const email = `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vynl.pro`;
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
          console.error(`   ❌ Error in ${location} for ${type}:`, e.message);
        }
      }
    }
  }

  console.log("\n✅ MEGA HARVEST COMPLETE.");
}

megaSaturate().catch(console.error);
