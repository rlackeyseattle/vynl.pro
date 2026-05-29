"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Calendar, MapPin, Clock, DollarSign, Loader2, Play, Activity, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

interface EventItem {
  id: string;
  venueId: string;
  venueName: string;
  location: string;
  title: string;
  genre: string;
  time: string;
  rawDate: string;
  compensation: string;
  description: string;
}

interface FeedData {
  date: string;
  today: EventItem[];
  upcoming: EventItem[];
}

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedData>({ date: "", today: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming">("today");

  useEffect(() => {
    fetch("/api/feed/today")
      .then((r) => r.json())
      .then((data) => {
        setFeed({
          date: data.date || "",
          today: Array.isArray(data.today) ? data.today : [],
          upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
        });
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const activeEvents = activeTab === "today" ? feed.today : feed.upcoming;

  return (
    <div className="min-h-screen bg-[#06060a] pb-32">
      {/* Header */}
      <section className="relative py-24 border-b border-zinc-900/80 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-pink-500/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold text-xs uppercase tracking-widest mx-auto">
            <Radio className="w-4 h-4 animate-pulse text-pink-500" /> Real-time RSS Event Aggregator
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            Live on the Circuit
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            {feed.date ? `${feed.date} — compiled live from active venue RSS event feeds across Washington, Idaho, and Montana.` : "Syncing venue schedules..."}
          </p>

          {/* Premium Tab Switcher */}
          <div className="flex justify-center pt-8">
            <div className="relative flex p-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab("today")}
                className={`relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors z-10 flex items-center gap-2 ${
                  activeTab === "today" ? "text-black font-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Radio className="w-4 h-4" /> Tonight ({feed.today.length})
                {activeTab === "today" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors z-10 flex items-center gap-2 ${
                  activeTab === "upcoming" ? "text-black font-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" /> Upcoming ({feed.upcoming.length})
                {activeTab === "upcoming" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feed List */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-pink-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold tracking-widest uppercase text-xs">Parsing XML Feeds...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="text-center py-32 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold">No shows detected in this category today.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {activeEvents.map((evt, i) => (
                  <div
                    key={evt.id}
                    className="group relative bg-zinc-950/40 border border-zinc-900 hover:border-pink-500/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_0_35px_rgba(236,72,153,0.05)] hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Badge / Metadata */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black tracking-widest text-pink-400 uppercase bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20">
                          {evt.genre}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-600" /> {evt.time}
                        </span>
                      </div>

                      {/* Title & Info */}
                      <div>
                        <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-pink-400 transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    {/* Venue Spotlight Dock */}
                    <div className="mt-6 pt-4 border-t border-zinc-900/80 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium truncate pl-5">
                          {evt.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> {evt.compensation}
                        </span>
                        <Link
                          href={`/profiles/${evt.venueId}`}
                          className="p-2 bg-zinc-900 hover:bg-pink-500 text-zinc-400 hover:text-white rounded-xl transition-all hover:scale-105 border border-zinc-800"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
