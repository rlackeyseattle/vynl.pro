import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistance } from "@/lib/geo";
import { calculateMatch } from "@/lib/matchmaker";

export async function POST(req: Request) {
  try {
    const { userId, targetDates, maxRadius, minCompensation } = await req.json();

    // 1. Get Band Profile to find location & genre
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
        maxRadius: Number(maxRadius) || 100,
        minCompensation: Number(minCompensation) || 150,
      }
    });

    // 3. Search for Venues with booking email
    const venues = await prisma.venueProfile.findMany({
      where: {
        bookingEmail: { not: null },
      }
    });

    // 4. Calculate matches and filter out completely unmatched (e.g. out of radius or match < 40%)
    const matchedVenues = venues
      .map(v => {
        if (!v.latitude || !v.longitude) return null;
        
        const match = calculateMatch(
          { latitude: band.latitude!, longitude: band.longitude!, genre: band.genre },
          { latitude: v.latitude, longitude: v.longitude, genres: v.genres, averagePay: v.averagePay, openDates: v.openDates },
          targetDates || [],
          maxRadius || 100,
          minCompensation || 150
        );

        return { venue: v, match };
      })
      .filter(item => item !== null && item.match.locationScore > 0 && item.match.overallScore >= 40) as { venue: any, match: any }[];

    // 5. Create Booking Attempts (Staged with dynamic matching logs)
    const attempts = await Promise.all(matchedVenues.map(item => 
      prisma.bookingAttempt.create({
        data: {
          campaignId: campaign.id,
          venueId: item.venue.id,
          status: "PENDING",
          negotiationLog: `[MATCH ANALYSIS]
Overall Match: ${item.match.overallScore}%
- Genre Match: ${item.match.genreScore}% (${item.match.details.genreMatch})
- Pay Match: ${item.match.payScore}% (${item.match.details.payMatch})
- Location Match: ${item.match.locationScore}% (${item.match.details.distance} miles away)
- Schedule Match: ${item.match.scheduleScore}% (${item.match.details.scheduleMatch})
          `
        }
      })
    ));

    // Create Pilot Logs for audit trail
    await prisma.pilotLog.create({
      data: {
        campaignId: campaign.id,
        message: `Pilot initiated campaign with parameters: Radius=${maxRadius}mi, Min Pay=$${minCompensation}. Found ${venues.length} venues, auto-matched ${attempts.length} matching criteria.`,
        level: "INFO"
      }
    });

    return NextResponse.json({ 
      success: true, 
      campaignId: campaign.id, 
      venuesFound: attempts.length 
    });

  } catch (error: any) {
    console.error("Campaign Creation Failure:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
