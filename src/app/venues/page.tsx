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
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueIds: Array.from(selectedVenueIds),
          dates: bookingDraft.dates,
          message: bookingDraft.message
        })
      });
      if (res.ok) {
        alert("Booking campaigns launched successfully!");
        setSelectedVenueIds(new Set());
        setShowBookingModal(false);
        setBookingDraft({ dates: "", message: "" });
      } else {
        alert("Failed to send bookings.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
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
    <div className="w-full bg-[#faf9f5] min-h-screen text-[#2c2c2c] selection:bg-[#c5a059]/30">
      
      <style>{`
        /* Grain overlay for vintage parchment sketchbook feel */
        .sketch-grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .sketchbook-panel {
          border-radius: 12px;
          background: #faf9f5;
          border: 1.5px solid ${BORDER_COLOR};
          box-shadow: 0 4px 15px rgba(44,44,40,0.03);
          padding: 2rem;
          position: relative;
        }

        .sketchbook-panel::before {
          content: '';
          position: absolute;
          left: 6px; top: 6px; right: 6px; bottom: 6px;
          border: 1px dashed rgba(197,160,89,0.3);
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
          background: #faf9f5;
          border: 2px solid ${OR};
          border-radius: 12px;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 2.2rem;
          box-shadow: 0 24px 50px rgba(44,44,40,0.2);
        }

        .modal-sketch-box::before {
          content: '';
          position: absolute;
          left: 6px; top: 6px; right: 6px; bottom: 6px;
          border: 1px dashed rgba(197,160,89,0.3);
          border-radius: 8px;
          pointer-events: none;
        }

        .signature-draw-canvas {
          background: #f2eedf;
          border: 1.5px dashed ${BORDER_COLOR};
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
      <section className="border-b border-[#d5cfbe] py-14 relative overflow-hidden" style={{ background: '#faf9f5' }}>
        {/* Subtle watercolor blots */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 70%)', filter: 'blur(60px)', top: '-10%', left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(95,138,107,0.05) 0%, transparent 70%)', filter: 'blur(80px)', bottom: '-15%', right: '10%', pointerEvents: 'none' }} />
        
        <div className="container mx-auto px-6 space-y-4 relative z-10">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 1.1rem', borderRadius: '100px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: P }} />
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em', color: P, fontWeight: 700 }}>◈ VYNL.PRO // NATIONAL GIG MATCHMAKER</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-[#2c2c2c] tracking-tight leading-none" style={{ fontFamily: 'Cinzel, EB Garamond, serif' }}>
            The Outpost Grid
          </h1>
          <p className="text-zinc-600 max-w-xl text-sm leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {venues.length > 0 ? `${venues.length} active live venues` : "Connecting to Vynl networks..."} — Plot interactive routes on the Technical US Map, select tour segments, and negotiate instant crowd-backed agreements.
          </p>

          {/* Search & Dynamic Filters Deck */}
          <div className="flex flex-col lg:flex-row gap-3 max-w-5xl pt-6">
            <div className="relative flex-[2]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search venues by name, city, state..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ borderColor: BORDER_COLOR, background: '#faf9f5', color: CHARCOAL }}
                className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
              />
            </div>
            
            <div className="relative flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                style={{ borderColor: BORDER_COLOR, background: '#faf9f5', color: CHARCOAL }}
                className="w-full border rounded-xl pl-11 pr-8 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059] appearance-none"
              >
                <option value="">Any Type</option>
                <option value="CLUB">Clubs</option>
                <option value="BAR">Bars & Dives</option>
                <option value="THEATER">Theaters</option>
                <option value="COOPERATIVE">Cooperative Outposts</option>
              </select>
            </div>

            <div className="relative flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                style={{ borderColor: BORDER_COLOR, background: '#faf9f5', color: CHARCOAL }}
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
                style={{ borderColor: BORDER_COLOR, background: '#faf9f5', color: CHARCOAL }}
                className="w-full border rounded-xl pl-11 pr-8 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a059] appearance-none"
              >
                <option value="">All States</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid content */}
      <section className="container mx-auto px-6 py-12">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }} className="directory-grid-layout">
          
          {/* ——— Left Column: Sketched US Map and Router ——— */}
          <div className="sketchbook-panel flex flex-col gap-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={18} color={P} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem', fontWeight: 'bold', color: CHARCOAL, letterSpacing: '0.08em' }}>ACTIVE TOUR ROUTING ENGINE</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {selectedVenueIds.size > 0 && (
                  <button 
                    onClick={() => setSelectedVenueIds(new Set())}
                    style={{ background: 'none', border: 'none', color: PK, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Trash2 size={10} /> CLEAR SELECTIONS
                  </button>
                )}
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: C, fontWeight: 800 }}>{selectedVenueIds.size} VENUES SELECTED</span>
              </div>
            </div>

            {/* Hand-Drawn SVG Map panel */}
            <div style={{ background: '#f2eedf', border: `1.5px solid ${OR}`, borderRadius: '12px', width: '100%', height: '420px', position: 'relative', overflow: 'hidden' }}>
              {/* Map grid lines */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(197,160,89,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,0.09) 1px, transparent 1px)`, backgroundSize: '25px 25px', pointerEvents: 'none' }} />
              
              <svg viewBox="0 0 800 480" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                {/* Hand sketched US Outline Polyline */}
                <path
                  d="M 50 100 C 120 70, 240 60, 320 60 C 420 50, 520 60, 620 50 C 700 45, 750 90, 780 120 C 810 160, 770 210, 790 250 C 810 290, 740 310, 730 350 C 710 390, 680 410, 630 400 C 580 390, 540 430, 480 430 C 420 430, 360 410, 320 370 C 260 380, 210 400, 160 380 C 130 360, 120 320, 80 290 C 40 260, 50 210, 30 180 C 10 150, 10 120, 50 100 Z"
                  fill="none"
                  stroke="rgba(197,160,89,0.25)"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                />

                {/* Compass Medallion */}
                <g transform="translate(710, 110)" opacity="0.6">
                  <circle cx="0" cy="0" r="30" fill="none" stroke={OR} strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="-38" y1="0" x2="38" y2="0" stroke={OR} strokeWidth="1" />
                  <line x1="0" y1="-38" x2="0" y2="38" stroke={OR} strokeWidth="1" />
                  <polygon points="0,-35 4,-8 0,0" fill={P} />
                  <polygon points="0,-35 -4,-8 0,0" fill={OR} />
                  <text x="-4" y="-40" fontFamily="Share Tech Mono" fontSize="9" fill={CHARCOAL} fontWeight="bold">N</text>
                </g>

                {/* Dotted route lines in select order */}
                {selectedVenuesInOrder.length > 1 && (
                  <path
                    d={`M ${selectedVenuesInOrder.map(v => `${v.projected.x} ${v.projected.y}`).join(' L ')}`}
                    fill="none"
                    className="custom-route-line"
                  />
                )}

                {/* Dynamic Venue Dots */}
                {venues.map((v, i) => {
                  const isSelected = selectedVenueIds.has(v.id);
                  const isCoop = v.venueType?.toUpperCase() === 'COOPERATIVE' || !v.averagePay?.includes("%");
                  const coords = getProjectedCoords(v, i);

                  return (
                    <g 
                      key={v.id}
                      onClick={() => toggleSelection(v.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? "9" : "6"}
                        fill={isSelected ? P : (isCoop ? C : OR)}
                        stroke={CHARCOAL}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? "15" : "11"}
                        fill="none"
                        stroke={isSelected ? P : (isCoop ? C : OR)}
                        strokeWidth="1"
                        opacity={isSelected ? "0.85" : "0.3"}
                      />
                      <text
                        x={coords.x + 11}
                        y={coords.y + 3}
                        fill={isSelected ? P : CHARCOAL}
                        fontFamily="Share Tech Mono, monospace"
                        fontSize="9"
                        fontWeight={isSelected ? "bold" : "normal"}
                        style={{ textShadow: '1px 1px 0px #faf9f5' }}
                      >
                        {v.name.slice(0, 12).toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Map Guide overlay */}
              <div style={{ position: 'absolute', bottom: '15px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', background: '#faf9f5', padding: '6px 12px', borderRadius: '4px', border: `1.5px solid ${BORDER_COLOR}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', color: CHARCOAL, fontWeight: 800 }}>COOPERATIVE</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: OR }} />
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', color: CHARCOAL, fontWeight: 800 }}>TRADITIONAL</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: P }} />
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', color: CHARCOAL, fontWeight: 800 }}>SELECTED</span>
                  </div>
                </div>

                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', color: '#555', background: '#faf9f5', padding: '6px 10px', borderRadius: '4px', border: `1.5px solid ${BORDER_COLOR}` }}>
                  💡 SELECT MARKERS TO MAP ROUTE
                </span>
              </div>
            </div>

            {/* Custom Route Stats Sheet */}
            {selectedVenueIds.size > 0 && (
              <div style={{ padding: '1.2rem', borderRadius: '8px', background: 'rgba(197,160,89,0.06)', border: `1.5px solid ${OR}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', fontWeight: 900, color: P }}>◈ ACTIVE ROUTING SHEET</span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: G, fontWeight: 800 }}>ROUTING COHERENT</span>
                </div>

                {/* Horizontal route draft */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '6px', marginBottom: '1rem' }}>
                  {selectedVenuesInOrder.map((v, i) => (
                    <div 
                      key={v.id} 
                      style={{ 
                        flexShrink: 0, 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        background: '#faf9f5', 
                        border: `1.5px solid ${v.venueType?.toUpperCase() === 'COOPERATIVE' ? C : BORDER_COLOR}`,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}
                    >
                      <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: '#888' }}>#{i+1}</span>
                      <strong style={{ fontSize: '0.75rem', color: CHARCOAL }}>{v.name}</strong>
                      <span style={{ fontSize: '0.62rem', color: '#555', fontFamily: 'Share Tech Mono' }}>{v.address?.split(',').slice(-2)[0]?.trim() || v.city}</span>
                      <button 
                        onClick={() => toggleSelection(v.id)}
                        style={{ border: 'none', background: 'none', color: PK, cursor: 'pointer', fontSize: '0.65rem', padding: 0 }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Combined specifications */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem', background: '#faf9f5', borderRadius: '4px', border: `1px solid ${BORDER_COLOR}` }}>
                    <span style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Share Tech Mono, monospace', color: '#555' }}>ROUTE LENGTH</span>
                    <span style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 900, color: C }}>
                      {selectedVenueIds.size} Outposts
                    </span>
                  </div>
                  <div style={{ padding: '0.6rem', background: '#faf9f5', borderRadius: '4px', border: `1px solid ${BORDER_COLOR}` }}>
                    <span style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Share Tech Mono, monospace', color: '#555' }}>AVERAGE ROUTE PAY</span>
                    <span style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 900, color: P }}>
                      $1,450 / Gig
                    </span>
                  </div>
                  <div style={{ padding: '0.6rem', background: '#faf9f5', borderRadius: '4px', border: `1px solid ${BORDER_COLOR}` }}>
                    <span style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Share Tech Mono, monospace', color: '#555' }}>COOPERATIVE RATIO</span>
                    <span style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 900, color: OR }}>
                      {Math.round((selectedVenuesInOrder.filter(v => v.venueType?.toUpperCase() === 'COOPERATIVE' || !v.averagePay?.includes("%")).length / selectedVenueIds.size) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ——— Right Column: Search Results & Detailed Cards List ——— */}
          <div className="flex flex-col gap-6">
            <div className="sketchbook-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.8rem', fontWeight: 'bold', color: CHARCOAL, letterSpacing: '0.08em' }}>GIG MATCHMAKER LIST</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.62rem', color: C, fontWeight: 800 }}>{venues.length} MATCHES</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#c5a059] animate-spin" />
                </div>
              ) : venues.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 border border-dashed border-[#d5cfbe] rounded-xl">
                  <Mic2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-xs">No active outposts found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '430px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scroll">
                  {venues.map((venue, idx) => {
                    const isSelected = selectedVenueIds.has(venue.id);
                    const isCooperative = venue.venueType?.toUpperCase() === 'COOPERATIVE' || !venue.averagePay?.includes("%");

                    return (
                      <div 
                        key={venue.id} 
                        style={{
                          borderLeft: `4px solid ${isCooperative ? C : P}`,
                          borderColor: isSelected ? OR : (isCooperative ? C : P),
                          background: isSelected ? 'rgba(197,160,89,0.04)' : 'rgba(44,44,40,0.015)'
                        }}
                        className={`p-5 rounded-lg border border-[#d5cfbe] transition-all duration-200 flex flex-col justify-between`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <div onClick={() => toggleSelection(venue.id)} style={{ cursor: 'pointer' }}>
                            <h4 style={{ fontSize: '0.98rem', color: CHARCOAL, margin: '0 0 2px 0', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
                              {venue.name}
                            </h4>
                            <span style={{ fontSize: '0.68rem', color: '#555', fontFamily: 'Share Tech Mono, monospace', fontWeight: 700 }}>
                              📍 {venue.address?.toUpperCase() || "UNKNOWN LOCATION"}
                            </span>
                          </div>

                          <span style={{
                            fontFamily: 'Share Tech Mono, monospace', fontSize: '0.52rem',
                            color: isCooperative ? C : P,
                            background: isCooperative ? 'rgba(95,138,107,0.08)' : 'rgba(178,83,41,0.08)',
                            border: `1.5px solid ${isCooperative ? C : P}`,
                            padding: '2px 8px', borderRadius: '4px', fontWeight: 800
                          }}>
                            {isCooperative ? "COOP OUTPOST" : "TRADITIONAL"}
                          </span>
                        </div>

                        {venue.bookingHistory && (
                          <p style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.4, marginBottom: '0.8rem' }}>{venue.bookingHistory}</p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.7rem', color: '#555', marginBottom: '1rem', borderTop: '1px solid rgba(44,44,40,0.05)', paddingTop: '0.5rem' }}>
                          {venue.phone && <div><strong>Phone:</strong> {venue.phone}</div>}
                          {venue.bookingEmail && <div><strong>Email:</strong> {venue.bookingEmail}</div>}
                          {venue.averagePay && <div><strong>Avg Pay:</strong> <span style={{ color: G, fontWeight: 'bold' }}>{venue.averagePay}</span></div>}
                          {venue.ageRequirement && <div><strong>Age:</strong> {venue.ageRequirement}</div>}
                        </div>

                        {/* Card actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => toggleSelection(venue.id)}
                            style={{ 
                              flex: 1, 
                              fontSize: '0.65rem', 
                              borderColor: isSelected ? P : BORDER_COLOR,
                              color: isSelected ? P : '#555',
                              background: isSelected ? 'rgba(178,83,41,0.04)' : '#faf9f5'
                            }}
                            className="filter-btn"
                          >
                            {isSelected ? '✓ REMOVE ROUTE' : '+ ADD TO ROUTE'}
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
                              background: CHARCOAL,
                              border: `1.5px solid ${CHARCOAL}`,
                              color: '#faf9f5',
                              fontWeight: 700,
                              fontSize: '0.68rem',
                              fontFamily: 'Share Tech Mono, monospace',
                              cursor: 'pointer'
                            }}
                          >
                            NEGOTIATE GIG <Sparkles size={11} fill="#faf9f5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Floating Action Bar for Bulk Booking (Vynl campaign launch synced) */}
      <AnimatePresence>
        {selectedVenueIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{ 
              background: '#faf9f5', 
              border: `1.5px solid ${BORDER_COLOR}`,
              boxShadow: '0 10px 30px rgba(197,160,89,0.15)'
            }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-4 rounded-full backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div style={{ background: P }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs">
                {selectedVenueIds.size}
              </div>
              <span className="font-bold text-[#2c2c2c] tracking-wide text-xs" style={{ fontFamily: 'Share Tech Mono, monospace' }}>OUTPOSTS ROUTED</span>
            </div>
            <div className="w-px h-8 bg-[#d5cfbe]"></div>
            <button 
              onClick={() => setShowBookingModal(true)}
              style={{ background: CHARCOAL, color: '#faf9f5' }}
              className="px-6 py-2 hover:opacity-90 rounded-full font-black text-xs flex items-center gap-2 uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5" /> Start Booking Campaign
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
              className="modal-sketch-box"
            >
              <button 
                onClick={() => setShowBookingModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-charcoal"
              >
                <X size={20} />
              </button>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.8rem', borderRadius: '4px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}`, marginBottom: '0.6rem' }}>
                <FileText size={12} color={P} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: P, fontWeight: 700 }}>◈ VYNL.PRO // CAMPAIGN ROUTER v2.4</span>
              </div>
              
              <h2 className="text-2xl font-black text-charcoal uppercase tracking-tighter mb-1" style={{ fontFamily: 'Cinzel, EB Garamond, serif' }}>Deploy Booking Campaign</h2>
              <p className="text-zinc-500 text-xs mb-8">You are about to launch automated pre-booking negotiations directly with {selectedVenueIds.size} venues simultaneously.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Target Dates / Routing Window</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mid-October 2026, Weekends"
                    className="w-full bg-[#f2eedf] border border-[#d5cfbe] rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:border-[#c5a059] transition-colors text-sm"
                    value={bookingDraft.dates}
                    onChange={(e) => setBookingDraft(prev => ({...prev, dates: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Pitch / Performance Specs</label>
                  <textarea 
                    placeholder="Introduce your act, draw, set lengths, and tech rider needs..."
                    className="w-full h-40 bg-[#f2eedf] border border-[#d5cfbe] rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:border-[#c5a059] transition-colors resize-none text-sm"
                    value={bookingDraft.message}
                    onChange={(e) => setBookingDraft(prev => ({...prev, message: e.target.value}))}
                  />
                </div>
                
                <button 
                  onClick={handleBulkBooking}
                  disabled={isSending || !bookingDraft.message || !bookingDraft.dates}
                  style={{ background: C, border: `2px solid ${C}` }}
                  className="w-full py-4 disabled:opacity-50 text-white font-black text-sm uppercase rounded-xl transition-all flex justify-center items-center gap-2 tracking-wider"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "DEPLOY DRAFT CAMPAIGN"}
                </button>
              </div>
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
              className="absolute top-6 right-6 text-zinc-500 hover:text-charcoal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem', borderBottom: `1.5px solid ${BORDER_COLOR}`, paddingBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.8rem', borderRadius: '4px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}`, marginBottom: '0.6rem' }}>
                <FileText size={12} color={P} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: P, fontWeight: 700 }}>◈ VYNL PRO CONTRACT BUILDER v1.2</span>
              </div>
              <h2 style={{ fontFamily: 'Cinzel, EB Garamond, serif', fontSize: '1.6rem', color: CHARCOAL, margin: '0 0 4px 0', fontWeight: 900 }}>
                Gig Negotiation Desk
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'Share Tech Mono, monospace', fontWeight: 700 }}>
                {bookingVenue.name} · {bookingVenue.address || bookingVenue.city}
              </span>
            </div>

            {/* Main simulator parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.8rem', marginBottom: '1.5rem' }}>
              
              {/* Parameter Settings */}
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 800, color: CHARCOAL, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={14} color={OR} /> NEGOTIATION TERMS
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Select show date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: '#555550', fontWeight: 700, marginBottom: '0.3rem' }}>CHOOSE PERFORMANCE DATE</label>
                    <select
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      disabled={isContractSigned}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1.5px solid #d5cfbe',
                        background: '#faf9f5',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: '#555550', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span>TICKET COVER PRICE</span>
                      <strong style={{ color: P }}>${ticketPrice}</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="1"
                      value={ticketPrice}
                      onChange={e => setTicketPrice(Number(e.target.value))}
                      disabled={isContractSigned}
                      style={{ width: '100%', accentColor: P }}
                    />
                  </div>

                  {/* Slider: Expected Attendance */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: '#555550', fontWeight: 700, marginBottom: '0.2rem' }}>
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
                    <span style={{ display: 'block', fontSize: '0.55rem', color: '#888', marginTop: '2px', textAlign: 'right' }}>Standard Draw Cap: 250</span>
                  </div>

                  {/* Rider Toggles */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', color: '#555550', fontWeight: 700, marginBottom: '0.4rem' }}>CONTRACT RIDER TOGGLES</span>
                    
                    <div 
                      onClick={() => !isContractSigned && setCateringSelected(!cateringSelected)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      <div style={{
                        width: 13, height: 13, borderRadius: '2px',
                        border: `1.5px solid ${cateringSelected ? P : '#d5cfbe'}`,
                        display: 'flex', alignItems: 'center',
                        background: cateringSelected ? P : 'transparent',
                      }}>
                        {cateringSelected && <Check size={9} color="#faf9f5" strokeWidth={4} style={{ margin: 'auto' }} />}
                      </div>
                      <span style={{ color: CHARCOAL }}>Green Room Catering (cooperative covers meal for free!)</span>
                    </div>

                    <div 
                      onClick={() => !isContractSigned && setSoundEngSelected(!soundEngSelected)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      <div style={{
                        width: 13, height: 13, borderRadius: '2px',
                        border: `1.5px solid ${soundEngSelected ? P : '#d5cfbe'}`,
                        display: 'flex', alignItems: 'center',
                        background: soundEngSelected ? P : 'transparent',
                      }}>
                        {soundEngSelected && <Check size={9} color="#faf9f5" strokeWidth={4} style={{ margin: 'auto' }} />}
                      </div>
                      <span style={{ color: CHARCOAL }}>Dedicated Front-of-House Engineer ($120 fee)</span>
                    </div>

                    <div 
                      onClick={() => !isContractSigned && setLocalTransportSelected(!localTransportSelected)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      <div style={{
                        width: 13, height: 13, borderRadius: '2px',
                        border: `1.5px solid ${localTransportSelected ? P : '#d5cfbe'}`,
                        display: 'flex', alignItems: 'center',
                        background: localTransportSelected ? P : 'transparent',
                      }}>
                        {localTransportSelected && <Check size={9} color="#faf9f5" strokeWidth={4} style={{ margin: 'auto' }} />}
                      </div>
                      <span style={{ color: CHARCOAL }}>Ground Transport Shuttle ($150 fee)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Math Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(44,44,40,0.02)', padding: '1.2rem', borderRadius: '8px', border: `1.5px solid ${BORDER_COLOR}` }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 800, color: CHARCOAL, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} color={C} /> FINANCIAL MATRIX
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>Gross Ticket Sales:</span>
                    <strong style={{ color: CHARCOAL }}>${grossSales.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>Venue Platform Cut:</span>
                    <strong style={{ color: PK }}>-${venueCut}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>Technical Specs Rider:</span>
                    <strong style={{ color: PK }}>-${totalExpenses}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0' }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#555550', fontWeight: 700 }}>ESTIMATED NET PAYOUT</span>
                  <span style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: C }}>
                    ${estimatedPayout.toLocaleString()}
                  </span>
                </div>

                {isCooperative ? (
                  <div style={{ padding: '8px', background: 'rgba(95,138,107,0.08)', border: `1px solid ${C}`, borderRadius: '4px', fontSize: '0.65rem', color: G, lineHeight: 1.3 }}>
                    🚀 <strong>Cooperative Outpost Advantage:</strong> Direct door cover matches net you <strong>100%</strong> of door sales, saving you <strong>+${Math.round(grossSales * 0.20)}</strong> over commercial models!
                  </div>
                ) : (
                  <div style={{ padding: '8px', background: 'rgba(197,160,89,0.08)', border: `1px solid ${OR}`, borderRadius: '4px', fontSize: '0.65rem', color: '#6b542c', lineHeight: 1.3 }}>
                    ⚠️ <strong>Traditional Venue Policy:</strong> Traditional clubs charge a standard 20% commission on door cover to offset local building rent & operations.
                  </div>
                )}
              </div>

            </div>

            {/* Digital Signature Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: `1.5px solid ${BORDER_COLOR}`, paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: CHARCOAL, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <PenTool size={12} color={P} /> SIGN DRAFT AGREEMENT BELOW
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
                    background: '#faf9f5',
                    zIndex: 10,
                    opacity: 0.85
                  }}>
                    ◈ CONTRACT SEALED ◈
                  </div>

                  <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.4rem' }}>🤝</span>
                  <strong style={{ display: 'block', color: G, fontSize: '0.9rem', fontFamily: 'Outfit', fontWeight: 800 }}>CAMPAIGN SIGNED &amp; BROADCAST ON THE VYNL EDGE NETWORK</strong>
                  <span style={{ display: 'block', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#555', marginTop: '4px' }}>
                    TIMESTAMP RECORDED: {new Date().toLocaleDateString()} // {bookingDate} PERFORMANCE SEALED
                  </span>
                  
                  <div style={{ marginTop: '1.2rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setBookingVenue(null)}
                      className="filter-btn active"
                      style={{ fontSize: '0.68rem', padding: '0.5rem 1.4rem' }}
                    >
                      CLOSE NEGOTIATION DESK
                    </button>
                    <button
                      onClick={() => setIsContractSigned(false)}
                      className="filter-btn"
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
                      className="filter-btn"
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
