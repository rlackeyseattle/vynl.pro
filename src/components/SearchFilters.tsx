"use client";

import { Search, MapPin, Music, DollarSign } from "lucide-react";
import { useState } from "react";

export function SearchFilters() {
  const [activeTab, setActiveTab] = useState<"bands" | "venues">("bands");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex justify-center">
        <div className="flex bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
          <button
            onClick={() => setActiveTab("bands")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === "bands"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Bands & Artists
          </button>
          <button
            onClick={() => setActiveTab("venues")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === "venues"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Music Venues
          </button>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl space-y-4 border border-zinc-800/50 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder={activeTab === "bands" ? "Band name or genre..." : "Venue name..."}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Zip Code / City"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm appearance-none focus:ring-2 focus:ring-pink-500 transition-all text-zinc-400">
              <option>All Genres</option>
              <option>Rock</option>
              <option>Hip Hop</option>
              <option>Electronic</option>
              <option>Jazz</option>
              <option>Country</option>
            </select>
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm appearance-none focus:ring-2 focus:ring-pink-500 transition-all text-zinc-400">
              <option>Comp. Range</option>
              <option>$0 - $500</option>
              <option>$500 - $2000</option>
              <option>$2000+</option>
            </select>
          </div>
        </div>
        
        <button className="w-full py-4 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-indigo-600 rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-pink-600/20 active:scale-[0.98]">
          SEARCH THE ECOSYSTEM
        </button>
      </div>
    </div>
  );
}
