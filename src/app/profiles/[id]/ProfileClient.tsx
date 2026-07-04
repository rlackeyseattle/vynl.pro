"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { StreamingPlayer } from "@/components/StreamingPlayer";
import { 
  Play, Camera, Send, Globe, Calendar, ShoppingBag, Radio, MapPin, 
  Mail, Phone, Users, Clock, Loader2, X, PenTool, CheckCircle2, ShieldCheck,
  Award, Heart, Compass
} from "lucide-react";

interface ProfileClientProps {
  type: "BAND" | "VENUE";
  data: any;
}

export default function ProfileClient({ type, data }: ProfileClientProps) {
  const { data: session } = useSession();
  const isBand = type === "BAND";
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDraft, setBookingDraft] = useState({ dates: "", message: "" });
  const [isSending, setIsSending] = useState(false);

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
          message: bookingDraft.message
        })
      });
      if (res.ok) {
        alert("Booking request sent successfully!");
        setShowBookingModal(false);
        setBookingDraft({ dates: "", message: "" });
      } else {
        alert("Failed to send booking.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };
  
  // Default values if data is missing
  const name = data.name || "UNNAMED PROFILE";
  const bio = data.bio || data.bookingHistory || "No biography or vision description available yet.";
  const location = data.location || data.address || "Unknown Location";
  
  // Dynamic header background image
  const headerBgImage = isBand 
    ? (data.headerImage || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop") 
    : (data.exteriorImage || "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop");

  return (
    <div 
      className="bg-zinc-950 min-h-screen relative overflow-x-hidden selection:bg-pink-500/20 selection:text-pink-300"
      style={isBand && data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' } : {}}
    >
      {/* Background Dimmer if custom background exists */}
      {isBand && data.backgroundImage && (
        <div className="absolute inset-0 bg-[#07070c]/90 backdrop-blur-[2px] pointer-events-none" />
      )}

      {/* Owner Edit Floating Badge */}
      {isOwner && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 border border-white/10"
          >
            <PenTool className="w-4 h-4" /> Edit Profile / EPK
          </Link>
        </div>
      )}

      {/* Header Parallax */}
      <ParallaxBackground 
        imageUrl={headerBgImage} 
        speed={0.2}
      >
        <div className="text-center space-y-4 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-pink-500 font-black tracking-[0.3em] text-[10px] sm:text-xs uppercase mb-4">
              {isBand ? "Official EPK & Rider" : "Venue Spotlight"}
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-glow uppercase leading-none break-words text-white">
              {name}
            </h1>
            
            {isBand ? (
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span className="px-4 py-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full font-black text-[10px] tracking-wider uppercase">
                  {data.genre || "Musician"}
                </span>
                {data.coverOrOriginal && (
                  <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-black text-[10px] tracking-wider uppercase">
                    {data.coverOrOriginal}
                  </span>
                )}
                {data.isSigned && (
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> SIGNED
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {data.genres ? data.genres.split(",").map((g: string) => (
                  <span key={g} className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 rounded-full font-black text-[10px] tracking-wider uppercase transition-colors">
                    {g.trim()}
                  </span>
                )) : (
                  <span className="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded-full font-black text-[10px] tracking-wider uppercase">
                    {data.venueType || "Live Venue"}
                  </span>
                )}
              </div>
            )}
          </motion.div>
          
          <div className="flex items-center justify-center gap-4 pt-12 flex-wrap relative z-10">
            {data.website && <SocialIcon platform="website" href={data.website} />}
            
            {!isBand && (
              <a 
                href={`/api/venues/${data.id}/rss`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-6 py-3 bg-pink-600/10 text-pink-400 hover:bg-pink-600 hover:text-white rounded-full border border-pink-500/20 hover:border-pink-500 transition-all font-bold text-xs shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] cursor-pointer"
              >
                <Radio size={14} className="animate-pulse" /> SUBSCRIBE TO RSS FEED
              </a>
            )}

            {data.bookingEmail && (
              <a href={`mailto:${data.bookingEmail}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/5 hover:bg-pink-600 transition-all font-bold text-xs text-white no-underline">
                <Mail size={14} /> {data.bookingEmail}
              </a>
            )}
            <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/5 font-bold text-xs text-zinc-400">
              <MapPin size={14} className="text-pink-500" /> {location}
            </div>
          </div>
        </div>
      </ParallaxBackground>

      {/* Main Grid Content */}
      <section className="container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Columns (Size 7): Media / Streams / Bio */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Streaming Player Section */}
          {isBand && (
            <div className="space-y-6">
              <h3 className="text-3xl font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                <Radio className="text-pink-500" /> STREAMS & MEDIA
              </h3>
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

          {/* Biography & Vision */}
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase text-white tracking-tighter">
              {isBand ? "BIOGRAPHY" : "VENUE VISION"}
            </h3>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium whitespace-pre-line">
              {bio}
            </p>
          </div>

          {/* Technical Rider / Specs (Band only) */}
          {isBand && data.bandRider && (
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase text-white tracking-tighter flex items-center gap-3">
                <FileText className="text-pink-500" /> STAGE PLOT & TECHNICAL RIDER
              </h3>
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl font-mono text-xs text-zinc-400 whitespace-pre-line leading-relaxed max-h-[350px] overflow-y-auto custom-scrollbar">
                {data.bandRider}
              </div>
            </div>
          )}

          {/* Target Audience / Wanted Nights (Venue only) */}
          {!isBand && (
            <div className="space-y-8">
              {data.targetBookingNights && (
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <Calendar className="text-pink-500 w-4 h-4" /> Nights targeting
                  </h4>
                  <p className="text-sm text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                    {data.targetBookingNights}
                  </p>
                </div>
              )}
              {data.targetBandsDescription && (
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <Users className="text-indigo-400 w-4 h-4" /> Artists we book
                  </h4>
                  <p className="text-sm text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                    {data.targetBandsDescription}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Columns (Size 5): Gig Logistics & Stats */}
        <div className="lg:col-span-5 space-y-12">
          
          {/* Logistics Grid / EPK Stats */}
          <div className="glass rounded-3xl p-8 border border-zinc-800/60 space-y-8 bg-zinc-950/20">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" /> {isBand ? "EPK LOGISTICS" : "BOOKING DETAILS"}
            </h3>

            {isBand ? (
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Min Guarantee" value={data.minimumGuarantee ? `$${data.minimumGuarantee}` : "TBD"} sub="Per slot guarantee" />
                <StatCard label="Expected Draw" value={data.expectedDraw ? `${data.expectedDraw} head` : "TBD"} sub="Crowd expectations" />
                <StatCard label="Touring Act" value={data.isTouring ? "YES" : "NO"} sub="Routing friendly" />
                <StatCard label="Outreach" value={data.isNational ? "NATIONAL" : "REGIONAL"} sub="Travel parameters" />
                <StatCard label="PA System" value={data.providesPA ? "ARTIST OWN" : "VENUE PROVIDES"} sub="Equipment setups" />
                <StatCard label="Sound Engineer" value={data.hasSoundGuy ? "PROVIDED" : "NO"} sub="Sound technician" />
                <StatCard label="Pre-sale Tickets" value={data.handlesPresales ? "YES" : "NO"} sub="Pre-sale capabilities" />
                <StatCard label="Representation" value={data.hasRepresentation ? "YES" : "NONE"} sub={data.representationDetails || "Direct booking"} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Venue Type" value={data.venueType || "BAR"} sub="Atmosphere type" />
                <StatCard label="Room Capacity" value={data.capacity ? `${data.capacity} head` : "TBD"} sub="Fire code limit" />
                <StatCard label="Avg Compensation" value={data.averagePay || "TBD"} sub="Average pay" />
                <StatCard label="Compensation model" value={data.payType || "FLAT"} sub="Deal structure" />
                <StatCard label="Age Restriction" value={data.ageRequirement || "21+"} sub="Age policy" />
                <StatCard label="Weekly slots" value={data.bookingDays || "Contact"} sub="Active booking days" />
              </div>
            )}

            <button 
              onClick={() => setShowBookingModal(true)}
              className="w-full mt-6 py-5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 transition-all rounded-2xl font-black text-lg text-white shadow-xl shadow-pink-600/10 hover:shadow-pink-600/20 active:scale-95"
            >
              {isBand ? "SEND BOOKING INQUIRY" : "ENQUIRE ABOUT SLOT"}
            </button>
          </div>

          {/* Contact deck */}
          <div className="glass rounded-3xl p-8 border border-zinc-800/60 space-y-6">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Send className="text-emerald-500" /> CONTACT INFO
            </h3>
            <div className="space-y-4">
              <DetailItem label="Primary Contact" value={data.contactName || "Booking Manager"} />
              {data.contactEmail && <DetailItem label="Contact Email" value={data.contactEmail} icon={<Mail className="w-4 h-4 text-emerald-400" />} />}
              {data.contactPhone && <DetailItem label="Contact Phone" value={data.contactPhone} icon={<Phone className="w-4 h-4 text-emerald-400" />} />}
            </div>
          </div>

          {/* Visual Gallery / Photos Grid */}
          <div className="glass rounded-3xl p-8 border border-zinc-800/60 space-y-6">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Camera className="text-fuchsia-500" /> GALLERY & VIEWS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <GallerySlot 
                src={isBand ? (data.profileImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1770&auto=format&fit=crop") : (data.interiorImage || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop")} 
                label={isBand ? "AVATAR" : "INTERIOR"} 
              />
              <GallerySlot 
                src={isBand ? (data.backgroundImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1770&auto=format&fit=crop") : (data.stageImage || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1770&auto=format&fit=crop")} 
                label={isBand ? "STAGE BACKGROUND" : "STAGE AREA"} 
              />
            </div>
          </div>

        </div>
      </section>

      {/* Lower Hero Call-to-action */}
      <ParallaxBackground 
        imageUrl={isBand ? "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop" : (data.interiorImage || "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop")} 
        speed={0.3}
      >
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase">
            {isBand ? "NEVER STOP THE SOUND." : "THE STAGE IS SET."}
          </h2>
          <button 
            onClick={() => setShowBookingModal(true)}
            className="px-12 py-5 bg-pink-600 hover:bg-pink-500 rounded-full font-black text-lg sm:text-xl text-white hover:scale-105 transition-all shadow-2xl shadow-pink-600/30"
          >
             {isBand ? `BOOK ${name.toUpperCase()}` : "INQUIRE TO BOOK"}
          </button>
        </div>
      </ParallaxBackground>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowBookingModal(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              Book {name}
            </h2>
            <p className="text-zinc-400 mb-8">Send a direct inquiry to their booking team.</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase text-zinc-500 block mb-2">Target Dates</label>
                <input 
                  type="text" 
                  placeholder="e.g. November 12th, or 'Any weekend in Fall'"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={bookingDraft.dates}
                  onChange={(e) => setBookingDraft(prev => ({...prev, dates: e.target.value}))}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-zinc-500 block mb-2">Message</label>
                <textarea 
                  placeholder={`Hi ${data.contactName || "Booking"}, we'd love to play at ${name}...`}
                  className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  value={bookingDraft.message}
                  onChange={(e) => setBookingDraft(prev => ({...prev, message: e.target.value}))}
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSendBooking}
                  disabled={isSending || !bookingDraft.message || !bookingDraft.dates}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-sm uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex justify-center items-center gap-2"
                >
                  {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : "SEND INQUIRY"}
                </button>
                {data.bookingEmail && (
                  <a
                    href={`mailto:${data.bookingEmail}?subject=Booking Inquiry for ${bookingDraft.dates || 'Upcoming Dates'}&body=${encodeURIComponent(bookingDraft.message)}`}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2 no-underline text-center justify-center items-center"
                  >
                    Open in Mail App 📧
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between">
      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
      <div className="text-base font-black text-white mt-1 break-words leading-tight">{value}</div>
      {sub && <div className="text-[9px] text-zinc-500 mt-1 uppercase font-semibold">{sub}</div>}
    </div>
  );
}

function GallerySlot({ src, label }: { src: string; label: string }) {
  return (
    <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
      <img 
        src={src} 
        alt={label}
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500" 
      />
      <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-zinc-300 border border-white/5 uppercase">
        {label}
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850">
      <div>
        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
        <div className="font-bold text-zinc-200 text-sm">{value}</div>
      </div>
      {icon && <div>{icon}</div>}
    </div>
  );
}

function SocialIcon({ platform, href }: { platform: "youtube" | "instagram" | "twitter" | "website", href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 border border-white/5">
      {platform === "youtube" && <Play size={20} className="text-white fill-white" />}
      {platform === "instagram" && <Camera size={20} className="text-white" />}
      {platform === "twitter" && <Send size={20} className="text-white" />}
      {platform === "website" && <Globe size={20} className="text-white" />}
    </a>
  );
}
