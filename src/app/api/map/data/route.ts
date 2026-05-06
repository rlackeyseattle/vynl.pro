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
    console.error("Failed to fetch map data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
