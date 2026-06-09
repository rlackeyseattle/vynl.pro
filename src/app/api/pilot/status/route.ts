import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatch } from "@/lib/matchmaker";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    // If no explicit userId, let's find the first user with a band role, or default
    if (!userId || userId === "current-user-id") {
      const firstBandUser = await prisma.user.findFirst({
        where: { role: "BAND" }
      });
      userId = firstBandUser?.id || "current-user-id";
    }

    // 1. Get Band Profile (to calculate match scores)
    const band = await prisma.bandProfile.findUnique({
      where: { userId }
    });

    // 2. Get Active Campaign
    const campaign = await prisma.bookingCampaign.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        attempts: {
          include: { venue: true },
          orderBy: { lastActivityAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. Compute dynamic matches if both exist
    let attemptsWithMatch = campaign?.attempts || [];
    if (campaign && band && band.latitude && band.longitude) {
      let targetDates: string[] = [];
      try {
        targetDates = JSON.parse(campaign.targetDates) || [];
      } catch (e) {
        targetDates = [campaign.targetDates];
      }

      attemptsWithMatch = campaign.attempts.map(attempt => {
        if (!attempt.venue.latitude || !attempt.venue.longitude) {
          return attempt;
        }

        const match = calculateMatch(
          { latitude: band.latitude!, longitude: band.longitude!, genre: band.genre },
          { 
            latitude: attempt.venue.latitude, 
            longitude: attempt.venue.longitude, 
            genres: attempt.venue.genres, 
            averagePay: attempt.venue.averagePay, 
            openDates: attempt.venue.openDates 
          },
          targetDates,
          campaign.maxRadius,
          campaign.minCompensation || 150
        );

        return {
          ...attempt,
          match
        };
      });
    }

    // 4. Get Logs
    const logs = await prisma.pilotLog.findMany({
      where: { campaignId: campaign?.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    // Reassemble campaign with matched attempts
    const campaignWithMatches = campaign ? {
      ...campaign,
      attempts: attemptsWithMatch
    } : null;

    return NextResponse.json({ 
      success: true, 
      campaign: campaignWithMatches,
      logs 
    });

  } catch (error: any) {
    console.error("Dashboard State Failure:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
