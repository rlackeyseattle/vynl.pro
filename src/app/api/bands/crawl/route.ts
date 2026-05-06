import { NextResponse } from "next/server";
import { crawlBandIntelligence } from "@/lib/xai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const bandData = await crawlBandIntelligence(query);

    if (!bandData) {
      return NextResponse.json({ error: "Could not crawl band data" }, { status: 500 });
    }

    // Bands need a User record first in this schema
    const email = `${bandData.name.toLowerCase().replace(/ /g, '')}@vynl.pro`;
    
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: bandData.name },
      create: {
        email,
        name: bandData.name,
        role: "BAND",
      }
    });

    const { name, ...profileData } = bandData;

    const band = await prisma.bandProfile.upsert({
      where: { userId: user.id },
      update: {
        ...profileData,
        lastCrawledAt: new Date(),
        lastGigDate: bandData.lastGigDate ? new Date(bandData.lastGigDate) : null,
      },
      create: {
        ...profileData,
        userId: user.id,
        lastCrawledAt: new Date(),
        lastGigDate: bandData.lastGigDate ? new Date(bandData.lastGigDate) : null,
      },
    });

    return NextResponse.json(band);
  } catch (error) {
    console.error("Band Crawl API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
