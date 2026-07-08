"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { geocodeZip } from "@/lib/geo";

export async function updateProfile(formData: {
  name?: string;
  bio?: string;
  slug?: string;
  zip?: string;
  // Band fields
  genre?: string;
  profileImage?: string;
  headerImage?: string;
  backgroundImage?: string;
  design1Image?: string;
  design2Image?: string;
  minimumGuarantee?: number;
  expectedDraw?: number;
  isTouring?: boolean;
  isNational?: boolean;
  isSigned?: boolean;
  hasRepresentation?: boolean;
  representationDetails?: string;
  contactEmail?: string;
  contactPhone?: string;
  coverOrOriginal?: string;
  bandRider?: string;
  providesPA?: boolean;
  hasSoundGuy?: boolean;
  handlesPresales?: boolean;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  tidalUrl?: string;
  youtubeUrl?: string;
  bandcampUrl?: string;
  soundcloudUrl?: string;
  
  // Venue fields
  address?: string;
  phone?: string;
  bookingEmail?: string;
  contactName?: string;
  website?: string;
  venueType?: string;
  ageRequirement?: string;
  averagePay?: string;
  payType?: string;
  openDates?: string;
  interiorImage?: string;
  exteriorImage?: string;
  stageImage?: string;
  bookingDays?: string;
  eventFeedUrl?: string;
  targetBandsDescription?: string;
  targetBookingNights?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Normalize slug
    let finalSlug = formData.slug
      ? formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
      : undefined;

    if (finalSlug) {
      // Check if slug is taken by another band/venue profile
      const duplicateBand = await prisma.bandProfile.findFirst({
        where: { slug: finalSlug, userId: { not: userId } }
      });
      const duplicateVenue = await prisma.venueProfile.findFirst({
        where: { slug: finalSlug, userId: { not: userId } }
      });

      if (duplicateBand || duplicateVenue) {
        // Append short hash to slug to ensure uniqueness
        finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }
    }

    // Geocode ZIP if provided to get coords for map/distance calculations
    let coords: { latitude: number; longitude: number } | null = null;
    if (formData.zip) {
      coords = await geocodeZip(formData.zip);
    }

    // 1. Update User global name/bio/zip if provided
    if (formData.name || formData.bio || formData.zip) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(formData.name ? { name: formData.name } : {}),
          ...(formData.bio ? { bio: formData.bio } : {}),
          ...(formData.zip ? { zip: formData.zip } : {}),
        }
      });
    }

    if (role === "BAND") {
      await prisma.bandProfile.upsert({
        where: { userId },
        create: {
          userId,
          genre: formData.genre || null,
          profileImage: formData.profileImage || null,
          headerImage: formData.headerImage || null,
          backgroundImage: formData.backgroundImage || null,
          design1Image: formData.design1Image || null,
          design2Image: formData.design2Image || null,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          bio: formData.bio || null,
          minimumGuarantee: formData.minimumGuarantee !== undefined ? formData.minimumGuarantee : null,
          expectedDraw: formData.expectedDraw !== undefined ? formData.expectedDraw : null,
          isTouring: !!formData.isTouring,
          isNational: !!formData.isNational,
          isSigned: !!formData.isSigned,
          hasRepresentation: !!formData.hasRepresentation,
          representationDetails: formData.representationDetails || null,
          contactEmail: formData.contactEmail || null,
          contactPhone: formData.contactPhone || null,
          coverOrOriginal: formData.coverOrOriginal || null,
          bandRider: formData.bandRider || null,
          providesPA: !!formData.providesPA,
          hasSoundGuy: !!formData.hasSoundGuy,
          handlesPresales: !!formData.handlesPresales,
          spotifyUrl: formData.spotifyUrl || null,
          appleMusicUrl: formData.appleMusicUrl || null,
          tidalUrl: formData.tidalUrl || null,
          youtubeUrl: formData.youtubeUrl || null,
          bandcampUrl: formData.bandcampUrl || null,
          soundcloudUrl: formData.soundcloudUrl || null,
          slug: finalSlug || `artist-${Math.random().toString(36).slice(2, 8)}`,
        },
        update: {
          genre: formData.genre || null,
          profileImage: formData.profileImage || null,
          headerImage: formData.headerImage || null,
          backgroundImage: formData.backgroundImage || null,
          design1Image: formData.design1Image || null,
          design2Image: formData.design2Image || null,
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
          bio: formData.bio || null,
          minimumGuarantee: formData.minimumGuarantee !== undefined ? formData.minimumGuarantee : null,
          expectedDraw: formData.expectedDraw !== undefined ? formData.expectedDraw : null,
          isTouring: !!formData.isTouring,
          isNational: !!formData.isNational,
          isSigned: !!formData.isSigned,
          hasRepresentation: !!formData.hasRepresentation,
          representationDetails: formData.representationDetails || null,
          contactEmail: formData.contactEmail || null,
          contactPhone: formData.contactPhone || null,
          coverOrOriginal: formData.coverOrOriginal || null,
          bandRider: formData.bandRider || null,
          providesPA: !!formData.providesPA,
          hasSoundGuy: !!formData.hasSoundGuy,
          handlesPresales: !!formData.handlesPresales,
          spotifyUrl: formData.spotifyUrl || null,
          appleMusicUrl: formData.appleMusicUrl || null,
          tidalUrl: formData.tidalUrl || null,
          youtubeUrl: formData.youtubeUrl || null,
          bandcampUrl: formData.bandcampUrl || null,
          soundcloudUrl: formData.soundcloudUrl || null,
          ...(finalSlug ? { slug: finalSlug } : {}),
        }
      });
    } else if (role === "VENUE") {
      await prisma.venueProfile.upsert({
        where: { userId },
        create: {
          userId,
          name: formData.name || "New Venue",
          address: formData.address || null,
          phone: formData.phone || null,
          bookingEmail: formData.bookingEmail || null,
          contactName: formData.contactName || null,
          website: formData.website || null,
          venueType: formData.venueType || null,
          ageRequirement: formData.ageRequirement || null,
          averagePay: formData.averagePay || null,
          payType: formData.payType || null,
          openDates: formData.openDates || null,
          interiorImage: formData.interiorImage || null,
          exteriorImage: formData.exteriorImage || null,
          stageImage: formData.stageImage || null,
          bookingDays: formData.bookingDays || null,
          eventFeedUrl: formData.eventFeedUrl || null,
          targetBandsDescription: formData.targetBandsDescription || null,
          targetBookingNights: formData.targetBookingNights || null,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          genres: formData.genre || null,
          slug: finalSlug || `venue-${Math.random().toString(36).slice(2, 8)}`,
        },
        update: {
          ...(formData.name ? { name: formData.name } : {}),
          address: formData.address || null,
          phone: formData.phone || null,
          bookingEmail: formData.bookingEmail || null,
          contactName: formData.contactName || null,
          website: formData.website || null,
          venueType: formData.venueType || null,
          ageRequirement: formData.ageRequirement || null,
          averagePay: formData.averagePay || null,
          payType: formData.payType || null,
          openDates: formData.openDates || null,
          interiorImage: formData.interiorImage || null,
          exteriorImage: formData.exteriorImage || null,
          stageImage: formData.stageImage || null,
          bookingDays: formData.bookingDays || null,
          eventFeedUrl: formData.eventFeedUrl || null,
          targetBandsDescription: formData.targetBandsDescription || null,
          targetBookingNights: formData.targetBookingNights || null,
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
          genres: formData.genre || null,
          ...(finalSlug ? { slug: finalSlug } : {}),
        }
      });
    }

    revalidatePath("/venues");
    revalidatePath("/map");
    if (finalSlug) {
      revalidatePath(`/${finalSlug}`);
    }

    return { success: true, slug: finalSlug };
  } catch (error: any) {
    console.error("Profile update server error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}

export async function getCurrentProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "BAND") {
    const band = await prisma.bandProfile.findUnique({
      where: { userId },
      include: { user: true }
    });
    return { role, profile: band };
  } else {
    const venue = await prisma.venueProfile.findUnique({
      where: { userId },
      include: { user: true }
    });
    return { role, profile: venue };
  }
}

