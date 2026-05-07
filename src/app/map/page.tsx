"use client";

import dynamic from "next/dynamic";
import { Info, Map as MapIcon, Search, Zap, Loader2, Music, Building2, Users, Mic2, Guitar, Speaker, TrendingUp, Route, Navigation, Globe, Activity, Mail, User, MapPin, ChevronRight, X, Send } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const TouringMap = dynamic(() => import("@/components/TouringMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse rounded-3xl flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
  </div>
});

function Counter({ value, label, color }: { value: number, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-1 border-r border-zinc-800 last:border-r-0">
      <motion.span 
        key={value} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className={`text-xl font-black ${color} tabular-nums`}
      >
        {value.toLocaleString()}
      </motion.span>
      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function MapPage() {
  const [venues, setVenues] = useState([]);
  const [bands, setBands] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(50);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [routeNodes, setRouteNodes] = useState<any[]>([]);
  const [showSignup, setShowSignup] = useState(false); // DISABLED POPUP
  const [activeTab, setActiveTab] = useState<"INFO" | "BOOKING">("INFO");

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const fetchData = async () => {
    try {
      const res = await fetch("/api/map/data");
      const data = await res.json();
      if (data.venues) setVenues(data.venues);
      if (data.bands) setBands(data.bands);
      if (data.resources) setResources(data.resources);
    } catch (error) {
      console.error("Error fetching map data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectVenue = (venue: any) => {
    setSelectedVenue(venue);
    if (!routeNodes.find(n => n.id === venue.id)) {
      setRouteNodes(prev => [...prev, venue]);
    }
  };

  const totalIntel = venues.length + bands.length + resources.length;
  const showCounter = isLocal || totalIntel > 5000;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-zinc-950 font-sans relative">
      {/* Sidebar */}
      <aside className="w-full md:w-96 border-r border-zinc-800 p-6 space-y-8 overflow-y-auto custom-scrollbar bg-zinc-950/50 backdrop-blur-xl relative z-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black mb-1 flex items-center gap-2 tracking-tighter text-white">
              <Music className="text-pink-500" /> THE CIRCUIT
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">National Booking Network</p>
          </div>
          {isLocal && (
            <button 
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-xl transition-all ${showStats ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'bg-zinc-900 text-zinc-400'}`}
            >
              <TrendingUp className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedVenue ? (
            <motion.div key="selected" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {/* Tab Switcher (Local Only) */}
              {isLocal && (
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button 
                    onClick={() => setActiveTab("INFO")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'INFO' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => setActiveTab("BOOKING")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'BOOKING' ? 'bg-pink-600 text-white' : 'text-zinc-500'}`}
                  >
                    Booking
                  </button>
                </div>
              )}

              {activeTab === "INFO" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                  <div className="glass p-5 rounded-2xl border-2 border-pink-500/30 bg-pink-500/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white leading-tight uppercase truncate">{selectedVenue.name}</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{selectedVenue.address}</p>
                      </div>
                      <button onClick={() => setSelectedVenue(null)} className="p-2 bg-zinc-900 rounded-lg text-zinc-500"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="text-xs text-zinc-400 italic mb-4 leading-relaxed">
                      {selectedVenue.bookingHistory}
                    </div>
                  </div>
                  
                  {isLocal && selectedVenue.phone && (
                    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Direct Line</p>
                      <p className="text-sm font-bold text-white">{selectedVenue.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* LOCALHOST ONLY: BOOKING SUITE */
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="glass p-5 rounded-2xl border border-pink-500/30 bg-zinc-900">
                    <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Send className="w-3 h-3" /> Booking Generator
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase ml-2">Recipient</label>
                        <div className="p-3 bg-zinc-950 rounded-xl text-xs text-white border border-zinc-800 truncate">
                          {selectedVenue.bookingEmail || "No email found"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase ml-2">Message Draft</label>
                        <textarea 
                          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:ring-1 focus:ring-pink-500 outline-none"
                          defaultValue={`Hi ${selectedVenue.contactName || "Booking Manager"},\n\nI'm looking to book a show at ${selectedVenue.name} in late 2025. We noticed you have some availability and love your focus on ${selectedVenue.bookingHistory?.split('.')[0]}.\n\nBest,\n[Your Name]`}
                        />
                      </div>
                      <button className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-[10px] rounded-xl transition-all shadow-lg shadow-pink-600/20">
                        Send Booking Request
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="p-5 bg-pink-600/10 rounded-2xl border border-pink-500/20 text-[10px] text-pink-400 font-medium flex flex-col gap-3">
                <p className="flex items-center gap-2 font-black uppercase tracking-widest text-white"><Zap className="w-3 h-3 text-pink-500" /> SYNCING THE NATION</p>
                <p className="text-zinc-400">The Circuit is currently ingesting 10,000+ venues and artists. Explore the live grid below.</p>
                <Link href="/contact" className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 font-black uppercase text-center transition-all">
                  Contact Support
                </Link>
              </div>
              
              {/* Route List Preview */}
              {routeNodes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Your Tour Route</h4>
                  {routeNodes.map(node => (
                    <div key={node.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center group">
                      <span className="text-[10px] font-bold text-zinc-300 uppercase">{node.name}</span>
                      <button onClick={() => setRouteNodes(routeNodes.filter(n => n.id !== node.id))} className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Map Main */}
      <main className="flex-1 relative overflow-hidden z-10">
        {/* Conditional Circuit Pulse Counter */}
        {showCounter && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass flex items-center bg-black/60 backdrop-blur-2xl border border-zinc-800 rounded-2xl px-6 py-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto">
              <div className="flex items-center gap-3 pr-6 border-r border-zinc-800">
                <div className="p-2 bg-pink-500 rounded-lg shadow-lg shadow-pink-500/40">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{totalIntel.toLocaleString()}</span>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Circuit Pulse</span>
                </div>
              </div>
              <div className="flex items-center">
                <Counter value={venues.length} label="Venues" color="text-pink-500" />
                <Counter value={bands.length} label="Artists" color="text-indigo-400" />
                <Counter value={resources.length} label="Hubs" color="text-emerald-400" />
              </div>
            </motion.div>
          </div>
        )}

        <TouringMap venues={venues} bands={bands} resources={resources} routeNodes={routeNodes} onSelectVenue={handleSelectVenue} isProduction={!isLocal} />
      </main>
    </div>
  );
}
