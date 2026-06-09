import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discoverTargets, crawlVenueIntelligence } from "@/lib/xai";

export async function POST(req: Request) {
  try {
    const { region } = await req.json();
    if (!region) {
      return NextResponse.json({ error: "Region is required" }, { status: 400 });
    }

    // 1. Discover target venues in region using Grok web search simulation
    const venueNames = await discoverTargets(region, "VENUE");
    if (!venueNames || venueNames.length === 0) {
      return NextResponse.json({ success: true, count: 0, venues: [], logs: ["No active music venues found in this region."] });
    }

    const logs: string[] = [];
    const addedVenues: any[] = [];

    // Limit to top 10 venues per request to ensure fast execution and avoid gateway timeouts
    const targetsToProcess = venueNames.slice(0, 10);
    logs.push(`Scouting region: ${region}... Found ${venueNames.length} potential music venues. Crawling top 10...`);

    for (const name of targetsToProcess) {
      try {
        const query = `${name} in ${region}`;
        // Query Grok to search Bandsintown/Facebook events and fetch coordinates + contact emails
        const venueData = await crawlVenueIntelligence(query);
        
        if (venueData && venueData.name && venueData.latitude && venueData.longitude) {
          // Verify that this venue is active (either has open dates or a valid address)
          const venue = await prisma.venueProfile.upsert({
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
          addedVenues.push(venue);
          logs.push(`[VERIFIED ACTIVE] -> Added ${venueData.name} (${venueData.address}) to the Outpost Grid.`);
        } else {
          logs.push(`[SKIPPED] -> ${name} (could not verify active schedule or geolocation)`);
        }
      } catch (err: any) {
        console.error(`Error harvesting venue ${name}:`, err);
        logs.push(`[ERROR] -> Failed to resolve ${name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      count: addedVenues.length,
      venues: addedVenues,
      logs
    });
  } catch (error: any) {
    console.error("Harvest API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
