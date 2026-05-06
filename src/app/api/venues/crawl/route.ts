import { NextResponse } from "next/server";
import { crawlVenueIntelligence } from "@/lib/xai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const venueData = await crawlVenueIntelligence(query);

    if (!venueData) {
      return NextResponse.json({ error: "Could not crawl venue data" }, { status: 500 });
    }

    // Save to database
    const venue = await prisma.venueProfile.upsert({
      where: { name: venueData.name }, // Use name as unique identifier for now, or use a combination
      update: {
        ...venueData,
        lastCrawledAt: new Date(),
      },
      create: {
        ...venueData,
        lastCrawledAt: new Date(),
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Venue Crawl API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
