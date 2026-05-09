import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBookingEmail } from "@/lib/xai";
import { sendBookingEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();

    // 1. Get Pending Attempts
    const attempts = await prisma.bookingAttempt.findMany({
      where: { campaignId, status: "PENDING" },
      include: { 
        venue: true,
        campaign: { include: { user: { include: { bandProfile: true } } } }
      },
      take: 5 // Process in batches to avoid rate limits
    });

    const results = await Promise.all(attempts.map(async (attempt) => {
      const band = attempt.campaign.user.bandProfile;
      const venue = attempt.venue;
      const dates = JSON.parse(attempt.campaign.targetDates);

      // 2. Generate AI Email
      const { subject, body } = await generateBookingEmail(band, venue, dates[0]);

      // 3. Send Email
      const mailResult = await sendBookingEmail(venue.bookingEmail!, subject, body);

      if (mailResult.success) {
        await prisma.bookingAttempt.update({
          where: { id: attempt.id },
          data: { status: "SENT" }
        });
        return { venue: venue.name, status: "SENT" };
      }

      return { venue: venue.name, status: "FAILED" };
    }));

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error("Processing Failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
