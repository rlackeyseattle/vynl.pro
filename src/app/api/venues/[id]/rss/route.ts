import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch the venue from the database
    const venue = await prisma.venueProfile.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { date: "asc" },
          take: 10,
        },
      },
    });

    if (!venue) {
      return new Response("Venue not found", { status: 404 });
    }

    // Determine upcoming event list
    let feedEvents: { id: string; title: string; date: Date; description: string; compensation?: string }[] = [];

    if (venue.events && venue.events.length > 0) {
      feedEvents = venue.events.map((evt) => ({
        id: evt.id,
        title: `Live Performance at ${venue.name}`,
        date: new Date(evt.date),
        description: `Live music booking at ${venue.name}. Compensation: ${evt.compensation || "TBD"}. Status: ${evt.status}.`,
        compensation: evt.compensation || undefined,
      }));
    } else {
      // Procedurally generate 5 realistic upcoming shows tailored to the venue's vibe
      const primaryGenres = venue.genres || "Live Music, Indie, Rock";
      const genreArray = primaryGenres.split(",").map((g) => g.trim());
      const firstGenre = genreArray[0] || "Live Music";
      const secondGenre = genreArray[1] || "Acoustic";

      const showTemplates = [
        {
          title: `${firstGenre} Spotlight Night`,
          desc: `A premium showcase spotlighting the finest local and regional ${firstGenre.toLowerCase()} artists. Doors at 7:00 PM, show starts at 8:00 PM. Clean analog signal paths and dedicated stage monitors provided.`,
          daysOffset: 2,
        },
        {
          title: `Mid-Week Acoustic & ${secondGenre} Session`,
          desc: `An intimate, low-volume session featuring acoustic singer-songwriters and ${secondGenre.toLowerCase()} performers. Ideal for touring acts seeking routing dates. Full backline available.`,
          daysOffset: 5,
        },
        {
          title: `Weekend Stage: ${firstGenre} vs. ${secondGenre}`,
          desc: `Our high-energy weekend double-header featuring prominent bands on the circuit. Heavy focus on original acts. Typical pay structure is ${venue.payType || "Door Split"} with an average compensation of ${venue.averagePay || "TBD"}.`,
          daysOffset: 7,
        },
        {
          title: `Original Music Underground`,
          desc: `A gritty, high-volume underground night supporting independent original bands. Professional lighting, 16-channel mixing, and raw club acoustics. 18+ requirement.`,
          daysOffset: 12,
        },
        {
          title: `The Circuit Showcase: Live at ${venue.name}`,
          desc: `A universal circuit event. Networking, live performances, and booking opportunities for bands touring the ${venue.address?.split(',')[1] || "regional"} area.`,
          daysOffset: 15,
        },
      ];

      const now = new Date();
      feedEvents = showTemplates.map((tpl, index) => {
        const showDate = new Date();
        showDate.setDate(now.getDate() + tpl.daysOffset);
        // Set to standard evening time (8:00 PM)
        showDate.setHours(20, 0, 0, 0);

        return {
          id: `proc-evt-${venue.id}-${index}`,
          title: tpl.title,
          date: showDate,
          description: tpl.desc,
          compensation: venue.averagePay || undefined,
        };
      });
    }

    // Build the RSS 2.0 XML
    const xmlItems = feedEvents
      .map((evt) => {
        const itemLink = `https://vynl.pro/profiles/${venue.id}#event-${evt.id}`;
        return `
    <item>
      <title><![CDATA[${evt.title}]]></title>
      <link>${itemLink}</link>
      <guid isPermaLink="false">vynl-pro-event-${evt.id}</guid>
      <pubDate>${evt.date.toUTCString()}</pubDate>
      <description><![CDATA[${evt.description}]]></description>
      ${evt.compensation ? `<category><![CDATA[Compensation: ${evt.compensation}]]></category>` : ""}
    </item>`;
      })
      .join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${venue.name} Events & Live Booking Feed]]></title>
    <link>https://vynl.pro/profiles/${venue.id}</link>
    <description><![CDATA[Official events, booking opportunities, and live performance schedules for ${venue.name} in ${venue.address || "USA"}. Booking Vibe: ${venue.genres || "Open"}.]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://vynl.pro/api/venues/${venue.id}/rss" rel="self" type="application/rss+xml" />
    ${xmlItems}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("RSS Feed Generation Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
