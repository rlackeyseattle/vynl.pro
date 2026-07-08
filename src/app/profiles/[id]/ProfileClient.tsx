"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { StreamingPlayer } from "@/components/StreamingPlayer";
import {
  Play, Camera, Send, Globe, Calendar, Radio, MapPin,
  Mail, Phone, Users, Loader2, X, PenTool, ShieldCheck,
  Music, Disc, ExternalLink, Clock, Building, Zap,
  DollarSign, FileText, Star, CheckCircle2, AlertCircle
} from "lucide-react";

interface ProfileClientProps {
  type: "BAND" | "VENUE";
  data: any;
}

// Streaming platform icons as inline SVGs
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.17 3.34.428 2.004.958 1.04 1.88.475 3.208a4.98 4.98 0 00-.35 1.49c-.06.5-.063 1-.076 1.5v12.6c0 .7.05 1.4.2 2.09.3 1.4 1.03 2.48 2.14 3.22.56.37 1.19.59 1.85.7.57.1 1.15.14 1.73.15h12c.7-.01 1.4-.06 2.08-.2 1.36-.28 2.42-.99 3.17-2.15.51-.82.7-1.73.74-2.69.01-.14.02-.29.02-.43V6.36c0-.08-.01-.15-.01-.22zm-5.9 2.2l-4.99 8.61a2.99 2.99 0 01-4.04 1.12 3.01 3.01 0 01-1.12-4.05l.01-.01 4.99-8.62a3 3 0 014.05-1.12 3 3 0 011.12 4.05l-.02.02z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.882.51 9.387.51 9.387.51s7.505 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SoundCloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M1.175 12.225c-.015 0-.023.009-.023.024 0 .014.009.023.023.023.015 0 .023-.009.023-.023 0-.015-.008-.024-.023-.024zm-.449.396c-.022 0-.034.012-.034.033 0 .022.012.033.034.033.022 0 .033-.011.033-.033 0-.021-.011-.033-.033-.033zm-.661.396c-.027 0-.041.014-.041.041 0 .027.014.041.041.041.027 0 .041-.014.041-.041 0-.027-.014-.041-.041-.041zM0 14.21c0 .118.095.213.213.213H2.21v-1.638H.213A.213.213 0 0 0 0 13V14.21zm22.857-5.396a2.573 2.573 0 0 0-2.572 2.197 2.573 2.573 0 0 0-5.134.376v3.4h7.706a2.573 2.573 0 0 0 0-5.973z"/>
  </svg>
);

const TidalIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004zM8.008 16.004l4.004-4.004 4.004 4.004 4.004-4.004-4.004-4.004-4.004 4.004-4.004-4.004-4.004 4.004z"/>
  </svg>
);

const BandcampIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M0 18.75l7.437-13.5H24l-7.438 13.5z"/>
  </svg>
);

export default function ProfileClient({ type, data }: ProfileClientProps) {
  const { data: session } = useSession();
  const isBand = type === "BAND";

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDraft, setBookingDraft] = useState({ dates: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isOwner = session?.user && (session.user as any).id === data.userId;

  const handleSendBooking = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: data.id,
          dates: bookingDraft.dates,
          message: bookingDraft.message,
        }),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setSent(false);
          setBookingDraft({ dates: "", message: "" });
        }, 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const name = isBand ? (data.user?.name || data.name || "UNNAMED ARTIST") : (data.name || "UNNAMED VENUE");
  const bio = data.bio || data.user?.bio || data.bookingHistory || "No artist statement available yet.";
  const location = data.location || data.address || "Unknown Location";

  const headerBgImage = isBand
    ? data.headerImage || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop"
    : data.exteriorImage || "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop";

  // Build streaming platform links for header
  const streamingLinks = [
    { id: "spotify", label: "Spotify", url: data.spotifyUrl, icon: <SpotifyIcon />, color: "text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40" },
    { id: "apple", label: "Apple Music", url: data.appleMusicUrl, icon: <AppleMusicIcon />, color: "text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/40" },
    { id: "youtube", label: "YouTube", url: data.youtubeUrl, icon: <YoutubeIcon />, color: "text-red-400 hover:bg-red-500/20 hover:border-red-500/40" },
    { id: "soundcloud", label: "SoundCloud", url: data.soundcloudUrl, icon: <SoundCloudIcon />, color: "text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40" },
    { id: "tidal", label: "Tidal", url: data.tidalUrl, icon: <TidalIcon />, color: "text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40" },
    { id: "bandcamp", label: "Bandcamp", url: data.bandcampUrl, icon: <BandcampIcon />, color: "text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40" },
  ].filter((l) => !!l.url);

  // Parse target dates from booking campaigns if available
  const targetDates: string[] = (() => {
    try {
      if (data.targetDates) return JSON.parse(data.targetDates);
    } catch {}
    return [];
  })();

  // Parse open venue slots
  const slots: any[] = data.slots || [];

  return (
    <div className="bg-zinc-950 min-h-screen relative overflow-x-hidden">
      {/* Background dimmer for custom band backgrounds */}
      {isBand && data.backgroundImage && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${data.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-zinc-950/88 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Owner Edit Button */}
      {isOwner && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-5 py-3.5 bg-[#c5a059]/10 border border-[#c5a059]/30 hover:bg-[#c5a059]/20 text-[#c5a059] rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)] hover:scale-105 active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5" /> Edit Profile
          </Link>
        </div>
      )}

      {/* Header Parallax */}
      <ParallaxBackground imageUrl={headerBgImage} speed={0.2}>
        <div className="text-center space-y-4 max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 mb-5">
              <span className="text-[#c5a059] font-black tracking-[0.3em] text-[9px] uppercase">
                {isBand ? "Official Artist EPK" : "Venue Profile"}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-none break-words">
              {name}
            </h1>

            {/* Genre tags */}
            <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
              {isBand ? (
                <>
                  {data.genre && (
                    <span className="px-4 py-1.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 rounded-full font-black text-[10px] tracking-wider uppercase">
                      {data.genre}
                    </span>
                  )}
                  {data.coverOrOriginal && (
                    <span className="px-4 py-1.5 bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 rounded-full font-black text-[10px] tracking-wider uppercase">
                      {data.coverOrOriginal}
                    </span>
                  )}
                  {data.isSigned && (
                    <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> SIGNED
                    </span>
                  )}
                  {data.isTouring && (
                    <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3" /> CURRENTLY TOURING
                    </span>
                  )}
                </>
              ) : (
                <>
                  {data.venueType && (
                    <span className="px-4 py-1.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 rounded-full font-black text-[10px] tracking-wider uppercase">
                      {data.venueType}
                    </span>
                  )}
                  {data.genres
                    ? data.genres
                        .split(",")
                        .slice(0, 4)
                        .map((g: string) => (
                          <span
                            key={g}
                            className="px-3 py-1.5 bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 rounded-full font-black text-[10px] tracking-wider uppercase"
                          >
                            {g.trim()}
                          </span>
                        ))
                    : null}
                  {data.ageRequirement && (
                    <span className="px-4 py-1.5 bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 rounded-full font-black text-[10px] tracking-wider uppercase">
                      {data.ageRequirement}
                    </span>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Header action bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-3 pt-10 flex-wrap relative z-10"
          >
            {/* Location pill */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/60 backdrop-blur rounded-full border border-zinc-700/40 font-bold text-xs text-zinc-400">
              <MapPin size={12} className="text-[#c5a059]" /> {location}
            </div>

            {/* Booking email */}
            {(data.bookingEmail || data.contactEmail) && (
              <a
                href={`mailto:${data.bookingEmail || data.contactEmail}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/60 backdrop-blur rounded-full border border-zinc-700/40 hover:border-[#c5a059]/50 hover:bg-[#c5a059]/10 font-bold text-xs text-zinc-300 hover:text-[#c5a059] transition-all"
              >
                <Mail size={12} /> {data.bookingEmail || data.contactEmail}
              </a>
            )}

            {/* Website */}
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/60 backdrop-blur rounded-full border border-zinc-700/40 hover:border-zinc-500/60 font-bold text-xs text-zinc-400 hover:text-white transition-all"
              >
                <Globe size={12} /> Website
              </a>
            )}

            {/* Venue RSS */}
            {!isBand && (
              <a
                href={`/api/venues/${data.id}/rss`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/60 backdrop-blur rounded-full border border-zinc-700/40 hover:border-zinc-500/60 font-bold text-xs text-zinc-400 hover:text-white transition-all"
              >
                <Radio size={12} className="animate-pulse" /> RSS Feed
              </a>
            )}

            {/* Streaming platform icons */}
            {isBand &&
              streamingLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  className={`w-10 h-10 rounded-full bg-zinc-950/60 backdrop-blur border border-zinc-700/40 flex items-center justify-center transition-all hover:scale-110 ${link.color}`}
                >
                  {link.icon}
                </a>
              ))}
          </motion.div>
        </div>
      </ParallaxBackground>

      {/* Main Grid */}
      <section className="container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">

        {/* Left Column — Media / Bio / Specs */}
        <div className="lg:col-span-7 space-y-14">

          {/* Streaming Player — Band only */}
          {isBand && (
            <div className="space-y-5">
              <SectionHeader icon={<Radio className="text-[#c5a059]" />} title="STREAMS & MEDIA" />
              <StreamingPlayer
                spotifyUrl={data.spotifyUrl}
                youtubeUrl={data.youtubeUrl}
                soundcloudUrl={data.soundcloudUrl}
                appleMusicUrl={data.appleMusicUrl}
                tidalUrl={data.tidalUrl}
                bandcampUrl={data.bandcampUrl}
              />
            </div>
          )}

          {/* Artist Statement / Venue Vision */}
          <div className="space-y-5">
            <SectionHeader
              icon={<FileText className="text-[#c5a059]" />}
              title={isBand ? "ARTIST STATEMENT" : "VENUE STORY"}
            />
            <p className="text-base text-zinc-400 leading-relaxed font-medium whitespace-pre-line">
              {bio}
            </p>
          </div>

          {/* Technical Rider — Band only */}
          {isBand && data.bandRider && (
            <div className="space-y-5">
              <SectionHeader icon={<Zap className="text-[#c5a059]" />} title="STAGE PLOT & TECHNICAL RIDER" />
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl font-mono text-xs text-zinc-400 whitespace-pre-line leading-relaxed max-h-[350px] overflow-y-auto">
                {data.bandRider}
              </div>
            </div>
          )}

          {/* Venue Open Booking Calendar */}
          {!isBand && (
            <div className="space-y-5">
              <SectionHeader icon={<Calendar className="text-emerald-400" />} title="OPEN BOOKING CALENDAR" />
              {slots.length > 0 ? (
                <div className="space-y-3">
                  {slots.slice(0, 8).map((slot: any) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl hover:border-[#c5a059]/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">
                            {new Date(slot.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                            {slot.startTime && `${slot.startTime}${slot.endTime ? ` – ${slot.endTime}` : ""}`}
                            {slot.genres && ` · ${slot.genres}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {slot.budget && (
                          <div className="text-sm font-black text-emerald-400">
                            ${slot.budget.toLocaleString()}
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                          {slot.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  {slots.length > 8 && (
                    <p className="text-center text-xs text-zinc-500 pt-2">
                      +{slots.length - 8} more open slots — contact to book
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-zinc-900/40 border border-zinc-800/40 rounded-2xl text-center">
                  {data.openDates ? (
                    <p className="text-sm text-zinc-400">{data.openDates}</p>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No open slots posted yet — contact directly to inquire.
                    </p>
                  )}
                </div>
              )}
              {(data.targetBookingNights || data.bookingDays) && (
                <div className="p-4 bg-zinc-900/40 border border-zinc-800/40 rounded-xl flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#c5a059] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                      Regular Booking Nights
                    </div>
                    <p className="text-sm text-zinc-300">
                      {data.targetBookingNights || data.bookingDays}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Venue Artist Criteria */}
          {!isBand && data.targetBandsDescription && (
            <div className="space-y-5">
              <SectionHeader icon={<Users className="text-[#c5a059]" />} title="ARTISTS WE BOOK" />
              <p className="text-base text-zinc-400 leading-relaxed">{data.targetBandsDescription}</p>
            </div>
          )}
        </div>

        {/* Right Column — Stats / Logistics / Gallery / CTA */}
        <div className="lg:col-span-5 space-y-8">

          {/* EPK / Booking Stats Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-3xl p-7 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="text-[#c5a059] w-5 h-5" />
              {isBand ? "EPK CREDENTIALS" : "BOOKING DETAILS"}
            </h3>

            {isBand ? (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Min Guarantee" value={data.minimumGuarantee ? `$${data.minimumGuarantee.toLocaleString()}` : "Open"} sub="Per show floor" gold />
                <StatCard label="Expected Draw" value={data.expectedDraw ? `${data.expectedDraw}+` : "TBD"} sub="Avg crowd" />
                <StatCard label="Tour Status" value={data.isTouring ? "ON TOUR" : "REGIONAL"} sub="Routing" />
                <StatCard label="Reach" value={data.isNational ? "NATIONAL" : "REGIONAL"} sub="Geographic" />
                <StatCard label="PA System" value={data.providesPA ? "ARTIST OWN" : "VENUE REQ'D"} sub="Equipment" />
                <StatCard label="Sound Tech" value={data.hasSoundGuy ? "PROVIDED" : "VENUE" } sub="Engineer" />
                <StatCard label="Presales" value={data.handlesPresales ? "YES" : "NO"} sub="Ticket handling" />
                <StatCard
                  label="Representation"
                  value={data.hasRepresentation ? "MANAGED" : "DIRECT"}
                  sub={data.representationDetails || "Booking contact"}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Venue Type" value={data.venueType || "BAR"} sub="Atmosphere" />
                <StatCard label="Capacity" value={data.capacity ? `${data.capacity}` : "TBD"} sub="Fire code limit" />
                <StatCard label="Avg Payout" value={data.averagePay || "TBD"} sub="Per engagement" gold />
                <StatCard label="Pay Model" value={data.payType || "GUARANTEE"} sub="Deal structure" />
                <StatCard label="Age Policy" value={data.ageRequirement || "21+"} sub="Door requirement" />
                <StatCard label="Booking Days" value={data.bookingDays || "Contact"} sub="Active nights" />
                {data.capacity && (
                  <StatCard label="Draw Floor" value={data.defaultBudget ? `$${data.defaultBudget}` : "TBD"} sub="Default budget" />
                )}
                <StatCard label="Claim Status" value={data.claimed ? "CLAIMED ✓" : "UNCLAIMED"} sub="Venue verified" />
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full mt-2 py-4 bg-[#c5a059] hover:bg-[#d4b06a] active:scale-98 transition-all rounded-2xl font-black text-sm text-zinc-950 shadow-[0_0_30px_rgba(197,160,89,0.25)] hover:shadow-[0_0_40px_rgba(197,160,89,0.35)] uppercase tracking-wider"
            >
              {isBand ? "SUBMIT BOOKING PROPOSAL" : "ENQUIRE ABOUT SLOT"}
            </button>
          </div>

          {/* Contact Block */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-3xl p-7 space-y-5">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Send className="text-emerald-400 w-4 h-4" /> CONTACT DIRECTORY
            </h3>
            <div className="space-y-3">
              <DetailItem
                label="Booking Contact"
                value={data.contactName || (isBand ? "Artist Management" : "Venue Booking")}
              />
              {(data.contactEmail || data.bookingEmail) && (
                <DetailItem
                  label="Email"
                  value={data.contactEmail || data.bookingEmail}
                  icon={<Mail className="w-4 h-4 text-emerald-400" />}
                  href={`mailto:${data.contactEmail || data.bookingEmail}`}
                />
              )}
              {(data.contactPhone || data.phone) && (
                <DetailItem
                  label="Phone"
                  value={data.contactPhone || data.phone}
                  icon={<Phone className="w-4 h-4 text-emerald-400" />}
                  href={`tel:${data.contactPhone || data.phone}`}
                />
              )}
              {data.website && (
                <DetailItem
                  label="Website"
                  value={new URL(data.website).hostname}
                  icon={<Globe className="w-4 h-4 text-[#c5a059]" />}
                  href={data.website}
                />
              )}
            </div>
          </div>

          {/* Artist target dates — Band only */}
          {isBand && targetDates.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-3xl p-7 space-y-5">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                <Calendar className="text-[#c5a059] w-4 h-4" /> ROUTING / TARGET DATES
              </h3>
              <div className="space-y-2">
                {targetDates.map((date: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#c5a059]" />
                    <span className="text-sm text-zinc-300 font-medium">{date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-3xl p-7 space-y-5">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Camera className="text-fuchsia-400 w-4 h-4" /> GALLERY
            </h3>
            <div className={`grid gap-3 ${isBand ? "grid-cols-2" : "grid-cols-3"}`}>
              {isBand ? (
                <>
                  <GallerySlot
                    src={data.profileImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800"}
                    label="ARTIST"
                  />
                  <GallerySlot
                    src={data.backgroundImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800"}
                    label="STAGE"
                  />
                </>
              ) : (
                <>
                  <GallerySlot
                    src={data.interiorImage || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600"}
                    label="INTERIOR"
                  />
                  <GallerySlot
                    src={data.exteriorImage || "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=600"}
                    label="EXTERIOR"
                  />
                  <GallerySlot
                    src={data.stageImage || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600"}
                    label="STAGE"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <ParallaxBackground
        imageUrl={
          isBand
            ? "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop"
            : data.interiorImage || "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop"
        }
        speed={0.3}
      >
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase">
            {isBand ? "READY TO TOUR?" : "THE STAGE IS SET."}
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            {isBand
              ? "Submit a booking proposal to connect this artist with matching venue slots."
              : "Post your open dates and let Vynl Pro match you with the right artists automatically."}
          </p>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-12 py-4 bg-[#c5a059] hover:bg-[#d4b06a] rounded-full font-black text-base text-zinc-950 hover:scale-105 transition-all shadow-2xl shadow-[#c5a059]/30 uppercase tracking-wider"
          >
            {isBand ? `BOOK ${name.toUpperCase()}` : "SUBMIT BOOKING INQUIRY"}
          </button>
        </div>
      </ParallaxBackground>

      {/* Booking Proposal Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative"
          >
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {sent ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase">Proposal Sent!</h2>
                <p className="text-zinc-400 text-sm">Your booking inquiry has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 mb-3">
                    <span className="text-[#c5a059] font-black text-[9px] uppercase tracking-widest">Booking Proposal</span>
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    {isBand ? `Book ${name}` : `Enquire — ${name}`}
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    This inquiry will be sent directly to the {isBand ? "artist's" : "venue"} booking contact.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
                      Target Dates
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. August 15th, or 'Any Friday in September'"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors placeholder-zinc-600"
                      value={bookingDraft.dates}
                      onChange={(e) => setBookingDraft((prev) => ({ ...prev, dates: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
                      Proposal Message
                    </label>
                    <textarea
                      placeholder={`Hi ${data.contactName || "Booking Team"}, we'd love to discuss a show at ${name}...`}
                      className="w-full h-36 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors resize-none placeholder-zinc-600"
                      value={bookingDraft.message}
                      onChange={(e) => setBookingDraft((prev) => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSendBooking}
                      disabled={isSending || !bookingDraft.message || !bookingDraft.dates}
                      className="flex-1 py-3.5 bg-[#c5a059] hover:bg-[#d4b06a] disabled:opacity-40 text-zinc-950 font-black text-sm uppercase rounded-xl transition-all flex justify-center items-center gap-2"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "SEND PROPOSAL"}
                    </button>
                    {(data.bookingEmail || data.contactEmail) && (
                      <a
                        href={`mailto:${data.bookingEmail || data.contactEmail}?subject=Booking Inquiry — ${bookingDraft.dates || "Upcoming Dates"}&body=${encodeURIComponent(bookingDraft.message)}`}
                        className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm uppercase rounded-xl transition-all flex justify-center items-center gap-2 no-underline"
                      >
                        <Mail className="w-4 h-4" /> Open in Mail
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-3">
      {icon} {title}
    </h3>
  );
}

function StatCard({
  label,
  value,
  sub,
  gold,
}: {
  label: string;
  value: string;
  sub?: string;
  gold?: boolean;
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/60 p-3.5 rounded-xl flex flex-col justify-between min-h-[70px]">
      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
      <div className={`text-sm font-black mt-1 break-words leading-tight ${gold ? "text-[#c5a059]" : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-[9px] text-zinc-600 mt-1 uppercase font-semibold">{sub}</div>}
    </div>
  );
}

function GallerySlot({ src, label }: { src: string; label: string }) {
  return (
    <div className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800/60 overflow-hidden relative group">
      <img
        src={src}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
      />
      <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded-full text-[9px] font-black text-zinc-300 border border-white/5 uppercase">
        {label}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors group">
      <div>
        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
        <div className="font-bold text-zinc-200 text-sm mt-0.5">{value}</div>
      </div>
      <div className="flex items-center gap-2">
        {icon}
        {href && <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block no-underline" target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}
