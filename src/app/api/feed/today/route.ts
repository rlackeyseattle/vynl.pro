import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Fetch a random sampling of venues to populate today's feed
    // In PostgreSQL, we can use orderBy: { id: 'asc' } and skip a random number, 
    // or just fetch 100 and shuffle.
    const venueCount = await prisma.venueProfile.count();
    const skip = Math.max(0, Math.floor(Math.random() * (venueCount - 20)));
    
    const venues = await prisma.venueProfile.findMany({
      skip: skip,
      take: 20,
      select: {
        id: true,
        name: true,
        address: true,
        genres: true,
        venueType: true,
        averagePay: true,
      }
    });

    // Procedurally generate exactly ONE gig for each venue for "Tonight"
    const feedItems = venues.map((venue, index) => {
      const primaryGenres = venue.genres || "Live Music, Indie, Rock";
      const genreArray = primaryGenres.split(",").map((g) => g.trim());
      const mainGenre = genreArray[0] || "Live Music";
      
      const showTitles = [
        `${mainGenre} Spotlight Night`,
        `Local Showcase: ${mainGenre}`,
        `The Circuit Presents: Live at ${venue.name}`,
        `Underground ${mainGenre} Session`,
        `${venue.venueType || 'Club'} Friday Feature`,
      ];
      
      // Seeded random for consistent daily shows based on venue ID
      const seed = venue.id.charCodeAt(0) + new Date().getDate();
      const title = showTitles[seed % showTitles.length];
      
      // Randomize start time between 7PM and 10PM
      const startHour = 19 + (seed % 4);
      const startTime = `${startHour > 12 ? startHour - 12 : startHour}:00 PM`;

      return {
        id: `feed-evt-${venue.id}`,
        venueId: venue.id,
        venueName: venue.name,
        location: venue.address ? venue.address.split(',')[0] : 'Unknown City',
        title: title,
        genre: mainGenre,
        time: startTime,
        compensation: venue.averagePay || "TBD",
      };
    });

    // Shuffle the final feed items
    feedItems.sort(() => Math.random() - 0.5);

    return NextResponse.json({ 
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      events: feedItems 
    });

  } catch (error) {
    console.error("Feed Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate feed" }, { status: 500 });
  }
}
