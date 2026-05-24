export interface VenueData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  bookingEmail: string;
  contactName: string;
  website: string;
  venueType: string;
  ageRequirement: string;
  averagePay: string;
  coverCost: string;
  openDates: string; // Summary of upcoming availability
  bookingHistory: string; // Summary of the kinds of bands they book
  interiorImage?: string;
  exteriorImage?: string;
  genres?: string;
  payType?: string;
  rssFeedUrl?: string;
}

export interface BandData {
  name: string;
  genre: string;
  latitude: number;
  longitude: number;
  location: string;
  coverOrOriginal: "COVER" | "ORIGINAL" | "DJ" | "KARAOKE";
  bandType: string;
  activeStatus: boolean;
  lastGigDate: string;
  members: string;
}

export async function callGrok(prompt: string) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-4.20", // As requested by the user
      messages: [
        { role: "system", content: "You are a professional music industry data analyst. Always return valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("X.AI API Error:", errorText);
    throw new Error(`XAI API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function discoverTargets(region: string, type: "VENUE" | "BAND" | "STUDIO" | "REHEARSAL" | "SHOP"): Promise<string[]> {
  try {
    const prompt = `Act as a professional talent scout. List 20 real, active ${type.toLowerCase()}s related to the music industry in ${region}. 
    Return a JSON object with a "targets" key containing an array of strings (the names).`;
    
    const response = await callGrok(prompt);
    console.log(`[DEBUG] Discovery Response for ${region} (${type}):`, response);
    return response.targets || [];
  } catch (error) {
    console.error("Discovery failed:", error);
    return [];
  }
}

function getFallbackImages(venueType?: string, genres?: string) {
  const typeLower = (venueType || "").toLowerCase();
  const genreLower = (genres || "").toLowerCase();

  // Cozy Cafe / Acoustic Cafe
  if (typeLower.includes("cafe") || typeLower.includes("coffee") || genreLower.includes("acoustic") || genreLower.includes("folk") || genreLower.includes("singer")) {
    return {
      interior: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800",
      exterior: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800"
    };
  }
  // Jazz / Blues Lounge
  if (typeLower.includes("lounge") || genreLower.includes("jazz") || genreLower.includes("blues") || genreLower.includes("soul")) {
    return {
      interior: "https://images.unsplash.com/photo-1486591978090-58e619d37fe7?q=80&w=800",
      exterior: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800"
    };
  }
  // Dance / Electronic Club
  if (genreLower.includes("electronic") || genreLower.includes("dance") || genreLower.includes("house") || genreLower.includes("dj") || genreLower.includes("techno") || typeLower.includes("disco")) {
    return {
      interior: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800",
      exterior: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800"
    };
  }
  // Gritty Rock / Punk / Metal Club
  if (genreLower.includes("rock") || genreLower.includes("punk") || genreLower.includes("metal") || genreLower.includes("grunge") || typeLower.includes("club") || typeLower.includes("bar") || typeLower.includes("pub")) {
    return {
      interior: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800",
      exterior: "https://images.unsplash.com/photo-1525926477800-7a3b40aea54e?q=80&w=800"
    };
  }
  // Concert Hall / Theatre (Default)
  return {
    interior: "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=800",
    exterior: "https://images.unsplash.com/photo-1460881680858-30d872d5b530?q=80&w=800"
  };
}

export async function crawlVenueIntelligence(query: string): Promise<VenueData | null> {
  try {
    const prompt = `Extract professional booking info for the music venue: "${query}". 
    Return a JSON object with: 
    name, address, latitude, longitude, phone, bookingEmail, contactName, website, venueType, ageRequirement, averagePay, coverCost, openDates, bookingHistory, genres, payType, rssFeedUrl.
    - "genres" should be a comma-separated list of 2-4 primary genres they book (e.g. "Rock, Metal, Punk" or "Jazz, Blues").
    - "payType" should describe the typical payment structure (e.g. "Flat Fee", "Door Split", "Guarantee + Cut", "Tips Only").
    - "rssFeedUrl" should be their real events RSS feed URL if they have one; otherwise return null.
    Focus on finding "open dates" for the next 12 months and describing the "types of bands" they book (e.g. "mostly local metal and punk").`;
    
    const data = await callGrok(prompt);
    if (data) {
      // Ensure string fields are properly typed to prevent Prisma validation errors
      if (data.averagePay !== undefined && data.averagePay !== null) {
        data.averagePay = String(data.averagePay);
      }
      if (data.coverCost !== undefined && data.coverCost !== null) {
        data.coverCost = String(data.coverCost);
      }

      // Enrich with Unsplash photography fallbacks
      const fallbacks = getFallbackImages(data.venueType, data.genres);
      if (!data.interiorImage) data.interiorImage = fallbacks.interior;
      if (!data.exteriorImage) data.exteriorImage = fallbacks.exterior;
      
      // Setup dynamic RSS feed fallback if no real one is found
      if (!data.rssFeedUrl) {
        data.rssFeedUrl = `PENDING`; // We will dynamically set or resolve this in the system
      }
    }
    return data;
  } catch (error) {
    console.error("Venue Intelligence Failure:", error);
    return null;
  }
}

export async function crawlBandIntelligence(query: string): Promise<BandData | null> {
  try {
    const prompt = `Extract professional info for the musician or band: "${query}". 
    Return a JSON object with: name, genre, latitude, longitude, location, coverOrOriginal (one of: COVER, ORIGINAL, DJ, KARAOKE), bandType, activeStatus (boolean), lastGigDate (ISO string), members (list). 
    Ensure the band is currently active (gigs in last 6 months).`;
    
    return await callGrok(prompt);
  } catch (error) {
    console.error("Band Intelligence Failure:", error);
    return null;
  }
}

export async function generateBookingEmail(band: any, venue: any, date: string): Promise<{ subject: string, body: string }> {
  try {
    const prompt = `Act as an expert booking agent for the band "${band.name}".
    Draft a professional, personalized outreach email to the venue "${venue.name}" for a gig on ${date}.
    Band Info: ${JSON.stringify(band)}
    Venue Info: ${JSON.stringify(venue)}
    
    The tone should be "Casual & Professional". Include links to their tracks and mentions of their genre matching the venue's history.
    Return a JSON object with "subject" and "body" keys.`;
    
    return await callGrok(prompt);
  } catch (error) {
    console.error("Email Generation Failure:", error);
    return { subject: `Booking Inquiry: ${band.name}`, body: "Hello, we are interested in booking a show at your venue." };
  }
}

export async function parseBookingResponse(emailBody: string): Promise<{
  intent: "POSITIVE" | "NEGATIVE" | "QUESTION" | "SPAM",
  summary: string,
  proposedDate?: string,
  proposedPay?: string,
  needsFollowUp: boolean,
  suggestedReply?: string
}> {
  try {
    const prompt = `You are a professional talent buyer's assistant. Analyze the following incoming email from a music venue and extract the status of the booking negotiation.
    
    Email Content:
    """
    ${emailBody}
    """
    
    Return a JSON object with:
    - intent: One of "POSITIVE" (they want to book), "NEGATIVE" (no thanks), "QUESTION" (they need info), or "SPAM".
    - summary: A 1-sentence summary of their stance.
    - proposedDate: If they suggest a specific date, include it.
    - proposedPay: If they mention compensation, include it.
    - needsFollowUp: Boolean.
    - suggestedReply: A professional, personalized draft for the band to send back based on their tone.
    `;
    
    return await callGrok(prompt);
  } catch (error) {
    console.error("Response Parsing Failure:", error);
    return { intent: "QUESTION", summary: "Failed to parse response", needsFollowUp: true };
  }
}
