"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateDistance } from "@/lib/geo";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SwipeDirection = "RIGHT" | "LEFT";

export interface SwipeResult {
  success: boolean;
  matched: boolean;
  matchId?: string;
  draftContract?: string;
  error?: string;
}

export interface DraftContract {
  matchId: string;
  date: string;
  bandName: string;
  venueName: string;
  venueAddress: string;
  agreedPay: number | null;
  setLength: number | null;
  startTime: string | null;
  endTime: string | null;
  bandEmail: string;
  venueEmail: string | null;
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// handleSwipe
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records a swipe and checks for a mutual match.
 *
 * @param slotId   - The Slot being swiped on
 * @param bandId   - The BandProfile involved
 * @param direction - "RIGHT" to like/request, "LEFT" to pass
 */
export async function handleSwipe(
  slotId: string,
  bandId: string,
  direction: SwipeDirection
): Promise<SwipeResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, matched: false, error: "Not authenticated" };
  }

  const role = (session.user as any).role as string;
  const initiator = role === "VENUE" ? "VENUE" : "BAND";

  try {
    // Fetch the slot to get venueId
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      select: { id: true, venueId: true, budget: true, setLength: true, startTime: true, endTime: true, date: true },
    });
    if (!slot) {
      return { success: false, matched: false, error: "Slot not found" };
    }

    // Record the swipe (upsert to handle accidental duplicates gracefully)
    await prisma.swipe.upsert({
      where: {
        initiator_bandId_slotId: {
          initiator,
          bandId,
          slotId,
        },
      },
      update: { direction },
      create: {
        initiator,
        direction,
        bandId,
        venueId: slot.venueId,
        slotId,
      },
    });

    // ── Left swipe → done, no match possible ────────────────────────────────
    if (direction === "LEFT") {
      return { success: true, matched: false };
    }

    // ── Right swipe → check for mutual match ────────────────────────────────
    const counterpartyInitiator = initiator === "BAND" ? "VENUE" : "BAND";
    const counterpartySwipe = await prisma.swipe.findUnique({
      where: {
        initiator_bandId_slotId: {
          initiator: counterpartyInitiator,
          bandId,
          slotId,
        },
      },
    });

    // No mutual swipe yet — just a one-sided like
    if (!counterpartySwipe || counterpartySwipe.direction !== "RIGHT") {
      return { success: true, matched: false };
    }

    // ── Mutual match! Run as a transaction ──────────────────────────────────
    const matchResult = await prisma.$transaction(async (tx) => {
      // Prevent duplicate matches
      const existingMatch = await tx.match.findUnique({
        where: { slotId },
      });
      if (existingMatch) return existingMatch;

      // Gather data for draft contract
      const [band, venue] = await Promise.all([
        tx.bandProfile.findUnique({
          where: { id: bandId },
          select: { id: true, minimumGuarantee: true, user: { select: { name: true, email: true } } },
        }),
        tx.venueProfile.findUnique({
          where: { id: slot.venueId },
          select: { id: true, name: true, address: true, bookingEmail: true },
        }),
      ]);

      // Negotiate pay: higher of venue budget vs band minimum
      const agreedPay =
        slot.budget !== null && band?.minimumGuarantee !== null
          ? Math.max(slot.budget ?? 0, band?.minimumGuarantee ?? 0)
          : slot.budget ?? band?.minimumGuarantee ?? null;

      const contract: DraftContract = {
        matchId: "", // placeholder, filled after creation
        date: slot.date.toISOString(),
        bandName: band?.user?.name ?? "Unknown Band",
        venueName: venue?.name ?? "Unknown Venue",
        venueAddress: venue?.address ?? "",
        agreedPay,
        setLength: slot.setLength ?? null,
        startTime: slot.startTime ?? null,
        endTime: slot.endTime ?? null,
        bandEmail: band?.user?.email ?? "",
        venueEmail: venue?.bookingEmail ?? null,
        generatedAt: new Date().toISOString(),
      };

      const newMatch = await tx.match.create({
        data: {
          bandId,
          venueId: slot.venueId,
          slotId,
          status: "PROVISIONAL",
          draftContract: JSON.stringify({ ...contract, matchId: "pending" }),
        },
      });

      // Update contract with real match ID
      const finalContract = { ...contract, matchId: newMatch.id };
      const updatedMatch = await tx.match.update({
        where: { id: newMatch.id },
        data: { draftContract: JSON.stringify(finalContract) },
      });

      // Update slot status to PROVISIONAL
      await tx.slot.update({
        where: { id: slotId },
        data: { status: "PROVISIONAL" },
      });

      return updatedMatch;
    });

    revalidatePath("/discover");
    return {
      success: true,
      matched: true,
      matchId: matchResult.id,
      draftContract: matchResult.draftContract ?? undefined,
    };
  } catch (err: any) {
    console.error("[handleSwipe] Error:", err);
    return { success: false, matched: false, error: err.message ?? "Unknown error" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getDiscoveryFeed
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a paginated, pre-filtered card deck for the discovery UI.
 * - Bands see: open Slot cards from nearby venues
 * - Venues see: BandProfile cards that match their criteria
 */
export async function getDiscoveryFeed(
  radiusMiles: number = 100,
  cursor?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { cards: [], nextCursor: null };

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  const PAGE_SIZE = 15;

  if (role === "BAND") {
    return getBandFeed(userId, radiusMiles, PAGE_SIZE, cursor);
  } else {
    return getVenueFeed(userId, radiusMiles, PAGE_SIZE, cursor);
  }
}

// Band sees open Slot cards
async function getBandFeed(
  userId: string,
  radiusMiles: number,
  limit: number,
  cursor?: string
) {
  const band = await prisma.bandProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      minimumGuarantee: true,
      expectedDraw: true,
      primaryGenre: true,
      secondaryGenre: true,
    },
  });

  if (!band?.latitude || !band?.longitude) {
    return { cards: [], nextCursor: null, error: "Update your profile with a location first." };
  }

  // Get IDs of slots already swiped on
  const swipedSlotIds = await prisma.swipe
    .findMany({
      where: { bandId: band.id, initiator: "BAND" },
      select: { slotId: true },
    })
    .then((rows) => rows.map((r) => r.slotId));

  const slots = await prisma.slot.findMany({
    where: {
      status: "OPEN",
      AND: [
        cursor ? { id: { gt: cursor } } : {},
        { id: { notIn: swipedSlotIds.length ? swipedSlotIds : ["__none__"] } }
      ],
      ...(band.minimumGuarantee
        ? { budget: { gte: band.minimumGuarantee } }
        : {}),
    },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          interiorImage: true,
          bookingEmail: true,
          venueType: true,
          capacity: true,
          genres: true,
        },
      },
    },
    take: limit * 3, // over-fetch so we can post-filter by distance
    orderBy: { date: "asc" },
  });

  // Post-filter by Haversine distance
  const filtered = slots
    .filter((slot) => {
      if (!slot.venue.latitude || !slot.venue.longitude) return false;
      const dist = calculateDistance(
        band.latitude!,
        band.longitude!,
        slot.venue.latitude,
        slot.venue.longitude
      );
      return dist <= radiusMiles;
    })
    .slice(0, limit);

  const nextCursor = filtered.length === limit ? filtered[filtered.length - 1].id : null;
  return { cards: filtered, nextCursor, role: "BAND" as const };
}

// Venue sees Band cards
async function getVenueFeed(
  userId: string,
  radiusMiles: number,
  limit: number,
  cursor?: string
) {
  const venue = await prisma.venueProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      defaultBudget: true,
      capacity: true,
      genres: true,
    },
  });

  if (!venue?.latitude || !venue?.longitude) {
    return { cards: [], nextCursor: null, error: "Update your venue profile with a location first." };
  }

  // Get an active slot to swipe against; use the venue's oldest OPEN slot
  const activeSlot = await prisma.slot.findFirst({
    where: { venueId: venue.id, status: "OPEN" },
    orderBy: { date: "asc" },
  });

  // Get IDs of bands already swiped on
  const swipedBandIds = await prisma.swipe
    .findMany({
      where: { venueId: venue.id, initiator: "VENUE" },
      select: { bandId: true },
    })
    .then((rows) => rows.map((r) => r.bandId));

  const bands = await prisma.bandProfile.findMany({
    where: {
      activeStatus: true,
      AND: [
        cursor ? { id: { gt: cursor } } : {},
        { id: { notIn: swipedBandIds.length ? swipedBandIds : ["__none__"] } },
        {
          user: {
            NOT: [
              { email: { endsWith: "@vynl.pro" } },
              { email: { endsWith: "@example.com" } },
              { email: { equals: "tuba.dudes.music@gmail.com" } }
            ]
          }
        }
      ],
    },
    include: {
      user: { select: { name: true, email: true } },
      tracks: { take: 1, orderBy: { order: "asc" } },
    },
    take: limit * 3,
  });

  // Post-filter by distance
  const filtered = bands
    .filter((band) => {
      if (!band.latitude || !band.longitude) return false;
      const dist = calculateDistance(
        venue.latitude!,
        venue.longitude!,
        band.latitude,
        band.longitude
      );
      return dist <= radiusMiles;
    })
    .slice(0, limit)
    .map((band) => ({ ...band, _activeSlotId: activeSlot?.id ?? null }));

  const nextCursor = filtered.length === limit ? filtered[filtered.length - 1].id : null;
  return { cards: filtered, nextCursor, role: "VENUE" as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// createSlot — Venue posts a new open stage slot
// ─────────────────────────────────────────────────────────────────────────────

export async function createSlot(data: {
  date: string;
  startTime?: string;
  endTime?: string;
  setLength?: number;
  budget?: number;
  targetDraw?: number;
  genres?: string;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "VENUE") {
    return { success: false, error: "Only venues can post slots" };
  }

  const userId = (session.user as any).id as string;
  const venue = await prisma.venueProfile.findUnique({ where: { userId } });
  if (!venue) return { success: false, error: "Venue profile not found" };

  const slot = await prisma.slot.create({
    data: {
      venueId: venue.id,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      setLength: data.setLength,
      budget: data.budget,
      targetDraw: data.targetDraw,
      genres: data.genres,
      notes: data.notes,
    },
  });

  revalidatePath("/discover");
  return { success: true, slot };
}

// ─────────────────────────────────────────────────────────────────────────────
// getMyMatches
// ─────────────────────────────────────────────────────────────────────────────

export async function getMyMatches() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  if (role === "BAND") {
    const band = await prisma.bandProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!band) return [];
    return prisma.match.findMany({
      where: { bandId: band.id },
      include: {
        slot: true,
        venue: { select: { name: true, address: true, bookingEmail: true, interiorImage: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const venue = await prisma.venueProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!venue) return [];
    return prisma.match.findMany({
      where: { venueId: venue.id },
      include: {
        slot: true,
        band: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
