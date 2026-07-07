"use client";

import { useState, useEffect } from "react";
import { X, Briefcase, MapPin, DollarSign, Users, Music2, Calendar, Clock, Zap, Check, ChevronDown, ChevronUp, SlidersHorizontal, Loader2, Sparkles, Star } from "lucide-react";
import { handleSwipe, DraftContract, getDiscoveryFeed } from "@/app/actions/swipe";
import { getCurrentProfile } from "@/app/actions/profile";
import { calculateMatch, MatchResult } from "@/lib/matchmaker";

// ─────────────────────────────────────────────────────────────────────────────
// Match Overlay (Provisional Contract)
// ─────────────────────────────────────────────────────────────────────────────

function MatchOverlay({
  contract,
  onClose,
}: {
  contract: DraftContract;
  onClose: () => void;
}) {
  const payDisplay = contract.agreedPay
    ? `$${contract.agreedPay.toFixed(0)}`
    : "TBD";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700/60 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(197,160,89,0.25)] animate-in zoom-in-95 duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce">📋</div>

          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] to-[#f3d085] mb-1 tracking-tight">
            TERMS COMPILED!
          </div>
          <p className="text-zinc-400 text-sm mb-6">
            Provisional tour routing terms have been locked. Review the draft contract below.
          </p>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 text-left space-y-3.5 mb-6 font-mono text-xs font-mono">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
              DRAFT SETTLEMENT DETAILS
            </h3>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">🎸 ARTIST</span>
              <span className="font-bold text-white">{contract.bandName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">🏛️ VENUE</span>
              <span className="font-bold text-white">{contract.venueName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">📅 DATE</span>
              <span className="font-bold text-white">
                {new Date(contract.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </div>

            {contract.startTime && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">⏰ TIME SLOT</span>
                <span className="font-bold text-white">
                  {contract.startTime}
                  {contract.endTime ? ` – ${contract.endTime}` : ""}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-2">
              <span className="text-zinc-500">💵 BUDGET/PAY</span>
              <span className="font-black text-lg text-emerald-400">{payDisplay}</span>
            </div>
          </div>

          <div className="flex gap-3">
            {contract.venueEmail && (
              <a
                href={`mailto:${contract.venueEmail}?subject=Booking Proposal – ${contract.venueName}&body=Hi! We matched on vynl.pro for the date of ${new Date(contract.date).toLocaleDateString()}. Let's compile details!`}
                className="flex-1 py-3.5 bg-[#c5a059] hover:bg-[#d4b06a] text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:scale-[1.02] text-center"
              >
                OPEN IN MAIL 📧
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              DISMISS DECK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Booking Matchboard Component
// ─────────────────────────────────────────────────────────────────────────────

interface SwipeDeckProps {
  initialCards: any[];
  role: "BAND" | "VENUE";
  radiusMiles?: number;
}

export function SwipeDeck({ initialCards, role, radiusMiles: initialRadius = 100 }: SwipeDeckProps) {
  const [cards, setCards] = useState<any[]>(initialCards);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [radius, setRadius] = useState<number>(initialRadius);
  const [minPay, setMinPay] = useState<number>(0);
  const [genreQuery, setGenreQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Overlay state
  const [matchData, setMatchData] = useState<DraftContract | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyProfile() {
      try {
        const res = await getCurrentProfile();
        if (res && res.profile) {
          setMyProfile(res.profile);
          if (role === "BAND" && res.profile.minimumGuarantee) {
            setMinPay(res.profile.minimumGuarantee);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMyProfile();
  }, [role]);

  const handleRequestBooking = async (card: any) => {
    if (processingId) return;
    setProcessingId(card.id);
    
    // Slot ID logic: Band swipes on Slot, Venue swipes on Band
    const slotId = role === "BAND" ? card.id : (card._activeSlotId ?? "");
    const bandId = role === "VENUE" ? card.id : (myProfile?.id ?? "");

    try {
      const result = await handleSwipe(slotId, bandId, "RIGHT");
      if (result.success) {
        if (result.matched && result.matchId && result.draftContract) {
          try {
            const parsed = JSON.parse(result.draftContract) as DraftContract;
            setMatchData(parsed);
          } catch {
            setMatchData({
              matchId: result.matchId,
              bandName: role === "VENUE" ? card.name : (myProfile?.name ?? "Artist"),
              venueName: role === "BAND" ? card.venue.name : (myProfile?.name ?? "Venue"),
              date: card.date || new Date().toISOString(),
              agreedPay: card.budget || null,
              setLength: card.setLength || null,
              startTime: card.startTime || null,
              endTime: card.endTime || null,
              bandEmail: role === "VENUE" ? card.contactEmail : (myProfile?.contactEmail ?? ""),
              venueEmail: role === "BAND" ? card.venue.bookingEmail : (myProfile?.bookingEmail ?? ""),
              venueAddress: role === "BAND" ? card.venue.address : (myProfile?.address ?? ""),
              generatedAt: new Date().toISOString()
            });
          }
        }
        // Remove card from UI stack since it's processed
        setCards(prev => prev.filter(c => c.id !== card.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (card: any) => {
    const slotId = role === "BAND" ? card.id : (card._activeSlotId ?? "");
    const bandId = role === "VENUE" ? card.id : (myProfile?.id ?? "");

    try {
      await handleSwipe(slotId, bandId, "LEFT");
      // Remove from list
      setCards(prev => prev.filter(c => c.id !== card.id));
    } catch (e) {
      console.error(e);
    }
  };

  // ── Calculate Matchmaker Scores ─────────────────────────────────────────────
  const scoredCards = cards.map((card) => {
    if (!myProfile || !myProfile.latitude || !myProfile.longitude) {
      return { card, score: { overallScore: 70, details: { distance: 0, genreMatch: "Pending", payMatch: "Pending", scheduleMatch: "Pending" } } };
    }

    const bandLat = role === "BAND" ? myProfile.latitude : (card.latitude ?? 0);
    const bandLng = role === "BAND" ? myProfile.longitude : (card.longitude ?? 0);
    const bandGenre = role === "BAND" ? myProfile.genre : (card.genre ?? "");

    const venueLat = role === "BAND" ? (card.venue.latitude ?? 0) : myProfile.latitude;
    const venueLng = role === "BAND" ? (card.venue.longitude ?? 0) : myProfile.longitude;
    const venueGenres = role === "BAND" ? (card.venue.genres ?? "") : (myProfile.genres ?? "");
    const venuePay = role === "BAND" ? (card.venue.averagePay ?? "") : (myProfile.averagePay ?? "");
    const venueOpenDates = role === "BAND" ? (card.venue.openDates ?? "") : (myProfile.openDates ?? "");

    const targetDates = role === "BAND"
      ? (myProfile.targetDates ? JSON.parse(myProfile.targetDates) : [])
      : [];

    const score = calculateMatch(
      { latitude: bandLat, longitude: bandLng, genre: bandGenre },
      { latitude: venueLat, longitude: venueLng, genres: venueGenres, averagePay: venuePay, openDates: venueOpenDates },
      targetDates,
      radius,
      minPay
    );

    return { card, score };
  });

  // Filter scored list
  const filteredCards = scoredCards
    .filter((item) => {
      // Radius limit filter
      if (item.score.details.distance > radius) return false;

      // Min pay filter
      if (minPay > 0) {
        let numericPay = 0;
        const payStr = role === "BAND"
          ? (item.card.budget ? String(item.card.budget) : item.card.venue.averagePay)
          : (myProfile?.averagePay || "0");

        if (payStr) {
          const parsed = parseInt(payStr.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(parsed)) numericPay = parsed;
        }
        if (numericPay < minPay) return false;
      }

      // Genre filter
      if (genreQuery) {
        const query = genreQuery.toLowerCase();
        const targetGenres = role === "BAND"
          ? (item.card.venue.genres || "").toLowerCase()
          : (item.card.genre || "").toLowerCase();
        if (!targetGenres.includes(query)) return false;
      }

      return true;
    })
    .sort((a, b) => b.score.overallScore - a.score.overallScore);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Querying Match Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {matchData && (
        <MatchOverlay contract={matchData} onClose={() => setMatchData(null)} />
      )}

      {/* Control Panel Filters */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-[#c5a059]" />
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">
            Routing & Booking Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
              <span>Search Radius</span>
              <span className="text-[#c5a059]">{radius} Miles</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              className="w-full h-1 bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>

          {/* Min Compensation */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
              <span>Minimum Payout</span>
              <span className="text-emerald-400">${minPay}+</span>
            </div>
            <input
              type="number"
              placeholder="e.g. 200"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/40 placeholder-zinc-700"
              value={minPay || ""}
              onChange={(e) => setMinPay(Number(e.target.value))}
            />
          </div>

          {/* Genre Search */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Filter by Genre
            </div>
            <input
              type="text"
              placeholder="e.g. Rock, Blues, Electro"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/40 placeholder-zinc-700"
              value={genreQuery}
              onChange={(e) => setGenreQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Target Queue Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest font-black">
        <span>Qualified Matches</span>
        <span className="text-[#c5a059] bg-[#c5a059]/5 px-3 py-1 rounded-full border border-[#c5a059]/20 flex items-center gap-1.5">
          <Star size={11} className="animate-spin text-[#c5a059]" />
          {filteredCards.length} Matches Found
        </span>
      </div>

      {/* Matching Queue List */}
      {filteredCards.length === 0 ? (
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800/80 rounded-3xl p-12 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Queue Evaluated</h3>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            Adjust search radius, pay expectations, or style preferences to discover additional venues/artists.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map(({ card, score }) => {
            const isExpanded = expandedId === card.id;
            const dateStr = card.date
              ? new Date(card.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
              : null;

            return (
              <div
                key={card.id}
                className="bg-zinc-900/60 border border-zinc-800/60 hover:border-[#c5a059]/20 rounded-2xl overflow-hidden transition-all duration-300 group"
              >
                {/* Main Card Summary */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative">
                  {/* Left Identity details */}
                  <div className="flex items-start gap-4">
                    {/* Match Score Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-[#c5a059]/40 transition-colors">
                      <span className="text-[#c5a059] font-black text-sm">{score.overallScore}%</span>
                      <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-black">MATCH</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-black text-white text-base uppercase tracking-tight">
                          {role === "BAND" ? card.venue.name : card.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-850 text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                          {role === "BAND" ? card.venue.venueType : (card.genre || "Artist")}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#c5a059]" />
                          {role === "BAND" ? card.venue.address : (card.location || "Unknown")} ({score.details.distance} miles)
                        </span>
                        {dateStr && (
                          <span className="flex items-center gap-1 font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-850">
                            <Calendar size={12} className="text-[#c5a059]" />
                            {dateStr}
                          </span>
                        )}
                        {card.budget && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <DollarSign size={12} />
                            ${card.budget.toLocaleString()} Guaranteed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* Expand Details Trigger */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : card.id)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-855 text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                      SPECS {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Dismiss */}
                    <button
                      onClick={() => handleDismiss(card)}
                      className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-855 hover:border-red-900 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-colors"
                      title="Dismiss Slot"
                    >
                      <X size={16} />
                    </button>

                    {/* Book */}
                    <button
                      onClick={() => handleRequestBooking(card)}
                      disabled={processingId === card.id}
                      className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b06a] disabled:opacity-40 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(197,160,89,0.15)] active:scale-97"
                    >
                      {processingId === card.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check size={14} className="stroke-[3]" />
                      )}
                      REQUEST BOOKING
                    </button>
                  </div>
                </div>

                {/* Expanded Details Breakdown */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-zinc-800/50 bg-zinc-950/30 space-y-4 pt-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Metric 1: Location */}
                      <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Location Match</div>
                        <div className="text-xs font-black text-white mt-1 uppercase">
                          {score.locationScore}% ({score.details.distance} mi)
                        </div>
                      </div>

                      {/* Metric 2: Genre */}
                      <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Genre Match</div>
                        <div className="text-xs font-black text-white mt-1 uppercase">
                          {score.details.genreMatch} ({score.genreScore}%)
                        </div>
                      </div>

                      {/* Metric 3: Pay */}
                      <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Pay Match</div>
                        <div className="text-xs font-black text-emerald-400 mt-1 uppercase">
                          {score.details.payMatch}
                        </div>
                      </div>

                      {/* Metric 4: Schedule */}
                      <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Schedule Fit</div>
                        <div className="text-xs font-black text-white mt-1 uppercase">
                          {score.details.scheduleMatch}
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes or Info */}
                    {role === "BAND" && card.notes && (
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-400">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Venue Notes</div>
                        <p>{card.notes}</p>
                      </div>
                    )}

                    {role === "VENUE" && card.bio && (
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-400">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Artist Biography</div>
                        <p>{card.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
