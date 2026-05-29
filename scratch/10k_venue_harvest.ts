import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { crawlVenueIntelligence, callGrok } from "../src/lib/xai";

dotenv.config();
const prisma = new PrismaClient();

const TOP_US_CITIES = [
  "New York City, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Indianapolis, IN", "Charlotte, NC", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Washington, DC", "Nashville, TN", "Oklahoma City, OK", "El Paso, TX", "Boston, MA", "Portland, OR", "Las Vegas, NV", "Detroit, MI", "Memphis, TN", "Louisville, KY", "Baltimore, MD", "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA", "Mesa, AZ", "Kansas City, MO", "Atlanta, GA", "Long Beach, CA", "Omaha, NE", "Raleigh, NC", "Colorado Springs, CO", "Miami, FL", "Virginia Beach, VA", "Oakland, CA", "Minneapolis, MN", "Tulsa, OK", "Arlington, TX", "New Orleans, LA", "Wichita, KS", "Cleveland, OH", "Tampa, FL", "Bakersfield, CA", "Aurora, CO", "Honolulu, HI", "Anaheim, CA", "Santa Ana, CA", "Corpus Christi, TX", "Riverside, CA", "Lexington, KY", "St. Louis, MO", "Stockton, CA", "Pittsburgh, PA", "Saint Paul, MN", "Cincinnati, OH", "Anchorage, AK", "Henderson, NV", "Greensboro, NC", "Plano, TX", "Newark, NJ", "Toledo, OH", "Lincoln, NE", "Orlando, FL", "Chula Vista, CA", "Jersey City, NJ", "Chandler, AZ", "Fort Wayne, IN", "Buffalo, NY", "Durham, NC", "St. Petersburg, FL", "Irvine, CA", "Laredo, TX", "Lubbock, TX", "Madison, WI", "Gilbert, AZ", "Norfolk, VA", "Reno, NV", "Winston-Salem, NC", "Glendale, AZ", "Hialeah, FL", "Garland, TX", "Scottsdale, AZ", "Irving, TX", "Chesapeake, VA", "North Las Vegas, NV", "Fremont, CA", "Baton Rouge, LA", "Richmond, VA", "Boise, ID", "San Bernardino, CA",
  "Spokane, WA", "Des Moines, IA", "Modesto, CA", "Birmingham, AL", "Tacoma, WA", "Fontana, CA", "Rochester, NY", "Oxnard, CA", "Moreno Valley, CA", "Fayetteville, NC", "Huntington Beach, CA", "Yonkers, NY", "Glendale, CA", "Aurora, IL", "Montgomery, AL", "Columbus, GA", "Amarillo, TX", "Little Rock, AR", "Akron, OH", "Shreveport, LA", "Augusta, GA", "Grand Rapids, MI", "Mobile, AL", "Salt Lake City, UT", "Huntsville, AL", "Tallahassee, FL", "Grand Prairie, TX", "Overland Park, KS", "Knoxville, TN", "Worcester, MA", "Brownsville, TX", "Newport News, VA", "Santa Clarita, CA", "Providence, RI", "Fort Lauderdale, FL", "Chattanooga, TN", "Tempe, AZ", "Oceanside, CA", "Garden Grove, CA", "Rancho Cucamonga, CA", "Cape Coral, FL", "Santa Rosa, CA", "Vancouver, WA", "Sioux Falls, SD", "Peoria, AZ", "Ontario, CA", "Jackson, MS", "Elk Grove, CA", "Springfield, MO", "Pembroke Pines, FL", "Salem, OR", "Corona, CA", "Eugene, OR", "McKinney, TX", "Fort Collins, CO", "Lancaster, CA", "Cary, NC", "Palmdale, CA", "Hayward, CA", "Salinas, CA", "Frisco, TX", "Springfield, MA", "Pasadena, TX", "Macon, GA", "Alexandria, VA", "Pomona, CA", "Lakewood, CO", "Sunnyvale, CA", "Escondido, CA", "Kansas City, KS", "Hollywood, FL", "Clarksville, TN", "Torrance, CA", "Rockford, IL", "Joliet, IL", "Paterson, NJ", "Bridgeport, CT", "Naperville, IL", "Savannah, GA", "Mesquite, TX", "Syracuse, NY", "Pasadena, CA", "Orange, CA", "Fullerton, CA", "Killeen, TX", "Dayton, OH", "McAllen, TX", "Bellevue, WA", "Miramar, FL", "Hampton, VA", "West Valley City, UT", "Warren, MI", "Olathe, KS", "Columbia, SC", "Thornton, CO", "Waco, TX", "Sterling Heights, MI", "New Haven, CT", "Charleston, SC", "Visalia, CA", "Roseville, CA", "Gainesville, FL", "Cedar Rapids, IA", "Denton, TX", "Victorville, CA", "Elizabeth, NJ", "Carrollton, TX", "Midland, TX", "Stamford, CT", "Surprise, AZ", "Lafayette, LA",
  "Athens, GA", "Asheville, NC", "Burlington, VT", "Ithaca, NY", "Bozeman, MT", "Missoula, MT", "Lawrence, KS", "Bloomington, IN", "Olympia, WA", "Bellingham, WA", "Santa Cruz, CA", "Santa Barbara, CA"
];

function shuffleArray(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Exponential backoff for Grok requests
async function callGrokWithRetry(prompt: string, retries = 5, delay = 5000): Promise<any> {
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

async function start10kHarvest() {
  console.log("=======================================================");
  console.log("🔥 OPERATION 10K: NATIONWIDE VENUE HARVESTER (RESILIENT)");
  console.log(`📡 TARGET: ${TOP_US_CITIES.length} Cities`);
  console.log("=======================================================\n");

  shuffleArray(TOP_US_CITIES);

  let totalScouted = 0;
  let totalSaved = 0;

  for (const city of TOP_US_CITIES) {
    console.log(`\n📍 SCOUTING CITY: ${city}`);
    
    const scoutPrompt = `List up to 40 real, active music venues, bars, clubs, concert halls, or dives that regularly pay local musicians or touring bands to perform in ${city}.
    IMPORTANT: Only return real, existing performance spaces. NO FAKES.
    Return a JSON object with a "venues" key containing an array of strings (names of the venues). 
    Example: {"venues": ["The Live Room", "Sparks Bar"]}`;

    let venueNames: string[] = [];
    try {
      const response = await callGrokWithRetry(scoutPrompt);
      if (response && response.venues && Array.isArray(response.venues)) {
        venueNames = response.venues;
      } else if (Array.isArray(response)) {
        venueNames = response;
      }
    } catch (e: any) {
      console.log(`   🚨 FATAL: Failed to scout venues for ${city} after retries: ${e.message}`);
      continue;
    }

    if (venueNames.length === 0) {
      console.log(`   - No venues returned for ${city}.`);
      continue;
    }

    console.log(`   ✅ Found ${venueNames.length} active venues. Ingesting details...`);
    totalScouted += venueNames.length;

    for (const name of venueNames) {
      try {
        const query = `${name} in ${city}`;
        const data = await crawlVenueWithRetry(query);
        
        if (data && data.name) {
          await prisma.venueProfile.upsert({
            where: { name: data.name },
            update: { 
              ...data,
              lastCrawledAt: new Date()
            },
            create: { 
              ...data,
              lastCrawledAt: new Date()
            }
          });
          console.log(`     💾 SAVED: ${data.name} | ${data.venueType} | Pay: ${data.averagePay}`);
          totalSaved++;
        }
        await new Promise(r => setTimeout(r, 1000)); // Rate limit protection
      } catch (e: any) {
        console.log(`     ❌ Error for ${name}: ${e.message}`);
      }
    }

    const currentCount = await prisma.venueProfile.count();
    console.log(`\n📈 PROGRESS: ${currentCount} Total Venues in Database`);
  }

  console.log("\n=======================================================");
  console.log(`🎉 10K HARVEST CYCLE COMPLETE.`);
  console.log(`📊 SCOUTED: ${totalScouted}`);
  console.log(`💾 SAVED/UPSERTED: ${totalSaved}`);
  console.log("=======================================================\n");
}

start10kHarvest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
