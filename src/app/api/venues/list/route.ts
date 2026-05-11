import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const state = searchParams.get("state") || "";

  try {
    const venues = await prisma.venueProfile.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: "insensitive" } } : {},
          state ? { address: { contains: state, mode: "insensitive" } } : {},
        ],
      },
      take: 50,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(venues);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
