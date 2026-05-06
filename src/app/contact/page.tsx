"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-2xl rounded-3xl p-8 md:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10 space-y-8 text-center">
          <div>
            <h1 className="text-5xl font-black mb-4">GET IN TOUCH</h1>
            <p className="text-zinc-400">Questions about your profile or claiming a venue?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactCard 
              icon={<Mail className="w-6 h-6 text-pink-500" />}
              label="Email Support"
              value="rlackey.seattle@gmail.com"
            />
            <ContactCard 
              icon={<Phone className="w-6 h-6 text-indigo-500" />}
              label="Direct Text"
              value="406-210-0305"
            />
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-center justify-center gap-3 text-zinc-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Kalispell, MT</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-zinc-500">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Rocket Tree Labs LLC</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-600/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />
      </motion.div>
    </div>
  );
}

function ContactCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-pink-500/30 transition-all text-center space-y-2">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
