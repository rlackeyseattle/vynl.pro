"use client";

import { motion } from "framer-motion";
import { SearchFilters } from "@/components/SearchFilters";
import { MapPin, Phone, Mail, DollarSign, Calendar, ShieldCheck, ChevronRight } from "lucide-react";

// Mock data for the "White-Pages" directory
const venues = [
  {
    id: "1",
    name: "The Electric Lounge",
    address: "123 Main St, Seattle, WA 98101",
    phone: "(206) 555-0123",
    email: "booking@electriclounge.com",
    age: "21+",
    pay: "$$ - $$$",
    claimed: true,
    image: "https://images.unsplash.com/photo-1514525253361-bee8a1874a1e?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Backstage Beer Garden",
    address: "456 Oak Ave, Portland, OR 97201",
    phone: "(503) 555-0456",
    email: "events@backstagepdx.com",
    age: "All Ages",
    pay: "$",
    claimed: false,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Vibration Hall",
    address: "789 Pine Rd, Austin, TX 78701",
    phone: "(512) 555-0789",
    email: "gig@vibrationatx.com",
    age: "18+",
    pay: "$$$",
    claimed: false,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function VenuesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <section className="bg-zinc-900/30 border-b border-zinc-800 py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tight">VENUE DIRECTORY</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            The most comprehensive database of live music centers and bars. 
            Pre-populated booking data for local and touring acts.
          </p>
          <div className="pt-8">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Venue List */}
      <section className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 gap-6">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </div>
  );
}

function VenueCard({ venue }: { venue: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-3xl overflow-hidden border border-zinc-800/50 flex flex-col md:flex-row group hover:border-indigo-500/30 transition-all"
    >
      <div className="w-full md:w-72 h-48 md:h-auto relative overflow-hidden">
        <img 
          src={venue.image} 
          alt={venue.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!venue.claimed && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
            Unclaimed
          </div>
        )}
      </div>

      <div className="flex-1 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-black tracking-tight group-hover:text-indigo-400 transition-colors">{venue.name}</h3>
            <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {venue.address}
            </div>
          </div>
          
          <div className="flex gap-2">
            {venue.claimed ? (
              <button className="px-6 py-2 bg-zinc-800 rounded-full text-xs font-black text-zinc-400 cursor-not-allowed border border-zinc-700">
                ALREADY CLAIMED
              </button>
            ) : (
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-black transition-all shadow-lg shadow-indigo-600/20">
                CLAIM THIS VENUE
              </button>
            )}
            <button className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-zinc-800/50">
          <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={venue.phone} />
          <InfoItem icon={<Mail className="w-4 h-4" />} label="Booking" value={venue.email} />
          <InfoItem icon={<ShieldCheck className="w-4 h-4" />} label="Age" value={venue.age} />
          <InfoItem icon={<DollarSign className="w-4 h-4" />} label="Avg Pay" value={venue.pay} />
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="text-sm font-bold text-zinc-300">{value}</div>
    </div>
  );
}
