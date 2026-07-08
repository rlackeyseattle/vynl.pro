import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const state = searchParams.get("state") || "";
  const genre = searchParams.get("genre") || "";
  const coverOrOriginal = searchParams.get("coverOrOriginal") || "";

  try {
    const bands = await prisma.bandProfile.findMany({
      where: {
        AND: [
          {
            user: {
              NOT: {
                email: { endsWith: "@vynl.pro" }
              }
            }
          },
          search ? {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" } } },
              { location: { contains: search, mode: "insensitive" } },
              { bio: { contains: search, mode: "insensitive" } },
            ]
          } : {},
          state ? { location: { contains: `, ${state}` } } : {},
          genre ? { genre: { contains: genre, mode: "insensitive" } } : {},
          coverOrOriginal ? { coverOrOriginal: coverOrOriginal } : {},
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      take: 50,
    });
    return NextResponse.json(bands);
  } catch (error) {
    console.error("Fetch bands error:", error);
    return NextResponse.json({ error: "Failed to fetch bands" }, { status: 500 });
  }
}
