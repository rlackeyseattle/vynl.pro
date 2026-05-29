import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const state = searchParams.get("state") || "";
  const genre = searchParams.get("genre") || "";
  const type = searchParams.get("type") || "";

  try {
    const venues = await prisma.venueProfile.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: "insensitive" } } : {},
          state ? { address: { contains: `, ${state}` } } : {},
          genre ? { genres: { contains: genre, mode: "insensitive" } } : {},
          type ? { venueType: type } : {},
        ],
      },
      take: 50,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(venues);
  } catch (error) {
    console.error("Fetch venues error:", error);
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
