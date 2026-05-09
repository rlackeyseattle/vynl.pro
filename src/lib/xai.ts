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

export async function crawlVenueIntelligence(query: string): Promise<VenueData | null> {
  try {
    const prompt = `Extract professional booking info for the music venue: "${query}". 
    Return a JSON object with: name, address, latitude, longitude, phone, bookingEmail, contactName, website, venueType, ageRequirement, averagePay, coverCost, openDates, bookingHistory. 
    Focus on finding "open dates" for the next 12 months and describing the "types of bands" they book (e.g. "mostly local metal and punk").`;
    
    return await callGrok(prompt);
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
