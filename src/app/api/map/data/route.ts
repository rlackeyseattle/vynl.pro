import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const venues = await prisma.venueProfile.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      }
    });

    const bands = await prisma.bandProfile.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      }
    });

    const resources = await prisma.musicResource.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    return NextResponse.json({ venues, bands, resources });
  } catch (error) {
    console.error("CRITICAL: Map Data API Failure:", error);
    return NextResponse.json({ 
      error: "Failed to fetch map data", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
