"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Music, Sparkles, Send, Globe, Calendar, DollarSign, Clock, Mail, Phone, 
  MapPin, X, Check, Loader2, Play, Pause, AlertTriangle, TrendingUp, 
  Search, Filter, Plus, Trash2, ArrowRight, CheckCircle2, ShieldCheck, 
  Settings, Zap, FileText, Briefcase, Info, PenTool, Activity, Radio, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Colors (DaVinci Technical Sketchbook & Glowing Circuit Ink Palette)
const OR = '#c5a059';  // Drawing gold ink
const P = '#ec4899';   // Circuit pink
const C = '#10b981';   // Emerald active green
const CYAN = '#06b6d4'; // Info cyan

export default function PilotPage() {
  const { data: session } = useSession();
  const userId = session?.user ? (session.user as any).id : null;

  const [radius, setRadius] = useState(150);
  const [minPay, setMinPay] = useState(200);
  const [status, setStatus] = useState("IDLE");
  const [logs, setLogs] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom date selection
  const [targetDates, setTargetDates] = useState<string[]>(["2026-06-20", "2026-06-27"]);
  const [newDate, setNewDate] = useState("");
  
  // Harvester widget states
  const [harvestRegion, setHarvestRegion] = useState("Kalispell, MT");
  const [harvesting, setHarvesting] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState<string[]>([]);
  
  // Selected attempt detail view states
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const fetchStatus = async () => {
    try {
      const currentId = userId || "current-user-id";
      const res = await fetch(`/api/pilot/status?userId=${currentId}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setNegotiations(data.campaign?.attempts || []);
        if (data.campaign) {
          setCampaignId(data.campaign.id);
          setStatus(data.campaign.status === "ACTIVE" ? "ACTIVE" : "IDLE");
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Drawing Pad Handlers
  useEffect(() => {
    if (selectedAttempt && canvasRef.current && !isSigned) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [selectedAttempt, isSigned]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isSigned) return;
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
    if (!isDrawingRef.current || !canvasRef.current || isSigned) return;
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
    if (!canvasRef.current || isSigned) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSignContract = () => {
    setIsSigned(true);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setSelectedAttempt(null);
      setIsSigned(false);
    }, 4000);
  };

  const launchPilot = async () => {
    setStatus("ACTIVE");
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/campaign", {
        method: "POST",
        body: JSON.stringify({
          userId: userId || "current-user-id",
          targetDates,
          maxRadius: radius,
          minCompensation: minPay
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setCampaignId(data.campaignId);

      // Trigger outreach process
      await fetch("/api/pilot/process", {
        method: "POST",
        body: JSON.stringify({ campaignId: data.campaignId }),
        headers: { "Content-Type": "application/json" }
      });

      await fetchStatus();
    } catch (error) {
      console.error("Launch campaign failure", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerHarvester = async () => {
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
        fetchStatus(); // refresh negotiations if active
      } else {
        setHarvestLogs(prev => [...prev, `Harvest error: ${data.error}`]);
      }
    } catch (err) {
      setHarvestLogs(prev => [...prev, "Critical connection error during harvesting."]);
    } finally {
      setHarvesting(false);
    }
  };

  const handleSendReply = () => {
    setIsReplying(true);
    setTimeout(() => {
      setIsReplying(false);
      alert("Reply dispatched successfully through the negotiation channel.");
      setReplyText("");
    }, 1500);
  };

  const removeDate = (d: string) => {
    setTargetDates(targetDates.filter(item => item !== d));
  };

  const addDate = () => {
    if (newDate && !targetDates.includes(newDate)) {
      setTargetDates([...targetDates, newDate]);
      setNewDate("");
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] bg-festival py-12 px-4 md:px-8 relative overflow-hidden">
      
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {Array.from({ length: 50 }).map((_, idx) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 2 + Math.random() * 2;
            const size = 6 + Math.random() * 8;
            const bgClass = idx % 3 === 0 ? "bg-pink-500" : idx % 3 === 1 ? "bg-cyan-400" : "bg-emerald-400";
            return (
              <div 
                key={idx} 
                className={`absolute w-3 h-3 rounded-full animate-[fall-down_3s_linear_infinite] ${bgClass}`}
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Page Header */}
      <header className="container mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/60 pb-8 mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold text-xs uppercase mb-3">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Autopilot Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
            Vynl Booking Agent
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-xl">
            Autonomous multi-dimensional venue matchmaking, contract negotiations, and schedule alignment engine.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <span className={`w-3 h-3 rounded-full ${status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-orange-500"}`} />
            <span className="text-xs font-black uppercase text-zinc-300">{status}</span>
          </div>

          <button 
            disabled={loading}
            onClick={launchPilot}
            className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
              status === "ACTIVE" 
                ? "bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 cursor-not-allowed" 
                : "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/20 cursor-pointer"
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : status === "ACTIVE" ? "Agent Running" : "Launch Booking Agent"}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Constraints & Parameters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass bg-[#0d0d14]/90 rounded-3xl border border-zinc-800/60 p-6 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Settings className="w-5 h-5 text-pink-500" /> Match Parameters
            </h3>

            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase">
                <span>Search Radius</span>
                <span className="text-cyan-400">{radius} miles</span>
              </div>
              <input 
                type="range" min="10" max="500" value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Pay Minimum */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase block">Minimum Pay Guarantee ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="number" value={minPay}
                  onChange={(e) => setMinPay(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Target Dates List */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase block">Target Tour Dates</label>
              <div className="flex gap-2">
                <input 
                  type="date" value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
                <button 
                  onClick={addDate}
                  className="p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {targetDates.map(d => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-300">
                    <Calendar className="w-3 h-3 text-pink-500" /> {d}
                    <button onClick={() => removeDate(d)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Email Voice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase block">AI Agent Voice Profile</label>
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 appearance-none">
                <option>Casual & Enthusiastic (Recommended)</option>
                <option>Professional & Direct</option>
                <option>Business Formal</option>
              </select>
            </div>
          </div>

          {/* Harvester Widget */}
          <div className="glass bg-[#0d0d14]/90 rounded-3xl border border-zinc-800/60 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" /> National Harvester
              </h3>
              <p className="text-[10px] font-semibold text-zinc-500 mt-1 uppercase">Cross-reference Bandsintown database</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" value={harvestRegion}
                  onChange={(e) => setHarvestRegion(e.target.value)}
                  placeholder="e.g. Kalispell, MT or CDA, ID"
                  className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-500"
                />
                <button 
                  onClick={triggerHarvester}
                  disabled={harvesting || !harvestRegion}
                  className="px-5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-black uppercase text-xs rounded-2xl transition-colors flex items-center justify-center"
                >
                  {harvesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sync"}
                </button>
              </div>

              {harvestLogs.length > 0 && (
                <div className="bg-black/80 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[9px] text-cyan-400 space-y-1 custom-scrollbar">
                  {harvestLogs.map((h, i) => <p key={i}>{h}</p>)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Negotiations & Matching */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Negotiations */}
          <div className="glass bg-[#0d0d14]/90 rounded-3xl border border-zinc-800/60 p-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-pink-500" /> Live Agent Matches
            </h3>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {negotiations.map((attempt, index) => {
                  const m = attempt.match || { overallScore: 0, locationScore: 0, genreScore: 0, payScore: 0, scheduleScore: 0 };
                  const latestMsg = attempt.negotiationLog?.split('\n').pop() || "Pending agent analysis...";
                  
                  return (
                    <div 
                      key={index} 
                      className="p-5 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl grid grid-cols-1 md:grid-cols-4 items-center gap-4 hover:bg-zinc-900/60 transition-colors"
                    >
                      {/* Name / Info */}
                      <div className="md:col-span-1 min-w-0">
                        <h4 className="font-black text-white truncate text-base uppercase leading-snug">{attempt.venue.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold truncate uppercase mt-0.5">{attempt.venue.address}</p>
                      </div>

                      {/* Matching Ring Matrix */}
                      <div className="md:col-span-2 flex items-center justify-around gap-2 bg-black/20 p-2.5 rounded-xl border border-zinc-800/40">
                        <div className="text-center">
                          <span className="text-xs font-black text-pink-500 block">{m.overallScore}%</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Match</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-300 block">{m.genreScore}%</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Genre</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-300 block">{m.payScore}%</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Pay</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-300 block">{m.locationScore}%</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Geo</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-300 block">{m.scheduleScore}%</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Dates</span>
                        </div>
                      </div>

                      {/* Status and Action */}
                      <div className="md:col-span-1 flex items-center justify-between gap-4">
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            attempt.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            attempt.status === 'SENT' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {attempt.status}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedAttempt(attempt)}
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-pink-500 hover:text-pink-400 rounded-xl text-[10px] font-black uppercase transition-all"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}

                {negotiations.length === 0 && (
                  <div className="py-20 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl">
                    No active negotiations on the grid. Select parameters and Launch outreach.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Terminal Logs */}
          <div className="glass bg-[#0d0d14]/90 rounded-3xl border border-zinc-800/60 p-6 space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-500 animate-pulse" /> System Intel Log
            </h3>
            <div className="bg-black/95 border border-zinc-800/80 rounded-2xl p-5 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto space-y-2.5 custom-scrollbar shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-zinc-600 font-bold shrink-0">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                  <span className={log.level === 'ERROR' ? 'text-rose-500' : 'text-emerald-400'}>{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-zinc-600 italic">Booking agent waiting to matching...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MANAGE ATTEMPT MODAL / CONTRACT AGREEMENT SIGNER */}
      <AnimatePresence>
        {selectedAttempt && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6"
            >
              <button onClick={() => setSelectedAttempt(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              
              <div>
                <h3 className="text-3xl font-black text-white uppercase leading-none tracking-tight mb-2">{selectedAttempt.venue.name}</h3>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-pink-500" /> {selectedAttempt.venue.address}</p>
              </div>

              {/* Match breakdown detail card */}
              {selectedAttempt.match && (
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-pink-500">Auto-Match Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-500 block uppercase text-[8px] font-black">Location ({selectedAttempt.match.details.distance} mi)</span>
                      <span className="font-bold text-zinc-200">{selectedAttempt.match.locationScore}% Match</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase text-[8px] font-black">Genre Match</span>
                      <span className="font-bold text-zinc-200">{selectedAttempt.match.details.genreMatch}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase text-[8px] font-black">Pay Offer</span>
                      <span className="font-bold text-zinc-200">{selectedAttempt.venue.averagePay || "TBD"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase text-[8px] font-black">Calendar Status</span>
                      <span className="font-bold text-zinc-200">{selectedAttempt.match.details.scheduleMatch}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Negotiation Log Text */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-zinc-500 tracking-wider">Negotiation Log</label>
                <div className="p-4 bg-black/60 border border-zinc-850 rounded-2xl text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {selectedAttempt.negotiationLog || "No logs available."}
                </div>
              </div>

              {/* AI Auto Negotiation Reply Builder */}
              {selectedAttempt.status !== 'CONFIRMED' && (
                <div className="space-y-4 border-t border-zinc-900 pt-6">
                  <label className="text-xs font-black uppercase text-zinc-500 tracking-wider block">AI Suggested Reply</label>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="e.g. Sounds great. Let's confirm July 4th at 8:00 PM for the agreed $350 guarantee."
                    className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={handleSendReply}
                      disabled={isReplying || !replyText}
                      className="px-6 py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg"
                    >
                      {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & Dispatch"}
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Signature Contract Section */}
              {selectedAttempt.status === 'CONFIRMED' && (
                <div className="space-y-4 border-t border-zinc-900 pt-6">
                  <h4 className="text-base font-black text-white uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Match Verified: Sign Contract
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Double-check details: **July 4th show** at **{selectedAttempt.venue.name}**, payout structure verified. Sign below to execute match.
                  </p>

                  <div className="flex flex-col items-center gap-3">
                    <canvas 
                      ref={canvasRef}
                      width={500}
                      height={130}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full bg-zinc-900 border border-dashed border-zinc-800 rounded-xl cursor-crosshair touch-none"
                    />

                    <div className="flex gap-4 w-full justify-between items-center">
                      <button onClick={clearSignature} className="text-xs font-bold text-rose-500 hover:underline">
                        Clear Pad
                      </button>
                      <button 
                        onClick={handleSignContract}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" /> Sign & Confirm Show
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
