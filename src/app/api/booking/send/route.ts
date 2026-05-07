import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ 
        error: "SMTP Credentials missing in .env", 
        message: "Please add SMTP_USER and SMTP_PASS to your local .env to send real emails."
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your preferred service
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Vynl Pro Circuit" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Booking Email Sent:", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
