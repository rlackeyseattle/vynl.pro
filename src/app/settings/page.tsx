import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/settings");
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  let profileData: any = null;

  if (role === "BAND") {
    profileData = await prisma.bandProfile.findUnique({
      where: { userId },
    });
  } else if (role === "VENUE") {
    profileData = await prisma.venueProfile.findUnique({
      where: { userId },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, bio: true }
  });

  return (
    <SettingsClient 
      role={role} 
      initialProfile={profileData} 
      initialUser={user} 
    />
  );
}
