import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGrok } from "@/lib/xai";

export async function POST(req: Request) {
  try {
    const { query, type } = await req.json();

    if (!query || !type) {
      return NextResponse.json({ error: "Query and Type are required" }, { status: 400 });
    }

    const prompt = `Extract professional info for the music resource: "${query}" (Type: ${type}). 
    Return a JSON object with: name, type, address, latitude, longitude, phone, email, website, description, services, rates, brands.
    Ensure latitude and longitude are accurate.`;

    console.log(`📡 [CRAWL] Starting Resource Crawl (${type}) for: ${query}`);
    const resourceData = await callGrok(prompt);
    console.log(`📡 [CRAWL] Grok Result for ${query}:`, resourceData?.name);

    if (!resourceData || !resourceData.name) {
      console.error(`❌ [CRAWL] Failed to extract resource data for: ${query}`);
      return NextResponse.json({ error: "Could not crawl resource data" }, { status: 500 });
    }

    console.log(`📡 [CRAWL] Syncing MusicResource: ${resourceData.name}`);
    const resource = await prisma.musicResource.upsert({
      where: { name: resourceData.name },
      update: { ...resourceData, lastCrawledAt: new Date() },
      create: { ...resourceData, lastCrawledAt: new Date() },
    });

    console.log(`✅ [CRAWL] Successfully synced Resource: ${resourceData.name}`);
    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Resource Crawl Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
