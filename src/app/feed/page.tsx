"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Calendar, MapPin, Clock, DollarSign, ChevronRight, Loader2, Play, Activity } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const [feed, setFeed] = useState<{date: string, events: any[]}>({ date: "", events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed/today")
      .then(r => r.json())
      .then(data => {
        setFeed(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <section className="relative py-20 border-b border-zinc-800/60 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs uppercase tracking-widest mx-auto">
            <Radio className="w-4 h-4 animate-pulse" /> Live Circuit Feed
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            Tonight on the Circuit
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg">
            {feed.date ? feed.date : "Loading today's schedule..."}
          </p>
        </div>
      </section>

      {/* Feed Timeline */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-cyan-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold tracking-widest uppercase text-xs">Syncing RSS Feeds...</p>
          </div>
        ) : feed.events.length === 0 ? (
          <div className="text-center py-32 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold">No events detected on the network tonight.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            {feed.events.map((evt, i) => (
              <motion.div 
                key={evt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0f] bg-zinc-900 group-hover:bg-cyan-500 text-zinc-500 group-hover:text-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                
                {/* Event Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all shadow-lg backdrop-blur-sm group-hover:-translate-y-1 group-hover:shadow-cyan-500/10 cursor-pointer">
                  <Link href={`/profiles/${evt.venueId}`} className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2 py-1 rounded">
                        {evt.genre}
                      </span>
                      <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {evt.time}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-white leading-tight mb-3 group-hover:text-cyan-400 transition-colors">
                      {evt.title}
                    </h3>
                    
                    <div className="space-y-2 pt-3 border-t border-zinc-800/60">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span className="truncate">{evt.venueName} <span className="text-zinc-600 ml-1">• {evt.location}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>{evt.compensation}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
