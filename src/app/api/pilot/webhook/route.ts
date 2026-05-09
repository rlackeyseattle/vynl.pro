import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getReceivedEmail } from "@/lib/mailer";
import { parseBookingResponse } from "@/lib/xai";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Resend sends 'email.received' event
    if (payload.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const emailId = payload.data.id;
    const emailData = await getReceivedEmail(emailId);

    if (!emailData) {
      return NextResponse.json({ error: "Could not fetch email data" }, { status: 404 });
    }

    const fromAddress = emailData.from;
    const subject = emailData.subject;
    const body = emailData.text || emailData.html;

    // 1. Find the BookingAttempt
    // We try to match by fromAddress (the venue) and campaign activity
    const attempt = await prisma.bookingAttempt.findFirst({
      where: {
        venue: { bookingEmail: fromAddress },
        status: { in: ["SENT", "REPLIED", "QUESTION"] }
      },
      orderBy: { lastActivityAt: "desc" },
      include: { campaign: true }
    });

    if (!attempt) {
      console.log(`[PILOT] No active attempt found for ${fromAddress}`);
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    // 2. AI Parse the response
    const analysis = await parseBookingResponse(body);

    // 3. Update Database
    await prisma.bookingAttempt.update({
      where: { id: attempt.id },
      data: {
        status: analysis.intent === "POSITIVE" ? "CONFIRMED" : 
                analysis.intent === "NEGATIVE" ? "DECLINED" : "REPLIED",
        negotiationLog: (attempt.negotiationLog || "") + `\n\n[INBOUND] ${new Date().toISOString()}\n${analysis.summary}`,
        lastActivityAt: new Date()
      }
    });

    // 4. Log it for the Dashboard
    await prisma.pilotLog.create({
      data: {
        campaignId: attempt.campaignId,
        message: `AI Analyzed reply from ${fromAddress}: ${analysis.summary}`,
        level: analysis.intent === "POSITIVE" ? "AI" : "INFO"
      }
    });

    // 5. TODO: Implement Auto-Reply logic here if the user wants full autonomy

    return NextResponse.json({ ok: true, analysis });

  } catch (error) {
    console.error("Webhook Processing Failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
