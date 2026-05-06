"use client";

import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Play, Camera, Send, Globe, Calendar, ShoppingBag, Radio, MapPin, Mail, Phone, Users, Clock } from "lucide-react";

interface ProfileClientProps {
  type: "BAND" | "VENUE";
  data: any;
}

export default function ProfileClient({ type, data }: ProfileClientProps) {
  const isBand = type === "BAND";
  
  // Default values if data is missing
  const name = data.name || "UNNAMED ARTIST";
  const genre = data.genre || data.venueType || "MUSICIAN";
  const bio = data.bio || data.bookingHistory || "No biography available yet.";
  const location = data.location || data.address || "Unknown Location";
  
  // Sample tracks for bands
  const tracks = [
    { id: "1", title: "CRAWLED TRACK 01", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "2", title: "CRAWLED TRACK 02", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  ];

  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Header Parallax */}
      <ParallaxBackground 
        imageUrl={isBand ? "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop" : "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop"} 
        speed={0.2}
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-pink-500 font-black tracking-[0.3em] text-sm uppercase mb-4">
              {isBand ? "Official EPK" : "Venue Spotlight"}
            </h2>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-glow uppercase leading-none">{name}</h1>
            <p className="text-xl md:text-2xl font-medium tracking-widest mt-4 text-zinc-300 uppercase">{genre}</p>
          </motion.div>
          
          <div className="flex items-center justify-center gap-4 pt-12 flex-wrap">
            {data.website && <SocialIcon platform="website" href={data.website} />}
            {data.bookingEmail && (
              <a href={`mailto:${data.bookingEmail}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/5 hover:bg-pink-600 transition-all font-bold text-xs">
                <Mail size={14} /> {data.bookingEmail}
              </a>
            )}
            <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/5 font-bold text-xs text-zinc-400">
              <MapPin size={14} className="text-pink-500" /> {location}
            </div>
          </div>
        </div>
      </ParallaxBackground>

      <section className="container mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side: Media & Info */}
        <div className="space-y-12">
          {isBand ? (
            <div className="space-y-6">
              <h3 className="text-4xl font-black flex items-center gap-3">
                <Radio className="text-pink-500" /> LATEST SESSIONS
              </h3>
              <MusicPlayer tracks={tracks} />
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-4xl font-black flex items-center gap-3">
                <Calendar className="text-pink-500" /> BOOKING INTEL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-6 rounded-3xl border border-zinc-800 bg-zinc-900/30">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Availability
                  </div>
                  <div className="text-sm font-bold text-zinc-300 leading-relaxed">
                    {data.openDates || "Contact for dates"}
                  </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-zinc-800 bg-zinc-900/30">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Average Pay
                  </div>
                  <div className="text-lg font-black text-emerald-400">
                    {data.averagePay || "TBD"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-4xl font-black uppercase">
              {isBand ? "Biography" : "Venue Vision"}
            </h3>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium">
              {bio}
            </p>
          </div>
        </div>

        {/* Right Side: Contact & Details */}
        <div className="space-y-12">
          <div className="glass rounded-3xl p-8 border border-zinc-800/50">
            <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
              <Send className="text-indigo-500" /> CONTACT DECK
            </h3>
            <div className="space-y-6">
              <DetailItem label="Contact Name" value={data.contactName || "Booking Agent"} />
              <DetailItem label="Phone" value={data.phone || "N/A"} icon={<Phone className="w-4 h-4 text-pink-500" />} />
              <DetailItem label="Email" value={data.bookingEmail || "N/A"} icon={<Mail className="w-4 h-4 text-pink-500" />} />
              
              {!isBand && (
                <DetailItem label="Age Requirement" value={data.ageRequirement || "21+"} />
              )}
            </div>
            
            <button className="w-full mt-12 py-5 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-2xl font-black text-xl shadow-xl shadow-indigo-600/20">
              {isBand ? "SEND BOOKING REQUEST" : "ENQUIRE ABOUT DATES"}
            </button>
          </div>

          <div className="glass rounded-3xl p-8 border border-zinc-800/50 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Camera className="text-fuchsia-500" /> GALLERY
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform" />
                </div>
                <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8be?q=80&w=1964&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Break */}
      <ParallaxBackground 
        imageUrl={isBand ? "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop" : "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop"} 
        speed={0.3}
      >
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            {isBand ? "NEVER STOP THE NOISE." : "THE STAGE IS YOURS."}
          </h2>
          <button className="px-12 py-5 bg-pink-600 rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-pink-600/30">
             {isBand ? `BOOK ${name}` : "VISIT VENUE"}
          </button>
        </div>
      </ParallaxBackground>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
      <div>
        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
        <div className="font-bold text-zinc-200">{value}</div>
      </div>
      {icon && <div>{icon}</div>}
    </div>
  );
}

function SocialIcon({ platform, href }: { platform: "youtube" | "instagram" | "twitter" | "website", href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 border border-white/5">
      {platform === "youtube" && <Play size={20} />}
      {platform === "instagram" && <Camera size={20} />}
      {platform === "twitter" && <Send size={20} />}
      {platform === "website" && <Globe size={20} />}
    </a>
  );
}
