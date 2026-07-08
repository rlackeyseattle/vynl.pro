import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try to find the user and their profiles
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      bandProfile: true,
      venueProfile: true,
    }
  });

  if (!user) {
    // Check if it's a direct profile ID instead of a user ID
    const band = await prisma.bandProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, bio: true } } }
    });
    const venue = await prisma.venueProfile.findUnique({ where: { id } });
    
    if (band) {
      return <ProfileClient type="BAND" data={band} />;
    }
    if (venue) {
      return <ProfileClient type="VENUE" data={venue} />;
    }
    
    return notFound();
  }

  if (user.role === "BAND" && user.bandProfile) {
    const bandProfileWithUser = {
      ...user.bandProfile,
      user: { name: user.name, bio: user.bio }
    };
    return <ProfileClient type="BAND" data={bandProfileWithUser} />;
  }

  if (user.role === "VENUE" && user.venueProfile) {
    return <ProfileClient type="VENUE" data={user.venueProfile} />;
  }

  return notFound();
}
