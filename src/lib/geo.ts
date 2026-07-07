export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function geocodeZip(zip: string): Promise<{ latitude: number; longitude: number } | null> {
  const staticZips: Record<string, { lat: number; lon: number }> = {
    "59901": { lat: 48.1978, lon: -114.3161 }, // Kalispell, MT
    "59911": { lat: 48.2044, lon: -114.1897 }, // Columbia Falls, MT
    "59937": { lat: 48.4111, lon: -114.3372 }, // Whitefish, MT
    "59715": { lat: 45.6796, lon: -111.0386 }, // Bozeman, MT
    "59801": { lat: 46.8787, lon: -113.9966 }, // Missoula, MT
    "59601": { lat: 46.5891, lon: -112.0391 }, // Helena, MT
    "59101": { lat: 45.7833, lon: -108.5007 }, // Billings, MT
  };

  const normalized = zip.trim();
  if (staticZips[normalized]) {
    return { latitude: staticZips[normalized].lat, longitude: staticZips[normalized].lon };
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${normalized}&country=US&format=json&limit=1`, {
      headers: { "User-Agent": "VynlProMobileReadiness/1.0" }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.error("Geocoding failed, falling back to default Montana coordinate:", e);
  }

  return { latitude: 48.1978, longitude: -114.3161 };
}

