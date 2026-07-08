"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  DollarSign, 
  Search, 
  Filter, 
  Loader2, 
  ExternalLink, 
  Mic2, 
  Sliders,
  Check,
  Zap,
  Globe,
  Radio
} from "lucide-react";
import Link from "next/link";

/* Icon SVG components mirroring ProfileClient */
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.895-.98-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.743 3.856-.88 7.15-.502 9.822 1.13.296.18.387.563.207.857zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.848-.107-.973-.52-.125-.413.108-.847.52-.973 3.67-1.114 8.24-.57 11.35 1.344.366.226.486.707.26 1.072zm.105-2.833C14.383 8.8 8.44 8.604 5.005 9.647c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.963-1.202 10.518-.973 14.58 1.44.475.282.63.897.35 1.37-.28.472-.895.63-1.37.35z"/>
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.29 14.3c-.22.13-.5.06-.63-.16l-1.92-3.15c-.13-.22-.38-.36-.64-.36h-1.6v2.17c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6.6c0-.28.22-.5.5-.5h2.6c1.27 0 2.3 1.03 2.3 2.3 0 .85-.46 1.59-1.14 1.98l1.96 3.22c.13.22.06.5-.16.63zm-3.29-6.3h-1.6v1.8h1.6c.72 0 1.3-.58 1.3-1.3s-.58-1.3-1.3-1.3z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.882.51 9.387.51 9.387.51s7.505 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const P = '#b25329';   // Burnt rust/brick
const C = '#5f8a6b';   // Technical sage
const OR = '#c5a059';  // Drawing gold

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

export default function BandsPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("");
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
    if (genre) params.set("genre", genre);
    if (type) params.set("coverOrOriginal", type);

    fetch(`/api/bands/list?${params}`)
      .then(r => r.json())
      .then(data => { setBands(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedSearch, state, genre, type]);

  return (
    <div className="w-full bg-zinc-950 min-h-screen text-zinc-100 selection:bg-[#c5a059]/30">
      
      <section className="border-b border-zinc-900 py-14 relative overflow-hidden bg-zinc-950">
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,160,89,0.03) 0%, transparent 70%)', filter: 'blur(60px)', top: '-10%', left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.02) 0%, transparent 70%)', filter: 'blur(80px)', bottom: '-15%', right: '10%', pointerEvents: 'none' }} />
        
        <div className="container mx-auto px-6 space-y-4 relative z-10">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div className="space-y-4">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 1.1rem', borderRadius: '100px', background: 'rgba(197,160,89,0.08)', border: `1.5px solid ${OR}` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899' }} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em', color: OR, fontWeight: 700 }}>◈ VYNL.PRO // ARTIST ROSTER</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                The Artist Grid
              </h1>
            </div>
          </div>

          <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
            {bands.length > 0 ? `${bands.length} active touring acts` : "Connecting to Vynl artist networks..."} — Scout verified performers, inspect technical gig riders, check local draw projections, and book directly.
          </p>

          {/* Search & Dynamic Filters Deck */}
          <div className="flex flex-col lg:flex-row gap-3 max-w-5xl pt-6">
            <div className="relative flex-[1.8]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search bands by name, city, state..."
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
                <option value="">Any Show Type</option>
                <option value="ORIGINAL">Original Acts</option>
                <option value="COVER">Cover Bands</option>
                <option value="BOTH">Originals & Covers</option>
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
        ) : bands.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-sm">No active touring artists found matching your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Group bands by state */}
            {(() => {
              const getBandState = (b: any) => {
                if (!b.location) return "OTHER";
                const match = b.location.match(/,\s*([A-Z]{2})\b/i);
                return match ? match[1].toUpperCase() : "OTHER";
              };

              const grouped: Record<string, any[]> = {};
              bands.forEach(b => {
                const s = getBandState(b);
                if (!grouped[s]) grouped[s] = [];
                grouped[s].push(b);
              });

              // Sort states alphabetically
              const sortedStates = Object.keys(grouped).sort((a, b) => {
                if (a === "OTHER") return 1;
                if (b === "OTHER") return -1;
                const nameA = STATE_NAMES[a] || a;
                const nameB = STATE_NAMES[b] || b;
                return nameA.localeCompare(nameB);
              });

              return sortedStates.map(stateCode => {
                const stateBands = grouped[stateCode];
                const stateName = STATE_NAMES[stateCode] || stateCode;

                return (
                  <div key={stateCode} className="flex flex-col gap-6">
                    <div className="border-b border-zinc-800/80 pb-2 flex items-center justify-between">
                      <h3 className="font-black text-white text-lg tracking-tighter uppercase font-sans flex items-center gap-2">
                        <span>{stateName.toUpperCase()}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(197,160,89,0.12)', border: `1px solid ${OR}`, padding: '2px 8px', borderRadius: '4px', color: OR, fontFamily: 'Share Tech Mono' }}>
                          {stateBands.length} {stateBands.length === 1 ? 'ARTIST' : 'ARTISTS'}
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stateBands.map(band => {
                        const bandName = band.user?.name || "UNNAMED ARTIST";
                        const showTypeLabel = band.coverOrOriginal === "BOTH" 
                          ? "ORIGINAL & COVERS" 
                          : band.coverOrOriginal === "ORIGINAL" 
                            ? "ORIGINALS" 
                            : band.coverOrOriginal === "COVER" 
                              ? "COVERS" 
                              : "PERFORMER";

                        return (
                          <div 
                            key={band.id} 
                            style={{
                              borderLeft: `4px solid ${band.coverOrOriginal === 'ORIGINAL' ? C : (band.coverOrOriginal === 'BOTH' ? OR : P)}`,
                              background: 'rgba(24,24,27,0.4)'
                            }}
                            className="p-5 rounded-lg border border-zinc-85 transition-all duration-200 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  {band.profileImage ? (
                                    <img 
                                      src={band.profileImage} 
                                      alt={bandName} 
                                      className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                                      {bandName.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-black text-white text-base tracking-tight mb-0.5">
                                      {bandName}
                                    </h4>
                                    <span className="text-xs text-zinc-400 font-mono">
                                      📍 {band.location?.toUpperCase() || "UNKNOWN LOCATION"}
                                    </span>
                                  </div>
                                </div>

                                <span style={{
                                  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.52rem',
                                  color: band.coverOrOriginal === 'ORIGINAL' ? C : (band.coverOrOriginal === 'BOTH' ? OR : P),
                                  background: 'rgba(255,255,255,0.02)',
                                  border: `1.5px solid ${band.coverOrOriginal === 'ORIGINAL' ? C : (band.coverOrOriginal === 'BOTH' ? OR : P)}`,
                                  padding: '2px 8px', borderRadius: '4px', fontWeight: 800
                                }}>
                                  {showTypeLabel}
                                </span>
                              </div>

                              {band.bio && (
                                <p className="text-xs text-zinc-400 leading-relaxed my-3 line-clamp-3">{band.bio}</p>
                              )}

                              <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 my-4 border-t border-zinc-800/60 pt-3">
                                <div><strong className="text-zinc-500">Genre:</strong> {band.genre || "N/A"}</div>
                                {isAuthenticated ? (
                                  <>
                                    <div><strong className="text-zinc-500">Exp. Draw:</strong> {band.expectedDraw ? `${band.expectedDraw} fans` : "N/A"}</div>
                                    <div><strong className="text-zinc-500">Min Pay:</strong> <span style={{ color: C, fontWeight: 'bold' }}>{band.minimumGuarantee ? `$${band.minimumGuarantee}` : "Negotiable"}</span></div>
                                    <div><strong className="text-zinc-500">Touring:</strong> {band.isTouring ? "Yes" : "Local Only"}</div>
                                  </>
                                ) : (
                                  <div className="col-span-2 py-1 flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono">
                                    <span>🔒 Register to unlock draw & minimum guarantee stats</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card actions */}
                            <div className="flex gap-2 items-center border-t border-zinc-800/40 pt-3 mt-2">
                              <div className="flex gap-1.5 mr-auto">
                                {band.spotifyUrl && (
                                  <a href={band.spotifyUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-400 transition-colors">
                                    <SpotifyIcon />
                                  </a>
                                )}
                                {band.appleMusicUrl && (
                                  <a href={band.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-pink-400 transition-colors">
                                    <AppleMusicIcon />
                                  </a>
                                )}
                                {band.youtubeUrl && (
                                  <a href={band.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                                    <YoutubeIcon />
                                  </a>
                                )}
                              </div>

                              <Link
                                href={band.slug ? `/${band.slug}` : `/profiles/${band.id}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.3rem',
                                  padding: '0.55rem 1rem',
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
                                VIEW EPK <ExternalLink size={10} />
                              </Link>
                            </div>
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

    </div>
  );
}
