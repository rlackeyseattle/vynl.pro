"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Search, 
  Filter, 
  Loader2, 
  Globe, 
  ExternalLink, 
  Mic2, 
  CheckCircle2, 
  Send,
  Sliders,
  Calendar,
  Check,
  Plus,
  Trash2,
  X,
  FileText,
  Briefcase,
  Sparkles,
  Info,
  PenTool
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getCurrentProfile } from "@/app/actions/profile";
import { useSession } from "next-auth/react";

const TouringMap = dynamic(() => import("@/components/TouringMap"), { 
  ssr: false,
  loading: () => <div className="h-[420px] w-full bg-zinc-900 animate-pulse rounded-3xl flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
  </div>
});

/* ——— Colors (DaVinci Technical Sketchbook Ink Palette) ——— */
const P = '#b25329';   // Burnt rust/brick ink
const C = '#5f8a6b';   // Technical sage ink
const G = '#426b52';   // Muted olive/green ink
const PK = '#a63a3a';  // Crimson red ink
const OR = '#c5a059';  // Drawing gold ink
const Y = '#8a763d';   // Muted bronze/yellow ink
const CHARCOAL = '#2c2c2c';
const BORDER_COLOR = '#d5cfbe';

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

// Map GPS coordinates of venues onto the 800x480 SVG map coordinates with index jittering fallback
const getProjectedCoords = (venue: any, index: number) => {
  let x = 400;
  let y = 240;
  
  if (venue.longitude && venue.latitude) {
    const lng = parseFloat(venue.longitude);
    const lat = parseFloat(venue.latitude);
    // US map boundaries: Longitude -125 to -67, Latitude 25 to 49
    x = ((lng - (-125)) / (-67 - (-125))) * 800;
    y = 480 - (((lat - 25) / (49 - 25)) * 480);
  } else if (venue.address) {
    const stateMatch = venue.address.match(/,\s*([A-Z]{2})\b/i);
    if (stateMatch) {
      const defaults: Record<string, { x: number, y: number }> = {
        WA: { x: 80, y: 70 },
        OR: { x: 75, y: 110 },
        CA: { x: 60, y: 240 },
        AZ: { x: 180, y: 320 },
        MT: { x: 200, y: 80 },
        TX: { x: 410, y: 395 },
        IN: { x: 590, y: 210 },
        TN: { x: 600, y: 260 },
        NY: { x: 720, y: 150 },
        FL: { x: 680, y: 400 },
        IL: { x: 550, y: 180 },
        CO: { x: 300, y: 220 },
      };
      const base = defaults[stateMatch[1].toUpperCase()] || { x: 400, y: 240 };
      // Jitter slightly based on index to prevent perfect overlapping of venues in the same state
      x = base.x + ((index * 17) % 30) - 15;
      y = base.y + ((index * 13) % 24) - 12;
    }
  }
  return { x, y };
};

export default function VenuesPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedVenueIds, setSelectedVenueIds] = useState<Set<string>>(new Set());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDraft, setBookingDraft] = useState({ dates: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  
  // Custom Negotiation Modal States
  const [bookingVenue, setBookingVenue] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState("JUN 12, 2026");
  const [ticketPrice, setTicketPrice] = useState(15);
  const [expectedAttendance, setExpectedAttendance] = useState(80);
  const [cateringSelected, setCateringSelected] = useState(true);
  const [soundEngSelected, setSoundEngSelected] = useState(true);
  const [localTransportSelected, setLocalTransportSelected] = useState(false);
  const [isContractSigned, setIsContractSigned] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Bulk Custom Emails States
  const [artistName, setArtistName] = useState("Artist");
  const [emailSubject, setEmailSubject] = useState("Booking Inquiry for {venue_name} - {artist_name}");
  const [emailBody, setEmailBody] = useState("Hi {venue_name} Booking Team,\n\nWe are looking to book a show in your area around {dates}. We'd love to discuss scheduling a slot at your venue. Let us know if you have any availability.\n\nBest,\n{artist_name}");
  const [sendingProgress, setSendingProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    async function loadArtist() {
      try {
        const res = await getCurrentProfile();
        if (res && res.profile && res.profile.name) {
          setArtistName(res.profile.name);
        }
      } catch (err) {
        console.error("Failed to load artist details for email templates:", err);
      }
    }
    loadArtist();
  }, []);

  // National Harvester States
  const [showHarvester, setShowHarvester] = useState(false);
  const [harvestRegion, setHarvestRegion] = useState("Spokane, WA");
  const [harvesting, setHarvesting] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState<string[]>([]);

  const runHarvester = async () => {
    setHarvesting(true);
    setHarvestLogs(["Scouting region...", "Cross-referencing Bandsintown database...", "Fetching verified event histories..."]);
    try {
      const res = await fetch("/api/venues/harvest", {
        method: "POST",
        body: JSON.stringify({ region: harvestRegion }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setHarvestLogs(prev => [...prev, ...data.logs, `Successfully synced ${data.count} active music venues.`]);
        // Trigger a reload of the venues list
        setSearch(harvestRegion.split(",")[0]);
      } else {
        setHarvestLogs(prev => [...prev, `Harvest error: ${data.error}`]);
      }
    } catch (err) {
      setHarvestLogs(prev => [...prev, "Critical connection error during harvesting."]);
    } finally {
      setHarvesting(false);
    }
  };

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (state) params.set("state", state);
    if (genre) params.set("genre", genre);
    if (type) params.set("type", type);
    fetch(`/api/venues/list?${params}`)
      .then(r => r.json())
      .then(data => { setVenues(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedSearch, state, genre, type]);

  // Synchronize dynamic negotiator settings on modal open
  useEffect(() => {
    if (bookingVenue) {
      setExpectedAttendance(120);
      setBookingDate("JUL 04, 2026");
      setIsContractSigned(false);
      setShowConfetti(false);
    }
  }, [bookingVenue]);

  // Digital Signature Pad Canvas Setup
  useEffect(() => {
    if (bookingVenue && canvasRef.current && !isContractSigned) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#2c2c2c';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [bookingVenue, isContractSigned]);

  const toggleSelection = (id: string) => {
    setSelectedVenueIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkBooking = async () => {
    setIsSending(true);
    const selectedList = venues.filter(v => selectedVenueIds.has(v.id));
    const total = selectedList.length;
    setSendingProgress({ current: 0, total });

    let successCount = 0;

    for (let i = 0; i < total; i++) {
      const venue = selectedList[i];
      const targetEmail = venue.bookingEmail || venue.contactEmail;
      if (!targetEmail) {
        setSendingProgress(prev => prev ? { ...prev, current: i + 1 } : null);
        continue;
      }

      // Replace merge tags dynamically
      const customSubject = emailSubject
        .replace(/{venue_name}/g, venue.name || "Venue")
        .replace(/{venue_address}/g, venue.address || "")
        .replace(/{dates}/g, bookingDraft.dates || "Upcoming Dates")
        .replace(/{artist_name}/g, artistName);

      const customBody = emailBody
        .replace(/{venue_name}/g, venue.name || "Venue")
        .replace(/{venue_address}/g, venue.address || "")
        .replace(/{dates}/g, bookingDraft.dates || "Upcoming Dates")
        .replace(/{artist_name}/g, artistName);

      try {
        const res = await fetch("/api/booking/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: targetEmail,
            subject: customSubject,
            body: customBody
          })
        });
        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error("Failed to send custom email to " + venue.name, err);
      }

      setSendingProgress(prev => prev ? { ...prev, current: i + 1 } : null);
    }

    alert(`Successfully dispatched ${successCount} custom booking emails!`);
    setSelectedVenueIds(new Set());
    setShowBookingModal(false);
    setSendingProgress(null);
    setIsSending(false);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isContractSigned) return;
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || isContractSigned) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    if (!canvasRef.current || isContractSigned) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const signContract = () => {
    setIsContractSigned(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // Map the selected venues into coordinates in selection order for route mapping
  const selectedVenuesInOrder = venues
    .filter(v => selectedVenueIds.has(v.id))
    .map((v, i) => ({ ...v, projected: getProjectedCoords(v, i) }));

  // Dynamic finances calculations
  const grossSales = expectedAttendance * ticketPrice;
  const isCooperative = bookingVenue?.venueType?.toUpperCase() === 'COOPERATIVE' || !bookingVenue?.averagePay?.includes("%");
  const venueCut = isCooperative ? 100 : Math.round(grossSales * 0.20);
  const cateringCost = cateringSelected ? (isCooperative ? 0 : 75) : 0;
  const soundEngCost = soundEngSelected ? 120 : 0;
  const localTransportCost = localTransportSelected ? 150 : 0;
  const totalExpenses = cateringCost + soundEngCost + localTransportCost;
  const estimatedPayout = Math.max(0, grossSales - venueCut - totalExpenses);

  return (
    <div className="w-full bg-zinc-950 min-h-screen text-zinc-100 selection:bg-[#c5a059]/30">
      
      <style>{`
        /* Grain overlay for vintage parchment sketchbook feel */
        .sketch-grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .sketchbook-panel {
          border-radius: 12px;
          background: rgba(24, 24, 27, 0.4);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
          padding: 2rem;
          position: relative;
          backdrop-filter: blur(10px);
        }

        .sketchbook-panel::before {
          content: '';
          position: absolute;
          left: 6px; top: 6px; right: 6px; bottom: 6px;
          border: 1px dashed rgba(197,160,89,0.15);
          border-radius: 8px;
          pointer-events: none;
        }

        /* Responsive grid adjustments */
        @media (max-width: 1024px) {
          .directory-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }

        .custom-route-line {
          stroke: ${P};
          stroke-width: 3.5;
          stroke-dasharray: 6, 6;
          animation: osc-draw-glow 20s linear infinite;
        }

        @keyframes osc-draw-glow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -100; }
        }

        .modal-sketch-box {
          background: #09090b;
          border: 2px solid ${OR};
          border-radius: 12px;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 2.2rem;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);
          color: #ffffff;
        }

        .modal-sketch-box::before {
          content: '';
          position: absolute;
          left: 6px; top: 6px; right: 6px; bottom: 6px;
          border: 1px dashed rgba(197,160,89,0.15);
          border-radius: 8px;
          pointer-events: none;
        }

        .signature-draw-canvas {
          background: #18181b;
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          cursor: crosshair;
          touch-action: none;
        }

        .confetti-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: fall-down 4s linear infinite;
          z-index: 100;
        }

        @keyframes fall-down {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Parchment physical sheet textures */}
      <div className="sketch-grain-overlay" />

      {/* Confetti Animation when contract signed */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3000, overflow: 'hidden' }}>
          {Array.from({ length: 45 }).map((_, idx) => {
            const colors = [OR, C, P, G, Y];
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 2.5 + Math.random() * 2;
            const size = 6 + Math.random() * 6;
            const color = colors[idx % colors.length];
            return (
              <div 
                key={idx} 
                className="confetti-dot" 
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  width: size,
                  height: size,
                  background: color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main Section */}
      <section className="border-b border-zinc-900 py-14 relative overflow-hidden bg-zinc-950">
        {/* Subtle watercolor blots */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,160,89,0.03) 0%, transparent 70%)', filter: 'blur(60px)', top: '-10%', left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.02) 0%, transparent 70%)', filter: 'blur(80px)', bottom: '-15%', right: '10%', pointerEvents: 'none' }} />
        <div className="container mx-auto px-6 space-y-4 relative z-10">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div className="space-y-4">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 1.1rem', borderRadius: '100px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899' }} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em', color: OR, fontWeight: 700 }}>◈ VYNL.PRO // VENUE DIRECTORY</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                The Venue Directory
              </h1>
            </div>
            <button 
              onClick={() => setShowHarvester(!showHarvester)}
              style={{
                borderColor: showHarvester ? OR : 'rgba(255,255,255,0.15)',
                color: showHarvester ? OR : 'white',
                background: showHarvester ? 'rgba(197,160,89,0.06)' : 'rgba(255,255,255,0.02)'
              }}
              className="px-6 py-3 border rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
            >
              <Sparkles size={14} className={harvesting ? "animate-spin text-pink-500" : "text-pink-500"} />
              {showHarvester ? "Close Harvester" : "Discover & Sync National Venues"}
            </button>
          </div>

          <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
            {venues.length > 0 ? `${venues.length} active live venues` : "Connecting to Vynl networks..."} — Search and filter independent music venues by city, state, genre, or pay structure. Add venues to your list to contact them in bulk.
          </p>

          {/* Harvester Input Panel */}
          <AnimatePresence>
            {showHarvester && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ border: `1.5px solid rgba(255,255,255,0.08)`, background: '#121217' }}
                className="p-6 rounded-2xl space-y-4 max-w-2xl overflow-hidden"
              >
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe size={16} className="text-pink-500" /> Active Venue Finder
                  </h3>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Queries Grok and cross-references event active statuses</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={harvestRegion}
                    onChange={e => setHarvestRegion(e.target.value)}
                    placeholder="e.g. Kalispell, MT or Coeur d'Alene, ID"
                    style={{ borderColor: 'rgba(255,255,255,0.12)', background: '#09090b', color: 'white' }}
                    className="flex-1 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                  />
                  <button 
                    disabled={harvesting || !harvestRegion}
                    onClick={runHarvester}
                    style={{ background: '#c5a059', color: '#09090b' }}
                    className="px-6 py-3 rounded-xl font-bold uppercase text-xs hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    {harvesting ? "Scouting..." : "Discover & Sync"}
                  </button>
                </div>

                {harvestLogs.length > 0 && (
                  <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1 custom-scrollbar">
                    {harvestLogs.map((h, i) => <p key={i}>{h}</p>)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Dynamic Filters Deck */}
          <div className="flex flex-col lg:flex-row gap-3 max-w-5xl pt-6">
            <div className="relative flex-[2]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search venues by name, city, state..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#09090b', color: 'white' }}
                  className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>
              
              <div className="relative flex-1">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#09090b', color: 'white' }}
                  className="w-full border rounded-xl pl-11 pr-8 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059] appearance-none"
                >
                  <option value="">Any Type</option>
                  <option value="CLUB">Clubs</option>
                  <option value="BAR">Bars & Dives</option>
                  <option value="THEATER">Theaters</option>
                  <option value="COOPERATIVE">Cooperative Venues</option>
                </select>
              </div>

              <div className="relative flex-1">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#09090b', color: 'white' }}
                  className="w-full border rounded-xl pl-11 pr-8 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059] appearance-none"
                >
                  <option value="">Any Genre</option>
                  <option value="Rock">Rock</option>
                  <option value="Indie">Indie</option>
                  <option value="Acoustic">Acoustic</option>
                  <option value="Metal">Metal</option>
                  <option value="Punk">Punk</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Country">Country</option>
                </select>
              </div>

              <div className="relative flex-1">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#09090b', color: 'white' }}
                  className="w-full border rounded-xl pl-11 pr-8 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059] appearance-none"
                >
                  <option value="">All States</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
          </div>
        </div>
      </section>

      {/* Main Directory content */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-[#c5a059] animate-spin" />
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-sm">No active venues found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Group venues by state */}
            {(() => {
              const getVenueState = (v: any) => {
                if (!v.address) return "OTHER";
                const match = v.address.match(/,\s*([A-Z]{2})\b/i);
                return match ? match[1].toUpperCase() : "OTHER";
              };

              const grouped: Record<string, any[]> = {};
              venues.forEach(v => {
                const s = getVenueState(v);
                if (!grouped[s]) grouped[s] = [];
                grouped[s].push(v);
              });

              // Sort states alphabetically, putting "OTHER" at the end if it exists
              const sortedStates = Object.keys(grouped).sort((a, b) => {
                if (a === "OTHER") return 1;
                if (b === "OTHER") return -1;
                const nameA = STATE_NAMES[a] || a;
                const nameB = STATE_NAMES[b] || b;
                return nameA.localeCompare(nameB);
              });

              return sortedStates.map(stateCode => {
                const stateVenues = grouped[stateCode];
                const stateName = STATE_NAMES[stateCode] || stateCode;

                return (
                  <div key={stateCode} className="flex flex-col gap-6">
                    <div className="border-b border-zinc-800/80 pb-2 flex items-center justify-between">
                      <h3 className="font-black text-white text-lg tracking-tighter uppercase font-sans flex items-center gap-2">
                        <span>{stateName.toUpperCase()}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(197,160,89,0.12)', border: `1px solid ${OR}`, padding: '2px 8px', borderRadius: '4px', color: OR, fontFamily: 'Share Tech Mono' }}>
                          {stateVenues.length} {stateVenues.length === 1 ? 'VENUE' : 'VENUES'}
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stateVenues.map(venue => {
                        const isSelected = selectedVenueIds.has(venue.id);
                        const isCooperative = venue.venueType?.toUpperCase() === 'COOPERATIVE' || !venue.averagePay?.includes("%");

                        return (
                          <div 
                            key={venue.id} 
                            style={{
                              borderLeft: `4px solid ${isCooperative ? C : P}`,
                              borderColor: isSelected ? OR : (isCooperative ? C : P),
                              background: isSelected ? 'rgba(197,160,89,0.04)' : 'rgba(24,24,27,0.4)'
                            }}
                            className={`p-5 rounded-lg border border-zinc-85 transition-all duration-200 flex flex-col justify-between`}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                {isAuthenticated ? (
                                  <div onClick={() => toggleSelection(venue.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      background: isSelected ? C : 'transparent',
                                      border: `1.5px solid ${isSelected ? C : '#999'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: isSelected ? '#faf9f5' : '#777',
                                      fontWeight: 700,
                                      fontSize: '0.65rem',
                                      transition: 'all 0.15s',
                                      flexShrink: 0
                                    }}>
                                      {isSelected ? <Check size={10} /> : <Plus size={10} />}
                                    </div>
                                    <div>
                                      <h4 className="font-black text-white text-base tracking-tight mb-0.5">
                                        {venue.name}
                                      </h4>
                                      <span className="text-xs text-zinc-400 font-mono">
                                        📍 {venue.address?.toUpperCase() || "UNKNOWN LOCATION"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div>
                                      <h4 className="font-black text-white text-base tracking-tight mb-0.5">
                                        {venue.name}
                                      </h4>
                                      <span className="text-xs text-zinc-400 font-mono">
                                        📍 {venue.address?.toUpperCase() || "UNKNOWN LOCATION"}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <span style={{
                                  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.52rem',
                                  color: isCooperative ? C : P,
                                  background: isCooperative ? 'rgba(95,138,107,0.08)' : 'rgba(178,83,41,0.08)',
                                  border: `1.5px solid ${isCooperative ? C : P}`,
                                  padding: '2px 8px', borderRadius: '4px', fontWeight: 800
                                }}>
                                  {isCooperative ? "COOP VENUE" : "TRADITIONAL"}
                                </span>
                              </div>

                              {venue.bookingHistory && (
                                <p className="text-xs text-zinc-400 leading-relaxed my-3">{venue.bookingHistory}</p>
                              )}

                              <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 my-4 border-t border-zinc-800/60 pt-3">
                                {isAuthenticated ? (
                                  <>
                                    {venue.phone && <div><strong className="text-zinc-500">Phone:</strong> {venue.phone}</div>}
                                    {venue.bookingEmail && <div><strong className="text-zinc-500">Email:</strong> {venue.bookingEmail}</div>}
                                    {venue.averagePay && <div><strong className="text-zinc-500">Avg Pay:</strong> <span style={{ color: C, fontWeight: 'bold' }}>{venue.averagePay}</span></div>}
                                    {venue.ageRequirement && <div><strong className="text-zinc-500">Age:</strong> {venue.ageRequirement}</div>}
                                  </>
                                ) : (
                                  <div className="col-span-2 py-1 flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
                                    <span>🔒 Register to unlock contact & pay info</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card actions */}
                            {isAuthenticated ? (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                  onClick={() => toggleSelection(venue.id)}
                                  style={{ 
                                    flex: 1, 
                                    fontSize: '0.65rem', 
                                    borderColor: isSelected ? OR : 'rgba(255,255,255,0.08)',
                                    color: isSelected ? OR : 'rgba(255,255,255,0.8)',
                                    background: isSelected ? 'rgba(197,160,89,0.06)' : 'rgba(255,255,255,0.02)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                  className="filter-btn"
                                >
                                  {isSelected ? <><Check size={10} /> IN BOOKING LIST</> : <><Plus size={10} /> ADD TO BOOKING LIST</>}
                                </button>
                                
                                <button
                                  onClick={() => setBookingVenue(venue)}
                                  style={{
                                    flex: 1.2,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.3rem',
                                    padding: '0.55rem 0.8rem',
                                    borderRadius: '4px',
                                    background: '#faf9f5',
                                    border: `1.5px solid #faf9f5`,
                                    color: '#09090b',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                    fontFamily: 'Share Tech Mono, monospace',
                                    cursor: 'pointer'
                                  }}
                                >
                                  NEGOTIATE GIG <Sparkles size={11} fill="#09090b" />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                                <Link
                                  href="/auth/signup"
                                  style={{
                                    width: '100%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.3rem',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: `1.5px solid rgba(255,255,255,0.08)`,
                                    color: '#faf9f5',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                    fontFamily: 'Share Tech Mono, monospace',
                                    cursor: 'pointer'
                                  }}
                                  className="hover:bg-zinc-800 transition-colors"
                                >
                                  REGISTER TO BOOK VENUE <ArrowRight size={10} />
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </section>

      {/* Floating Action Bar for Bulk Booking (Vynl campaign launch synced) */}
      <AnimatePresence>
        {selectedVenueIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{ 
              background: '#09090b', 
              border: `1.5px solid rgba(255,255,255,0.08)`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-4 rounded-full backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div style={{ background: '#ec4899' }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs">
                {selectedVenueIds.size}
              </div>
              <span className="font-bold text-white tracking-wide text-xs" style={{ fontFamily: 'Share Tech Mono, monospace' }}>SELECTED VENUES</span>
            </div>
            <div className="w-px h-8 bg-zinc-800"></div>
            <button 
              onClick={() => setShowBookingModal(true)}
              style={{ background: '#c5a059', color: '#09090b' }}
              className="px-6 py-2 hover:opacity-90 rounded-full font-black text-xs flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Email Booking List
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Campaign Resend Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-sketch-box max-w-2xl w-full"
            >
              <button 
                onClick={() => setShowBookingModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.8rem', borderRadius: '4px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}`, marginBottom: '0.6rem' }}>
                  <FileText size={12} color={P} />
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: P, fontWeight: 700 }}>◈ VYNL.PRO // BULK BOOKING SENDER v3.0</span>
                </div>
              
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1" style={{ fontFamily: 'Cinzel, EB Garamond, serif' }}>Send Custom Booking Emails</h2>
              <p className="text-zinc-500 text-xs mb-6">Personalize and dispatch custom booking requests to {selectedVenueIds.size} selected venues simultaneously.</p>
              
              {sendingProgress ? (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#c5a059] mx-auto" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Sending Email {sendingProgress.current} of {sendingProgress.total}
                  </h3>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div 
                      className="bg-[#c5a059] h-full transition-all duration-300"
                      style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Target Tour Dates</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mid-October 2026, Weekends"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#c5a059] transition-colors text-xs"
                        value={bookingDraft.dates}
                        onChange={(e) => setBookingDraft(prev => ({...prev, dates: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Your Artist Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#c5a059] transition-colors text-xs"
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Custom Subject Line</label>
                    <input 
                      type="text" 
                      placeholder="Subject template"
                      className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#c5a059] transition-colors text-xs font-bold"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Custom Pitch Body</label>
                    <textarea 
                      placeholder="Hi {venue_name}..."
                      className="w-full h-32 bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#c5a059] transition-colors resize-none text-xs font-medium"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </div>

                  {/* Merge Tags Help */}
                  <div className="bg-[#18181b]/60 border border-zinc-800 p-3 rounded-xl">
                    <div className="text-[9px] font-black uppercase text-zinc-400 mb-1.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>◈ Merge tags (auto-replaced per email):</div>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-[#09090b] border border-zinc-850 text-zinc-300 px-2 py-0.5 rounded font-mono">{"{venue_name}"}</span>
                      <span className="bg-[#09090b] border border-zinc-850 text-zinc-300 px-2 py-0.5 rounded font-mono">{"{venue_address}"}</span>
                      <span className="bg-[#09090b] border border-zinc-850 text-zinc-300 px-2 py-0.5 rounded font-mono">{"{dates}"}</span>
                      <span className="bg-[#09090b] border border-zinc-850 text-zinc-300 px-2 py-0.5 rounded font-mono">{"{artist_name}"}</span>
                    </div>
                  </div>

                  {/* Selected Recipients Preview */}
                  <div className="max-h-24 overflow-y-auto bg-[#09090b] border border-zinc-800 p-3 rounded-xl space-y-1.5">
                    <div className="text-[9px] font-black uppercase text-zinc-400" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Recipients list ({selectedVenueIds.size}):</div>
                    {venues.filter(v => selectedVenueIds.has(v.id)).map(v => (
                      <div key={v.id} className="text-[10px] text-zinc-300 flex justify-between font-bold">
                        <span>{v.name}</span>
                        <span className="font-mono text-[9px] text-zinc-500">{v.bookingEmail || v.contactEmail || "No Email listed"}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleBulkBooking}
                    disabled={isSending || !emailBody || !emailSubject || !bookingDraft.dates}
                    style={{ background: C, border: `2px solid ${C}` }}
                    className="w-full py-3.5 disabled:opacity-50 text-white font-black text-xs uppercase rounded-xl transition-all flex justify-center items-center gap-2 tracking-wider cursor-pointer"
                  >
                    DISPATCH MASS CUSTOM EMAILS
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ——— BOOKING SIMULATOR CONTRACT MODAL ——— */}
      {bookingVenue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setBookingVenue(null)}>
          <div className="modal-sketch-box" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setBookingVenue(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem', borderBottom: `1.5px solid rgba(255,255,255,0.08)`, paddingBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.8rem', borderRadius: '4px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}`, marginBottom: '0.6rem' }}>
                <FileText size={12} color={OR} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: OR, fontWeight: 700 }}>◈ VYNL PRO CONTRACT BUILDER v1.2</span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
                Gig Negotiation Desk
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Share Tech Mono, monospace', fontWeight: 700 }}>
                {bookingVenue.name} · {bookingVenue.address || bookingVenue.city}
              </span>
            </div>

            {/* Main simulator parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.8rem', marginBottom: '1.5rem' }}>
              
              {/* Parameter Settings */}
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sliders size={14} color={OR} /> NEGOTIATION TERMS
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Select show date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '0.3rem' }}>CHOOSE PERFORMANCE DATE</label>
                    <select
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      disabled={isContractSigned}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        background: '#18181b',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontFamily: 'Share Tech Mono, monospace',
                        fontWeight: 700
                      }}
                    >
                      <option value="JUL 04, 2026">JUL 04, 2026</option>
                      <option value="JUL 18, 2026">JUL 18, 2026</option>
                      <option value="AUG 01, 2026">AUG 01, 2026</option>
                    </select>
                  </div>

                  {/* Slider: Ticket price */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span>TICKET COVER PRICE</span>
                      <strong style={{ color: OR }}>${ticketPrice}</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="1"
                      value={ticketPrice}
                      onChange={e => setTicketPrice(Number(e.target.value))}
                      disabled={isContractSigned}
                      style={{ width: '100%', accentColor: OR }}
                    />
                  </div>

                  {/* Slider: Expected Attendance */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span>EXPECTED ATTENDANCE</span>
                      <strong style={{ color: C }}>{expectedAttendance} fans</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="250"
                      step="5"
                      value={expectedAttendance}
                      onChange={e => setExpectedAttendance(Number(e.target.value))}
                      disabled={isContractSigned}
                      style={{ width: '100%', accentColor: C }}
                    />
                    <span style={{ display: 'block', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px', textAlign: 'right' }}>Standard Draw Cap: 250</span>
                  </div>

                  {/* Rider Toggles */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '0.4rem' }}>CONTRACT RIDER TOGGLES</span>
                    
                    <div 
                      onClick={() => !isContractSigned && setCateringSelected(!cateringSelected)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      <div style={{
                        width: 13, height: 13, borderRadius: '2px',
                        border: `1.5px solid ${cateringSelected ? OR : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center',
                        background: cateringSelected ? OR : 'transparent',
                      }}>
                        {cateringSelected && <Check size={9} color="#09090b" strokeWidth={4} style={{ margin: 'auto' }} />}
                      </div>
                      <span className="text-zinc-350">Green Room Catering (cooperative covers meal for free!)</span>
                    </div>

                    <div 
                      onClick={() => !isContractSigned && setSoundEngSelected(!soundEngSelected)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      <div style={{
                        width: 13, height: 13, borderRadius: '2px',
                        border: `1.5px solid ${soundEngSelected ? OR : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center',
                        background: soundEngSelected ? OR : 'transparent',
                      }}>
                        {soundEngSelected && <Check size={9} color="#09090b" strokeWidth={4} style={{ margin: 'auto' }} />}
                      </div>
                      <span className="text-zinc-350">Dedicated Front-of-House Engineer ($120 fee)</span>
                    </div>

                    <div 
                      onClick={() => !isContractSigned && setLocalTransportSelected(!localTransportSelected)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      <div style={{
                        width: 13, height: 13, borderRadius: '2px',
                        border: `1.5px solid ${localTransportSelected ? OR : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center',
                        background: localTransportSelected ? OR : 'transparent',
                      }}>
                        {localTransportSelected && <Check size={9} color="#09090b" strokeWidth={4} style={{ margin: 'auto' }} />}
                      </div>
                      <span className="text-zinc-350">Ground Transport Shuttle ($150 fee)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Math Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.015)', padding: '1.2rem', borderRadius: '8px', border: `1.5px solid rgba(255,255,255,0.08)` }}>
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign size={14} color={C} /> FINANCIAL MATRIX
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-zinc-400">Gross Ticket Sales:</span>
                    <strong className="text-white">${grossSales.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-zinc-400">Venue Platform Cut:</span>
                    <strong className="text-red-400">-${venueCut}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-zinc-400">Technical Specs Rider:</span>
                    <strong className="text-red-400">-${totalExpenses}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0' }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>ESTIMATED NET PAYOUT</span>
                  <span className="text-3xl font-black text-emerald-400">
                    ${estimatedPayout.toLocaleString()}
                  </span>
                </div>

                {isCooperative ? (
                  <div style={{ padding: '8px', background: 'rgba(95,138,107,0.08)', border: `1px solid ${C}`, borderRadius: '4px', fontSize: '0.65rem', color: '#88a892', lineHeight: 1.3 }}>
                    🚀 <strong>Cooperative Venue Advantage:</strong> Direct door cover matches net you <strong>100%</strong> of door sales, saving you <strong>+${Math.round(grossSales * 0.20)}</strong> over commercial models!
                  </div>
                ) : (
                  <div style={{ padding: '8px', background: 'rgba(197,160,89,0.08)', border: `1px solid ${OR}`, borderRadius: '4px', fontSize: '0.65rem', color: '#c5a059', lineHeight: 1.3 }}>
                    ⚠️ <strong>Traditional Venue Policy:</strong> Traditional clubs charge a standard 20% commission on door cover to offset local building rent & operations.
                  </div>
                )}
              </div>

            </div>

            {/* Digital Signature Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: `1.5px solid rgba(255,255,255,0.08)`, paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <PenTool size={12} color={OR} /> SIGN DRAFT AGREEMENT BELOW
                </span>
                {!isContractSigned && (
                  <button 
                    onClick={clearSignature}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', fontWeight: 700 }}
                  >
                    CLEAR WRITING CANVAS
                  </button>
                )}
              </div>

              {isContractSigned ? (
                /* Sealed Contract Visual Overlay */
                <div style={{ 
                  padding: '2rem 1rem', 
                  borderRadius: '6px', 
                  border: `2px dashed ${C}`, 
                  background: 'rgba(95,138,107,0.05)', 
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Stamp */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-12deg)',
                    border: `4px solid ${PK}`,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: PK,
                    fontFamily: 'Share Tech Mono, monospace',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: '0 0 10px rgba(166,58,58,0.15)',
                    background: '#18181b',
                    zIndex: 10,
                    opacity: 0.85
                  }}>
                    ◈ CONTRACT SEALED ◈
                  </div>

                  <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.4rem' }}>🤝</span>
                  <strong className="block text-[#88a892] text-sm mb-1 uppercase tracking-wider">CAMPAIGN SIGNED &amp; BROADCAST ON THE VYNL EDGE NETWORK</strong>
                  <span style={{ display: 'block', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    TIMESTAMP RECORDED: {new Date().toLocaleDateString()} // {bookingDate} PERFORMANCE SEALED
                  </span>
                  
                  <div style={{ marginTop: '1.2rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setBookingVenue(null)}
                      className="filter-btn active cursor-pointer"
                      style={{ fontSize: '0.68rem', padding: '0.5rem 1.4rem' }}
                    >
                      CLOSE NEGOTIATION DESK
                    </button>
                    <button
                      onClick={() => setIsContractSigned(false)}
                      className="filter-btn cursor-pointer"
                      style={{ fontSize: '0.68rem', padding: '0.5rem 1rem', color: PK, borderColor: 'rgba(166,58,58,0.4)' }}
                    >
                      VOID &amp; REDRAFT
                    </button>
                  </div>
                </div>
              ) : (
                /* Drawing signature pad */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={110}
                    className="signature-draw-canvas"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => setBookingVenue(null)}
                      className="filter-btn cursor-pointer"
                      style={{ fontSize: '0.68rem' }}
                    >
                      ABORT DRAFT
                    </button>
                    
                    <button
                      onClick={signContract}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.55rem 1.4rem',
                        borderRadius: '4px',
                        background: C,
                        border: `1.5px solid ${C}`,
                        color: '#faf9f5',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        fontFamily: 'Share Tech Mono, monospace',
                        cursor: 'pointer'
                      }}
                    >
                      FINALIZE &amp; SEAL CONTRACT <Briefcase size={11} fill="#faf9f5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
