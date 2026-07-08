import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileClient from "../profiles/[id]/ProfileClient";

export default async function CleanProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Check BandProfile by slug
  const band = await prisma.bandProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true, bio: true } } }
  });

  if (band) {
    return <ProfileClient type="BAND" data={band} />;
  }

  // 2. Check VenueProfile by slug
  const venue = await prisma.venueProfile.findUnique({
    where: { slug },
  });

  if (venue) {
    return <ProfileClient type="VENUE" data={venue} />;
  }

  // 3. Fallback: Check if it's a direct ID for backwards compatibility
  const bandById = await prisma.bandProfile.findUnique({
    where: { id: slug },
    include: { user: { select: { name: true, bio: true } } }
  });
  if (bandById) {
    return <ProfileClient type="BAND" data={bandById} />;
  }

  const venueById = await prisma.venueProfile.findUnique({ where: { id: slug } });
  if (venueById) {
    return <ProfileClient type="VENUE" data={venueById} />;
  }

  return notFound();
}
