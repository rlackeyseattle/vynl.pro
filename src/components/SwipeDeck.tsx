"use client";

import { useState } from "react";
import { X, Heart, MapPin, DollarSign, Users, Music2, Calendar, Clock, Zap, Check } from "lucide-react";
import { useCardDeck } from "@/hooks/useCardDeck";
import { getDiscoveryFeed } from "@/app/actions/swipe";
import { DraftContract } from "@/app/actions/swipe";
import type { Card } from "@/hooks/useCardDeck";

// ─────────────────────────────────────────────────────────────────────────────
// Match Overlay
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(236,72,153,0.4)] animate-in zoom-in-95 duration-300">
        {/* Glow burst */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-transparent to-indigo-600/10 pointer-events-none" />

        <div className="relative p-8 text-center">
          {/* Emoji burst */}
          <div className="text-7xl mb-4 animate-bounce">🎶</div>

          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-1">
            IT&apos;S A MATCH!
          </div>
          <p className="text-zinc-400 text-sm mb-6">
            You&apos;ve got a provisional booking. Review the details below.
          </p>

          {/* Settlement sheet */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left space-y-3 mb-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
              Draft Settlement Sheet
            </h3>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">🎸 Band</span>
              <span className="font-bold text-white text-sm">{contract.bandName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">🏛️ Venue</span>
              <span className="font-bold text-white text-sm">{contract.venueName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">📅 Date</span>
              <span className="font-bold text-white text-sm">
                {new Date(contract.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {contract.startTime && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">⏰ Set Time</span>
                <span className="font-bold text-white text-sm">
                  {contract.startTime}
                  {contract.endTime ? ` – ${contract.endTime}` : ""}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-2">
              <span className="text-zinc-400 text-sm">💵 Agreed Pay</span>
              <span className="font-black text-2xl text-emerald-400">{payDisplay}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {contract.venueEmail && (
              <a
                href={`mailto:${contract.venueEmail}?subject=Match Confirmed – ${contract.venueName}&body=Hi! We matched on vynl.pro for ${new Date(contract.date).toLocaleDateString()}. Looking forward to discussing details!`}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 rounded-xl text-white font-bold text-sm transition-all shadow-lg text-center"
              >
                Send Email 📧
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-bold text-sm transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slot Card (Bands see these)
// ─────────────────────────────────────────────────────────────────────────────

function SlotCard({ card, isNext }: { card: Card; isNext?: boolean }) {
  const venue = card.venue;
  const dateStr = new Date(card.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`absolute inset-0 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-200 ${
        isNext ? "scale-95 opacity-60 -z-10" : "z-10"
      }`}
      style={{
        background: venue.interiorImage
          ? `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%), url(${venue.interiorImage}) center/cover no-repeat`
          : "linear-gradient(135deg, #18181b 0%, #0a0a12 100%)",
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Venue type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-pink-600/90 text-white text-xs font-black uppercase tracking-widest">
            {venue.venueType ?? "Live Venue"}
          </span>
          {card.status === "OPEN" && (
            <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold">
              Open Slot
            </span>
          )}
        </div>

        {/* Venue name */}
        <h2 className="text-3xl font-black text-white leading-tight mb-1">
          {venue.name}
        </h2>

        {/* Location */}
        <div className="flex items-center gap-1 text-zinc-400 text-sm mb-4">
          <MapPin className="w-3.5 h-3.5 text-pink-400" />
          <span>{venue.address ?? "Location TBD"}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-black/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 text-center">
            <Calendar className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <div className="text-white font-bold text-xs">{dateStr}</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 text-center">
            <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-white font-bold text-sm">
              {card.budget ? `$${card.budget}` : "Negotiable"}
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-white font-bold text-sm">
              {venue.capacity ? `${venue.capacity} cap` : "Open"}
            </div>
          </div>
        </div>

        {/* Genres */}
        {card.genres && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {card.genres
              .split(",")
              .slice(0, 4)
              .map((g: string) => (
                <span
                  key={g.trim()}
                  className="px-2 py-0.5 rounded-full bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs"
                >
                  {g.trim()}
                </span>
              ))}
          </div>
        )}

        {/* Time */}
        {card.startTime && (
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>
              {card.startTime}
              {card.endTime ? ` – ${card.endTime}` : ""}
              {card.setLength ? ` (${card.setLength} min set)` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Band Card (Venues see these)
// ─────────────────────────────────────────────────────────────────────────────

function BandCard({ card, isNext }: { card: Card; isNext?: boolean }) {
  const name = card.user?.name ?? "Unknown Artist";
  const firstTrack = card.tracks?.[0];

  return (
    <div
      className={`absolute inset-0 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-200 ${
        isNext ? "scale-95 opacity-60 -z-10" : "z-10"
      }`}
      style={{
        background: card.headerImage
          ? `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%), url(${card.headerImage}) center/cover no-repeat`
          : "linear-gradient(135deg, #18181b 0%, #0a0a12 100%)",
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Genre badge */}
        <div className="flex items-center gap-2 mb-4">
          {card.primaryGenre && (
            <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-black uppercase tracking-widest">
              {card.primaryGenre}
            </span>
          )}
          {card.coverOrOriginal && (
            <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold">
              {card.coverOrOriginal}
            </span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-3xl font-black text-white leading-tight mb-1">{name}</h2>

        {/* Location */}
        <div className="flex items-center gap-1 text-zinc-400 text-sm mb-4">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>{card.location ?? "Location unknown"}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-black/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 text-center">
            <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-white font-bold text-xs">
              {card.minimumGuarantee ? `$${card.minimumGuarantee}` : "Flexible"}
            </div>
            <div className="text-zinc-500 text-[10px]">Min Pay</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-pink-400 mx-auto mb-1" />
            <div className="text-white font-bold text-sm">
              {card.expectedDraw ?? "?"}
            </div>
            <div className="text-zinc-500 text-[10px]">Draw</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 text-center">
            <Music2 className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-white font-bold text-xs">
              {card.yearsPerforming ? `${card.yearsPerforming}yr` : "–"}
            </div>
            <div className="text-zinc-500 text-[10px]">Exp</div>
          </div>
        </div>

        {/* Track preview */}
        {firstTrack && (
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-zinc-700/40 rounded-xl p-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">{firstTrack.title}</div>
              <div className="text-zinc-500 text-[10px]">Sample track</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-6xl mb-6">🎸</div>
      <h3 className="text-2xl font-black text-white mb-2">You&apos;ve seen it all</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        {role === "BAND"
          ? "No more open slots in your area right now. Check back soon or expand your radius."
          : "No more bands match your criteria. Try adjusting your search."}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Swipe Deck Component
// ─────────────────────────────────────────────────────────────────────────────

interface SwipeDeckProps {
  initialCards: Card[];
  role: "BAND" | "VENUE";
  radiusMiles?: number;
}

export function SwipeDeck({ initialCards, role, radiusMiles = 100 }: SwipeDeckProps) {
  const [matchData, setMatchData] = useState<DraftContract | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const handleMatch = (matchId: string, contractJson: string) => {
    try {
      const parsed = JSON.parse(contractJson) as DraftContract;
      setMatchData(parsed);
    } catch {
      setMatchData({ matchId, bandName: "Band", venueName: "Venue", date: new Date().toISOString(), agreedPay: null, setLength: null, startTime: null, endTime: null, bandEmail: "", venueEmail: null, venueAddress: "", generatedAt: new Date().toISOString() });
    }
  };

  const handleRefill = async (): Promise<Card[]> => {
    const result = await getDiscoveryFeed(radiusMiles, nextCursor ?? undefined);
    if ("cards" in result) {
      setNextCursor(result.nextCursor ?? null);
      return result.cards;
    }
    return [];
  };

  const { currentCard, nextCard, swipeLeft, swipeRight, isSwiping, remaining } =
    useCardDeck(initialCards, { onMatch: handleMatch, onRefillNeeded: handleRefill });

  const doLeft = () => {
    if (!currentCard) return;
    const slotId = currentCard.id ?? currentCard._activeSlotId;
    const bandId = role === "BAND" ? undefined : currentCard.id;
    // For BAND: slotId=card.id, bandId comes from session (server-side in action)
    // For VENUE: bandId=card.id, slotId from card._activeSlotId
    swipeLeft(
      role === "BAND" ? currentCard.id : (currentCard._activeSlotId ?? ""),
      role === "VENUE" ? currentCard.id : ""
    );
  };

  const doRight = () => {
    if (!currentCard) return;
    swipeRight(
      role === "BAND" ? currentCard.id : (currentCard._activeSlotId ?? ""),
      role === "VENUE" ? currentCard.id : ""
    );
  };

  return (
    <>
      {matchData && (
        <MatchOverlay contract={matchData} onClose={() => setMatchData(null)} />
      )}

      <div className="flex flex-col items-center justify-center h-full select-none">
        {/* Card count */}
        <div className="mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-pink-400" />
          <span className="text-zinc-400 text-sm font-medium">
            {remaining > 0 ? `${remaining} cards in your queue` : "Queue empty"}
          </span>
        </div>

        {/* Card stack */}
        <div className="relative w-full max-w-sm h-[520px] mx-auto">
          {!currentCard ? (
            <EmptyState role={role} />
          ) : (
            <>
              {nextCard &&
                (role === "BAND" ? (
                  <SlotCard card={nextCard} isNext />
                ) : (
                  <BandCard card={nextCard} isNext />
                ))}
              {role === "BAND" ? (
                <SlotCard card={currentCard} />
              ) : (
                <BandCard card={currentCard} />
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        {currentCard && (
          <div className="flex items-center gap-6 mt-8">
            {/* Pass */}
            <button
              onClick={doLeft}
              disabled={isSwiping}
              className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-red-500 hover:bg-red-950/30 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-red-900/30 active:scale-90 disabled:opacity-50"
            >
              <X className="w-7 h-7 text-zinc-400 hover:text-red-400" />
            </button>

            {/* Like */}
            <button
              onClick={doRight}
              disabled={isSwiping}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 flex items-center justify-center transition-all duration-200 shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] active:scale-90 disabled:opacity-50"
            >
              <Check className="w-9 h-9 text-white stroke-[3px]" />
            </button>

            {/* Skip (same as pass but labeled) */}
            <button
              onClick={doLeft}
              disabled={isSwiping}
              className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-amber-500 hover:bg-amber-950/30 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-amber-900/30 active:scale-90 disabled:opacity-50"
            >
              <Music2 className="w-6 h-6 text-zinc-400 hover:text-amber-400" />
            </button>
          </div>
        )}

        {/* Hint text */}
        {currentCard && (
          <p className="text-zinc-600 text-xs mt-4 text-center">
            ← Pass &nbsp;|&nbsp; Book It →
          </p>
        )}
      </div>
    </>
  );
}
