"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, DollarSign, ShieldCheck, ChevronRight, Search, Filter, Loader2, Globe, ExternalLink, Mic2 } from "lucide-react";
import Link from "next/link";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (state) params.set("state", state);
    fetch(`/api/venues/list?${params}`)
      .then(r => r.json())
      .then(data => { setVenues(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedSearch, state]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Header */}
      <section className="relative border-b border-zinc-800/60 py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center space-y-4 relative z-10">
          <span className="text-[10px] font-black tracking-[0.3em] text-pink-500 uppercase">The Circuit</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">Venue Directory</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            {venues.length > 0 ? `${venues.length} live venues` : "Loading the network..."} — click any venue to view its full Spotlight profile.
          </p>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto pt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl pl-11 pr-8 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none backdrop-blur-sm min-w-[140px]"
              >
                <option value="">All States</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-32 text-zinc-500">
            <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold">No venues found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {venues.map((venue, i) => (
                <VenueCard key={venue.id} venue={venue} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

function VenueCard({ venue, index }: { venue: any; index: number }) {
  const hasCoords = venue.latitude && venue.longitude;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="group bg-[#12121a]/80 backdrop-blur-sm border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-pink-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.08)] flex flex-col"
    >
      {/* Color accent stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-600 via-fuchsia-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-white group-hover:text-pink-400 transition-colors leading-tight truncate">
              {venue.name}
            </h3>
            {venue.address && (
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                {venue.address}
              </div>
            )}
          </div>
          {hasCoords && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0 mt-1.5" title="On the map" />
          )}
        </div>

        {venue.bookingHistory && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{venue.bookingHistory}</p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
          {venue.phone && (
            <div className="space-y-0.5">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> Phone</div>
              <div className="text-xs text-zinc-300 font-medium truncate">{venue.phone}</div>
            </div>
          )}
          {venue.bookingEmail && (
            <div className="space-y-0.5">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> Booking</div>
              <div className="text-xs text-zinc-300 font-medium truncate">{venue.bookingEmail}</div>
            </div>
          )}
          {venue.averagePay && (
            <div className="space-y-0.5">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" /> Avg Pay</div>
              <div className="text-xs text-emerald-400 font-bold">{venue.averagePay}</div>
            </div>
          )}
          {venue.ageRequirement && (
            <div className="space-y-0.5">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Age</div>
              <div className="text-xs text-zinc-300 font-medium">{venue.ageRequirement}</div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-5 flex gap-2">
        <Link
          href={`/profiles/${venue.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pink-600/10 hover:bg-pink-600 border border-pink-500/30 hover:border-pink-500 rounded-xl text-xs font-black text-pink-400 hover:text-white transition-all"
        >
          VIEW SPOTLIGHT <ExternalLink className="w-3 h-3" />
        </Link>
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
