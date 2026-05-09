import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "current-user-id";

    // 1. Get Active Campaign
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

    // 2. Get Logs
    const logs = await prisma.pilotLog.findMany({
      where: { campaignId: campaign?.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json({ 
      success: true, 
      campaign,
      logs 
    });

  } catch (error) {
    console.error("Dashboard State Failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
