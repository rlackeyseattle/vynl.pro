import { NextResponse } from "next/server";
import { crawlBandIntelligence } from "@/lib/xai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`📡 [CRAWL] Starting Band Crawl for: ${query}`);
    const bandData = await crawlBandIntelligence(query);
    console.log(`📡 [CRAWL] Grok Result for ${query}:`, bandData?.name);

    if (!bandData || !bandData.name) {
      console.error(`❌ [CRAWL] Failed to extract band data for: ${query}`);
      return NextResponse.json({ error: "Could not crawl band data" }, { status: 500 });
    }

    const email = `${bandData.name.toLowerCase().replace(/ /g, '')}@vynl.pro`;
    
    console.log(`📡 [CRAWL] Syncing User: ${email}`);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: bandData.name },
      create: {
        email,
        name: bandData.name,
        role: "BAND",
      }
    });

    const { name, members, ...profileData } = bandData;
    const membersString = Array.isArray(members) ? members.join(", ") : members;

    console.log(`📡 [CRAWL] Syncing BandProfile for User: ${user.id}`);
    const band = await prisma.bandProfile.upsert({
      where: { userId: user.id },
      update: {
        ...profileData,
        members: membersString,
        lastCrawledAt: new Date(),
        lastGigDate: bandData.lastGigDate ? new Date(bandData.lastGigDate) : null,
      },
      create: {
        ...profileData,
        userId: user.id,
        members: membersString,
        lastCrawledAt: new Date(),
        lastGigDate: bandData.lastGigDate ? new Date(bandData.lastGigDate) : null,
      },
    });

    console.log(`✅ [CRAWL] Successfully synced Band: ${bandData.name}`);
    return NextResponse.json(band);
  } catch (error) {
    console.error("Band Crawl API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
