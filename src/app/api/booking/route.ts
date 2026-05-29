import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { venueIds, dates, message, venueId } = body;

    // Support both bulk booking (venueIds array) and single profile booking (venueId)
    const targets = venueIds || (venueId ? [venueId] : []);

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: "No venues selected" }, { status: 400 });
    }

    // Since we don't have full auth wired up, we'll find or create a dummy user to own the campaign
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "artist@example.com",
          name: "Test Artist",
          role: "BAND",
        }
      });
    }

    // Create the BookingCampaign
    const campaign = await prisma.bookingCampaign.create({
      data: {
        userId: user.id,
        targetDates: dates || "TBD",
        maxRadius: 100,
        status: "ACTIVE",
      }
    });

    // Create BookingAttempt for each target venue
    for (const vId of targets) {
      await prisma.bookingAttempt.create({
        data: {
          campaignId: campaign.id,
          venueId: vId,
          status: "PENDING",
          negotiationLog: `Initial Pitch:\n${message || "No message provided."}`,
        }
      });
    }

    return NextResponse.json({ success: true, campaignId: campaign.id });

  } catch (error: any) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
