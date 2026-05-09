import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistance } from "@/lib/geo";

export async function POST(req: Request) {
  try {
    const { userId, targetDates, maxRadius, minCompensation } = await req.json();

    // 1. Get Band Profile to find location
    const band = await prisma.bandProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!band || !band.latitude || !band.longitude) {
      return NextResponse.json({ error: "Band profile or location missing" }, { status: 400 });
    }

    // 2. Create the Campaign
    const campaign = await prisma.bookingCampaign.create({
      data: {
        userId,
        targetDates: JSON.stringify(targetDates),
        maxRadius,
        minCompensation,
      }
    });

    // 3. Search for Venues within Radius
    const venues = await prisma.venueProfile.findMany({
      where: {
        bookingEmail: { not: null },
      }
    });

    const targetVenues = venues.filter(v => {
      if (!v.latitude || !v.longitude) return false;
      const distance = calculateDistance(band.latitude!, band.longitude!, v.latitude, v.longitude);
      return distance <= maxRadius;
    });

    // 4. Create Booking Attempts (Staged)
    const attempts = await Promise.all(targetVenues.map(v => 
      prisma.bookingAttempt.create({
        data: {
          campaignId: campaign.id,
          venueId: v.id,
          status: "PENDING"
        }
      })
    ));

    return NextResponse.json({ 
      success: true, 
      campaignId: campaign.id, 
      venuesFound: targetVenues.length 
    });

  } catch (error) {
    console.error("Campaign Creation Failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
