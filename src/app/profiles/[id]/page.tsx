import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;

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
    const band = await prisma.bandProfile.findUnique({ where: { id } });
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
    return <ProfileClient type="BAND" data={user.bandProfile} />;
  }

  if (user.role === "VENUE" && user.venueProfile) {
    return <ProfileClient type="VENUE" data={user.venueProfile} />;
  }

  return notFound();
}
