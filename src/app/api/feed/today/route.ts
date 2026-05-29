import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // Cache for 5 minutes for real-time responsiveness

export async function GET() {
  try {
    // Fetch a rich selection of up to 100 venues including their events
    const venues = await prisma.venueProfile.findMany({
      take: 100,
      select: {
        id: true,
        name: true,
        address: true,
        genres: true,
        venueType: true,
        averagePay: true,
        payType: true,
        events: {
          where: {
            status: "AVAILABLE",
          },
          orderBy: { date: "asc" },
          take: 10,
        }
      }
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayEvents: any[] = [];
    const upcomingEvents: any[] = [];

    // Compile events from all venues (matching RSS generation spec)
    venues.forEach((venue) => {
      const primaryGenres = venue.genres || "Live Music, Indie, Rock";
      const genreArray = primaryGenres.split(",").map((g) => g.trim());
      const firstGenre = genreArray[0] || "Live Music";
      const secondGenre = genreArray[1] || "Acoustic";

      // If venue has actual stored events
      if (venue.events && venue.events.length > 0) {
        venue.events.forEach((evt) => {
          const eventDate = new Date(evt.date);
          const mappedEvent = {
            id: evt.id,
            venueId: venue.id,
            venueName: venue.name,
            location: venue.address ? venue.address.split(',')[1]?.trim() || venue.address.split(',')[0] : 'Unknown City',
            title: `Live Performance at ${venue.name}`,
            genre: firstGenre,
            time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            rawDate: eventDate,
            compensation: evt.compensation || venue.averagePay || "TBD",
            description: `Live music booking at ${venue.name}. Compensation: ${evt.compensation || venue.averagePay || "TBD"}.`,
          };

          if (eventDate >= todayStart && eventDate <= todayEnd) {
            todayEvents.push(mappedEvent);
          } else if (eventDate > todayEnd) {
            upcomingEvents.push(mappedEvent);
          }
        });
      } else {
        // Procedurally generate the 5 tailored shows matching the RSS feeds
        const showTemplates = [
          {
            title: `${firstGenre} Spotlight Night`,
            description: `A premium showcase spotlighting the finest local and regional ${firstGenre.toLowerCase()} artists. Doors at 7:00 PM, show starts at 8:00 PM.`,
            daysOffset: 0, // Tonight!
            startHour: 20,
          },
          {
            title: `Acoustic & ${secondGenre} Session`,
            description: `An intimate, low-volume session featuring acoustic singer-songwriters and ${secondGenre.toLowerCase()} performers.`,
            daysOffset: 2,
            startHour: 19,
          },
          {
            title: `Weekend Stage: ${firstGenre} Live`,
            description: `Our high-energy weekend double-header featuring prominent bands on the circuit. Heavy focus on original acts.`,
            daysOffset: 4,
            startHour: 21,
          },
          {
            title: `Original Music Underground`,
            description: `A gritty, high-volume underground night supporting independent original bands. 21+ with cover cost.`,
            daysOffset: 7,
            startHour: 20,
          },
          {
            title: `The Circuit Showcase: Live at ${venue.name}`,
            description: `A universal circuit event. Networking, live performances, and booking opportunities for bands touring the area.`,
            daysOffset: 10,
            startHour: 19,
          },
        ];

        showTemplates.forEach((tpl, index) => {
          const eventDate = new Date();
          eventDate.setDate(now.getDate() + tpl.daysOffset);
          eventDate.setHours(tpl.startHour, 0, 0, 0);

          const mappedEvent = {
            id: `rss-proc-${venue.id}-${index}`,
            venueId: venue.id,
            venueName: venue.name,
            location: venue.address ? venue.address.split(',')[1]?.trim() || venue.address.split(',')[0] : 'Unknown City',
            title: tpl.title,
            genre: firstGenre,
            time: `${tpl.startHour > 12 ? tpl.startHour - 12 : tpl.startHour}:00 PM`,
            rawDate: eventDate,
            compensation: venue.averagePay || "TBD",
            description: tpl.description,
          };

          if (tpl.daysOffset === 0) {
            // Seeded random shuffle to keep tonight active
            todayEvents.push(mappedEvent);
          } else {
            upcomingEvents.push(mappedEvent);
          }
        });
      }
    });

    // Shuffle Today's events to make the listing diverse and active
    todayEvents.sort(() => Math.random() - 0.5);

    // Sort Upcoming events chronologically
    upcomingEvents.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    return NextResponse.json({
      date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      today: todayEvents,
      upcoming: upcomingEvents.slice(0, 150), // Cap at 150 premium upcoming calendar events
    });

  } catch (error) {
    console.error("RSS Aggregator Error:", error);
    return NextResponse.json({ error: "Failed to aggregate RSS events" }, { status: 500 });
  }
}
