import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// List of target states/cities to fetch from.
// We select key music hubs and major cities to get high saturation of venues.
const TARGET_CITIES = [
  { city: "Seattle", state: "WA" },
  { city: "Portland", state: "OR" },
  { city: "Austin", state: "TX" },
  { city: "Nashville", state: "TN" },
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Denver", state: "CO" },
  { city: "New Orleans", state: "LA" },
  { city: "San Francisco", state: "CA" },
  { city: "Bozeman", state: "MT" },
  { city: "Missoula", state: "MT" },
  { city: "Kalispell", state: "MT" },
  { city: "Whitefish", state: "MT" },
  { city: "Miami", state: "FL" },
  { city: "Atlanta", state: "GA" },
  { city: "Boston", state: "MA" },
  { city: "Las Vegas", state: "NV" },
  { city: "Minneapolis", state: "MN" },
  { city: "Philadelphia", state: "PA" }
];

// Helper to sanitize website URL
function sanitizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  let clean = url.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean;
}

// Helper to generate a slug from venue name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function harvestOSM() {
  console.log("=======================================================");
  console.log("🛰️  FREE NATIVE HARVESTER: OPENSTREETMAP / OVERPASS API");
  console.log(`📡 TARGET: ${TARGET_CITIES.length} Music Hubs`);
  console.log("=======================================================\n");

  let totalScouted = 0;
  let totalSaved = 0;

  for (const loc of TARGET_CITIES) {
    console.log(`\n📍 SCOUTING REGION: ${loc.city}, ${loc.state}`);

    // Formulate Overpass QL Query for pubs, bars, nightclubs, and theatres
    // We restrict by city name and state area
    const query = `
      [out:json][timeout:60];
      area["name"="${loc.city}"]->.cityArea;
      (
        node["amenity"="pub"](area.cityArea);
        way["amenity"="pub"](area.cityArea);
        node["amenity"="bar"](area.cityArea);
        way["amenity"="bar"](area.cityArea);
        node["amenity"="nightclub"](area.cityArea);
        way["amenity"="nightclub"](area.cityArea);
        node["amenity"="theatre"](area.cityArea);
        way["amenity"="theatre"](area.cityArea);
      );
      out center;
    `;

    try {
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "VynlProVenueHarvester/1.0 (rob.lackey@example.com)" }
      });

      if (!response.ok) {
        throw new Error(`OSM Server returned code ${response.status}`);
      }

      const data = await response.json();
      const elements = data.elements || [];
      console.log(`   Fetched ${elements.length} raw map nodes. Parsing...`);

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name;

        // Skip nodes without a name
        if (!name || name.trim().length === 0) continue;

        // Determine coordinates
        const lat = el.lat || (el.center ? el.center.lat : null);
        const lon = el.lon || (el.center ? el.center.lon : null);

        if (!lat || !lon) continue;

        totalScouted++;

        // Rebuild clean address
        const houseNumber = tags["addr:housenumber"] || "";
        const street = tags["addr:street"] || "";
        const postcode = tags["addr:postcode"] || "";
        const city = tags["addr:city"] || loc.city;
        const state = tags["addr:state"] || loc.state;

        const address = street 
          ? `${houseNumber} ${street}, ${city}, ${state} ${postcode}`.trim()
          : `${city}, ${state}`;

        // Contact info
        const phone = tags.phone || tags["contact:phone"] || null;
        const websiteRaw = tags.website || tags["contact:website"] || tags.url || undefined;
        const website = sanitizeUrl(websiteRaw);

        // Generate booking email based on website domain if website exists
        let bookingEmail = null;
        if (website) {
          try {
            const domain = new URL(website).hostname.replace("www.", "");
            bookingEmail = `booking@${domain}`;
          } catch {
            // ignore
          }
        }

        // Map OSM amenity to local app details
        const amenity = tags.amenity || "bar";
        let venueType = "BAR";
        let averagePay = "$200 - $600 / night";
        let payType = "FLAT";
        let targetBandsDescription = "Open to local musicians, acoustic singer-songwriters, and garage cover bands.";
        let targetBookingNights = "Weekend acoustic sets and local pub gigs";
        let bookingDays = "Friday, Saturday";
        let capacity = 150;

        if (amenity === "nightclub") {
          venueType = "CLUB";
          averagePay = "$500 - $1500 / night";
          payType = "DOOR";
          targetBandsDescription = "Electronic acts, live synthesizers, indie pop crossover bands, and resident DJs.";
          targetBookingNights = "Late night DJ sessions, Friday/Saturday Electronic shows";
          bookingDays = "Thursday, Friday, Saturday";
          capacity = 450;
        } else if (amenity === "theatre") {
          venueType = "THEATRE";
          averagePay = "$1500 - $4000 / night";
          payType = "FLAT";
          targetBandsDescription = "Established national/regional touring acts, full ensembles, orchestras, and high-fidelity sound bands.";
          targetBookingNights = "Touring headliners, theatrical music performances";
          bookingDays = "Wednesday, Thursday, Friday, Saturday";
          capacity = 800;
        }

        const slug = generateSlug(name);

        try {
          await prisma.venueProfile.upsert({
            where: { name: name },
            update: {
              address,
              latitude: lat,
              longitude: lon,
              phone,
              website,
              bookingEmail: bookingEmail || venueType === "THEATRE" ? `booking@${slug}.com` : null,
              venueType,
              averagePay,
              payType,
              bookingDays,
              targetBandsDescription,
              targetBookingNights,
              ageRequirement: amenity === "pub" || amenity === "bar" || amenity === "nightclub" ? "21+" : "All Ages",
              capacity,
              claimed: false,
              lastCrawledAt: new Date()
            },
            create: {
              name,
              slug,
              address,
              latitude: lat,
              longitude: lon,
              phone,
              website,
              bookingEmail: bookingEmail || (venueType === "THEATRE" ? `booking@${slug}.com` : null),
              venueType,
              averagePay,
              payType,
              bookingDays,
              targetBandsDescription,
              targetBookingNights,
              ageRequirement: amenity === "pub" || amenity === "bar" || amenity === "nightclub" ? "21+" : "All Ages",
              capacity,
              claimed: false,
              lastCrawledAt: new Date()
            }
          });
          totalSaved++;
        } catch (dbErr: any) {
          // Name duplicates or unique constraint failures can happen, log silently
        }
      }

      console.log(`   Saved ${totalSaved} active venues total.`);
      // Add sleep delay to respect OSM rate limits
      await new Promise(r => setTimeout(r, 3000));

    } catch (e: any) {
      console.log(`   ❌ OSM Error for ${loc.city}: ${e.message || e}`);
    }
  }

  const currentCount = await prisma.venueProfile.count();
  console.log("\n=======================================================");
  console.log(`🎉 FREE OSM HARVEST CYCLE COMPLETE.`);
  console.log(`📊 TOTAL SCOUTED: ${totalScouted}`);
  console.log(`💾 TOTAL SAVED/UPSERTED: ${totalSaved}`);
  console.log(`📈 DATABASE PULSE: ${currentCount} total venues now live.`);
  console.log("=======================================================\n");
}

harvestOSM()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
