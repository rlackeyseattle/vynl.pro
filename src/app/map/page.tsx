"use client";

import dynamic from "next/dynamic";
import { Info, Map as MapIcon, Search, Zap, Loader2, Music, Building2, Users, Mic2, Guitar, Speaker, TrendingUp, Route, Navigation, Globe, Activity, Mail, User, MapPin, ChevronRight, X, Send, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

const TouringMap = dynamic(() => import("@/components/TouringMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse rounded-3xl flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
  </div>
});

function AnimatedCounter({ value, label, color, icon: Icon }: { value: number, label: string, color: string, icon?: any }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value]);

  return (
    <div className="flex flex-col items-center px-4 py-1 border-r border-zinc-800/60 last:border-r-0 group">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className={`w-3 h-3 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />}
        <motion.span 
          className={`text-xl font-black ${color} tabular-nums tracking-tighter`}
        >
          {rounded}
        </motion.span>
      </div>
      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function MapPage() {
  const [venues, setVenues] = useState([]);
  const [bands, setBands] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [routeNodes, setRouteNodes] = useState<any[]>([]);
  const [showSignup, setShowSignup] = useState(false); 
  const [signupData, setSignupData] = useState({ name: "", email: "", zip: "", role: "BAND" });
  const [signingUp, setSigningUp] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [activeTab, setActiveTab] = useState<"INFO" | "BOOKING">("INFO");

  // Only show signup overlay to first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem("vynl_circuit_visited");
    if (!seen) {
      setTimeout(() => setShowSignup(true), 1500);
    }
  }, []);

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const fetchData = async () => {
    try {
      const res = await fetch("/api/map/data");
      const data = await res.json();
      if (data.error) {
        setError(data.details || data.error);
      } else {
        if (data.venues) setVenues(data.venues);
        if (data.bands) setBands(data.bands);
        if (data.resources) setResources(data.resources);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
      setError("Network or API Failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningUp(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setSignedUp(true);
        localStorage.setItem("vynl_circuit_visited", "1");
        setTimeout(() => setShowSignup(false), 2000);
      }
    } catch (err) {
      console.error("Signup failed:", err);
    } finally {
      setSigningUp(false);
    }
  };

  const handleSendBooking = async () => {
    if (!selectedVenue?.bookingEmail) return;
    setSigningUp(true); // Re-using loading state for simplicity
    try {
      const res = await fetch("/api/booking/send", {
        method: "POST",
        body: JSON.stringify({
          to: selectedVenue.bookingEmail,
          subject: `Booking Inquiry: ${selectedVenue.name} - 2025/2026`,
          body: `Hi ${selectedVenue.contactName || "Booking Manager"},\n\nI'm looking to book a show at ${selectedVenue.name} in late 2025. We noticed you have some availability and love your focus on ${selectedVenue.bookingHistory?.split('.')[0]}.\n\nBest,\n[Your Name]`
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Booking Inquiry Sent Successfully!");
      } else {
        alert(`Failed to send: ${data.message || data.error}`);
      }
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setSigningUp(false);
    }
  };

  const handleSelectVenue = (venue: any) => {
    setSelectedVenue(venue);
    if (!routeNodes.find(n => n.id === venue.id)) {
      setRouteNodes(prev => [...prev, venue]);
    }
  };

  const totalIntel = venues.length + bands.length + resources.length;
  const showCounter = totalIntel > 0;
  
  const studios = resources.filter((r: any) => r.type === 'STUDIO').length;
  const rehearsals = resources.filter((r: any) => r.type === 'REHEARSAL').length;
  const shops = resources.filter((r: any) => r.type === 'SHOP').length;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-[#0a0a0f] font-sans relative">
      {/* Top Stats Bar */}
      {showCounter && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-4 z-20 relative">
          {/* Global Reach Widget */}
          <div className="glass bg-[#12121a]/90 backdrop-blur-3xl border border-pink-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(236,72,153,0.05)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex justify-between">
              Global Reach <Globe className="w-3 h-3 text-cyan-400" />
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold mb-1">LIVE VENUES</span>
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{venues.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold mb-1">ARTISTS</span>
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{bands.length}</span>
              </div>
            </div>
          </div>

          {/* Industry Hubs Widget */}
          <div className="glass bg-[#12121a]/90 backdrop-blur-3xl border border-orange-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex justify-between">
              Creative Infrastructure <Building2 className="w-3 h-3 text-orange-400" />
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold mb-1">STUDIOS</span>
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{studios}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold mb-1">REHEARSAL</span>
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{rehearsals}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold mb-1">STORES</span>
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{shops}</span>
              </div>
            </div>
          </div>

          {/* Circuit Pulse Widget */}
          <div className="glass bg-[#12121a]/90 backdrop-blur-3xl border border-indigo-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(99,102,241,0.05)] relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                Total Pulse <Activity className="w-3 h-3 text-indigo-400" />
              </h3>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 tabular-nums tracking-tighter">
                {totalIntel.toLocaleString()} Nodes
              </span>
            </div>
            <div className="relative z-10 p-3 bg-indigo-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar - Details & Booking */}

      <aside className="w-full md:w-96 border-r border-zinc-800/60 p-6 space-y-8 overflow-y-auto custom-scrollbar bg-[#050505]/95 backdrop-blur-2xl relative z-20 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black mb-1 flex items-center gap-2 tracking-tighter text-white">
              <Music className="text-pink-500 w-6 h-6" /> THE CIRCUIT
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Global Booking Intelligence</p>
              <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'}`} />
            </div>
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

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono space-y-2">
            <p className="flex items-center gap-2 font-black uppercase tracking-widest"><AlertTriangle className="w-3 h-3" /> System Fault</p>
            <p className="break-words">{error}</p>
          </div>
        )}

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
                      <button 
                        onClick={handleSendBooking}
                        className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-[10px] rounded-xl transition-all shadow-lg shadow-pink-600/20"
                      >
                        {signingUp ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Booking Request"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="p-5 bg-pink-600/10 rounded-2xl border border-pink-500/20 text-[10px] text-pink-400 font-medium flex flex-col gap-3">
                <p className="flex items-center gap-2 font-black uppercase tracking-widest text-white"><Zap className="w-3 h-3 text-pink-500" /> Pre-Release Access</p>
                <p className="text-zinc-400">The national grid is currently populating. Explore Nashville and New Orleans markers live.</p>
                <button 
                  onClick={() => setShowSignup(true)}
                  className="py-3 bg-pink-600 hover:bg-pink-700 rounded-xl text-white font-black uppercase transition-all shadow-lg shadow-pink-600/20"
                >
                  Join Waitlist
                </button>
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
      <main className="flex-1 relative overflow-hidden z-10 rounded-tr-3xl">
        <TouringMap venues={venues} bands={bands} resources={resources} routeNodes={routeNodes} onSelectVenue={handleSelectVenue} isProduction={!isLocal} />
      </main>

      {/* Right Sidebar - Feed & Network */}
      <aside className="hidden lg:flex w-80 border-l border-zinc-800/60 p-4 flex-col bg-[#050505]/95 backdrop-blur-2xl z-20">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Recent Network Activity</h3>
        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {venues.slice(0, 5).map((v: any, i) => (
            <div key={v.id || i} className="flex gap-3 items-start p-3 bg-[#12121a]/50 rounded-xl border border-zinc-800/40 hover:bg-[#12121a] transition-colors cursor-pointer" onClick={() => handleSelectVenue(v)}>
              <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 border border-pink-500/30">
                <MapPin className="w-3 h-3 text-pink-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{v.name}</p>
                <p className="text-[10px] text-zinc-500 mt-1">New venue synced in {v.address?.split(',')[0] || 'the network'}.</p>
              </div>
            </div>
          ))}
          {bands.slice(0, 3).map((b: any, i) => (
            <div key={b.id || i} className="flex gap-3 items-start p-3 bg-[#12121a]/50 rounded-xl border border-zinc-800/40">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Users className="w-3 h-3 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{b.name}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Artist profile created ({b.genre || 'Various'}).</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-zinc-800/60">
          <Link href="/messages" className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl text-xs font-bold text-white hover:bg-zinc-800 transition-colors">
            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-400" /> View Inbox (Local)</span>
            <span className="bg-cyan-500 text-black px-1.5 rounded-md text-[9px]">Beta</span>
          </Link>
        </div>
      </aside>
      </div>

      {/* BETA SIGNUP OVERLAY */}

        <AnimatePresence>
          {showSignup && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md glass p-8 rounded-[32px] border border-zinc-800 bg-zinc-950/90 shadow-2xl relative overflow-hidden">
                <button onClick={() => setShowSignup(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-pink-600 rounded-2xl mb-4 shadow-xl shadow-pink-600/30">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Join The Circuit</h3>
                  <p className="text-zinc-500 text-sm font-medium">Early Release Beta • Launching Summer 2026</p>
                </div>

                {signedUp ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h4 className="text-xl font-black text-white uppercase">Profile Initialized!</h4>
                    <p className="text-zinc-500 text-sm mt-2">Welcome to the Circuit.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4 relative z-10">
                    <input 
                      required type="text" placeholder="Your Name / Act Name" 
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none backdrop-blur-sm" 
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                    />
                    <input 
                      required type="email" placeholder="Email Address" 
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none backdrop-blur-sm" 
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required type="text" placeholder="Zipcode" 
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none backdrop-blur-sm" 
                        onChange={(e) => setSignupData({...signupData, zip: e.target.value})}
                      />
                      <select 
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-white appearance-none focus:ring-2 focus:ring-cyan-500 outline-none backdrop-blur-sm"
                        onChange={(e) => setSignupData({...signupData, role: e.target.value})}
                        defaultValue="BAND"
                      >
                        <option value="BAND">Artist / Band</option>
                        <option value="FAN">Fan / Enthusiast</option>
                        <option value="VENUE">Music Venue</option>
                        <option value="STUDIO">Recording Studio</option>
                        <option value="REHEARSAL">Rehearsal Room</option>
                        <option value="LABEL">Record Label</option>
                        <option value="SHOP">Music Store</option>
                      </select>
                    </div>
                    <button type="submit" disabled={signingUp} className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-magenta-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-pink-400 text-white font-black uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                      {signingUp ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Initialize Profile"}
                    </button>
                  </form>
                )}
                {/* Background ambient glow for form */}
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-magenta-500/10 blur-3xl pointer-events-none rounded-full"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
