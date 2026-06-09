import { calculateDistance } from "./geo";

export interface MatchResult {
  overallScore: number;
  locationScore: number;
  genreScore: number;
  payScore: number;
  scheduleScore: number;
  details: {
    distance: number;
    genreMatch: string;
    payMatch: string;
    scheduleMatch: string;
  };
}

export function calculateMatch(
  band: { latitude: number; longitude: number; genre?: string | null },
  venue: { latitude: number; longitude: number; genres?: string | null; averagePay?: string | null; openDates?: string | null },
  targetDates: string[],
  maxRadius: number,
  minCompensation: number
): MatchResult {
  // 1. Location match
  const distance = calculateDistance(band.latitude, band.longitude, venue.latitude, venue.longitude);
  let locationScore = 0;
  if (distance <= maxRadius) {
    locationScore = Math.max(0, Math.round((1 - distance / maxRadius) * 100));
  }

  // 2. Genre match
  let genreScore = 15; // default fallback
  const bandGenre = (band.genre || "").toLowerCase().trim();
  const venueGenres = (venue.genres || "").split(",").map(g => g.toLowerCase().trim());
  
  if (bandGenre && venueGenres.length > 0) {
    if (venueGenres.includes(bandGenre)) {
      genreScore = 100;
    } else if (venueGenres.some(g => g.includes(bandGenre) || bandGenre.includes(g))) {
      genreScore = 70;
    }
  }

  // 3. Pay match
  let payScore = 60; // TBD fallback
  let numericPay = 0;
  if (venue.averagePay) {
    const payStr = venue.averagePay.replace(/[^0-9]/g, "");
    if (payStr) {
      numericPay = parseInt(payStr, 10);
    }
  }
  if (numericPay > 0 && minCompensation > 0) {
    if (numericPay >= minCompensation) {
      payScore = 100;
    } else {
      payScore = Math.round((numericPay / minCompensation) * 100);
    }
  }

  // 4. Schedule Match
  let scheduleScore = 65; // default moderate score
  if (venue.openDates && targetDates.length > 0) {
    const openDatesLower = venue.openDates.toLowerCase();
    const hasTargetDateMatch = targetDates.some(date => openDatesLower.includes(date) || openDatesLower.includes("weekend") || openDatesLower.includes("booking now") || openDatesLower.includes("open"));
    if (hasTargetDateMatch) {
      scheduleScore = 100;
    }
  }

  const overallScore = Math.round((locationScore + genreScore + payScore + scheduleScore) / 4);

  return {
    overallScore,
    locationScore,
    genreScore,
    payScore,
    scheduleScore,
    details: {
      distance: Math.round(distance * 10) / 10,
      genreMatch: genreScore === 100 ? "Direct Genre Match" : genreScore >= 70 ? "Related Genre Match" : "Genre Unmatched",
      payMatch: payScore === 100 ? `Pay (${venue.averagePay}) Meets Target` : `Pay (${venue.averagePay || 'TBD'}) Below Target`,
      scheduleMatch: scheduleScore === 100 ? "Schedule Confirmed" : "Flexible Schedule",
    }
  };
}
