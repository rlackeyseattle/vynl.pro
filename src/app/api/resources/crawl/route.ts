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

    const resourceData = await callGrok(prompt);

    const resource = await prisma.musicResource.upsert({
      where: { name: resourceData.name },
      update: { ...resourceData, lastCrawledAt: new Date() },
      create: { ...resourceData, lastCrawledAt: new Date() },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Resource Crawl Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
