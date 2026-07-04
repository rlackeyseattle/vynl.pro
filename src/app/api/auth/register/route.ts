import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, role, name } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role === "VENUE" ? "VENUE" : "BAND";

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: normalizedRole,
          name: name || null,
        },
      });

      const defaultSlug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-");

      if (normalizedRole === "BAND") {
        await tx.bandProfile.create({
          data: {
            userId: newUser.id,
            slug: defaultSlug,
          },
        });
      } else {
        await tx.venueProfile.create({
          data: {
            userId: newUser.id,
            name: name || (email.split("@")[0].toUpperCase() + " VENUE"),
            slug: defaultSlug,
            bookingEmail: email,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json({ success: true, user: { id: result.id, email: result.email, role: result.role } });
  } catch (error: any) {
    console.error("Registration API Failure:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
