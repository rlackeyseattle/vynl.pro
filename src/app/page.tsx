"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { 
  Play, 
  ChevronRight, 
  Sliders, 
  MapPin, 
  Activity, 
  Zap, 
  Radio, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Music,
  Building2,
  Users
} from "lucide-react";

const OR = '#c5a059';  // Drawing gold
const C = '#5f8a6b';   // Technical sage

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="w-full bg-[#07070a] min-h-screen text-zinc-100 selection:bg-[#c5a059]/30 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#c5a059]/3 rounded-full blur-[90px] pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 shadow-[0_0_15px_rgba(197,160,89,0.05)]">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="text-xs uppercase tracking-widest text-[#c5a059] font-bold">
              VYNL.PRO // Live Performance Network
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
            The Music Industry <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-[#c5a059]">
              Routing Engine
            </span>
          </h1>

          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            The direct portal linking touring acts, independent music venues, and local booking networks. Verify draw capacity, inspect technical riders, negotiate flat or split guarantees, and finalize dates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {session ? (
              <Link
                href="/map"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black uppercase text-xs rounded-xl transition-all shadow-[0_0_25px_rgba(99,102,241,0.25)] flex items-center gap-2"
              >
                Enter Control Room <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  style={{ borderColor: OR, background: OR, color: '#07070a' }}
                  className="px-8 py-4 font-black uppercase text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)] flex items-center gap-2 hover:opacity-90"
                >
                  Register Now <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => signIn()}
                  className="px-8 py-4 bg-zinc-900 hover:bg-zinc-850 text-white font-black uppercase text-xs rounded-xl border border-zinc-800 transition-all"
                >
                  Sign In
                </button>
              </>
            )}
            <a
              href="#demo"
              className="px-8 py-4 text-zinc-400 hover:text-white font-black uppercase text-xs transition-all flex items-center gap-2"
            >
              Watch Video Demo <Play className="w-3.5 h-3.5 fill-current" />
            </a>
          </div>
        </div>
      </section>

      {/* Video / Interactive Demo Section */}
      <section id="demo" className="container mx-auto px-6 py-12 max-w-5xl relative z-10">
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl overflow-hidden p-3 shadow-2xl relative">
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="w-full aspect-video bg-[#0a0a0f] rounded-2xl overflow-hidden relative group border border-zinc-900">
            {/* Embedded High-Quality Promo Video Player */}
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&loop=1&playlist=dQw4w9WgXcQ" 
              title="Vynl Pro Application Demo" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="container mx-auto px-6 py-20 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                For Bands & Artists
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Own your distribution. <br />
              Secure your guarantees.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Vynl Pro empowers performers to build a consolidated digital EPK. Link Spotify, Apple Music, and YouTube players directly, outline technical stage riders, specify PA requirements, and view local draw analytics.
            </p>
            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Linked Streaming Media Integrations
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Verified Local Draw Capacity Statements
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Structured Tech Rider & Backline Details
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Building2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                For Music Venues
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Mitigate calendar risk. <br />
              Match verified genres.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Find acts that fit your specific staging criteria. Filter by state, primary genre, or show type (original vs cover). Cross-examine verified performance histories and average pay configurations to protect margins.
            </p>
            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                State-by-State Live Music Directories
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Structured Pay Model Filtering (Flat Fee / Split)
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Direct Negotiation & Digital Contract Signing
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough Banner */}
      <section className="border-t border-zinc-900 bg-zinc-950/40 py-20 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              An Industry-First Network
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Public visitors can browse general lists of bands and venues, but direct contact emails, phone numbers, and financial guarantees are strictly locked behind credentialed membership to preserve industry privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-sm">1</div>
              <h4 className="font-bold text-white text-sm">Browse Public Grids</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Scan active venues and performing roster structures across any state without sensitive data exposure.
              </p>
            </div>
            
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">2</div>
              <h4 className="font-bold text-white text-sm">Create Verified Profile</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Register to detail your setup criteria, target gig windows, and live drawing estimates.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] font-bold text-sm">3</div>
              <h4 className="font-bold text-white text-sm">Unlock Direct Booking</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Send booking inquiries, access verified emails, and negotiate financial terms directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-zinc-900 py-16 text-center relative z-10 bg-zinc-950">
        <div className="container mx-auto px-6 max-w-xl space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            Ready to route your next tour?
          </h3>
          <p className="text-zinc-500 text-xs leading-normal">
            Create your account today and gain access to the Global Booking Intelligence map and matching deck.
          </p>
          <div className="flex justify-center gap-3">
            {session ? (
              <Link
                href="/map"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-black uppercase text-xs rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  style={{ background: OR, color: '#07070a' }}
                  className="px-6 py-3 text-black font-black uppercase text-xs rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
                <button
                  onClick={() => signIn()}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-black uppercase text-xs rounded-lg border border-zinc-800 transition-colors"
                >
                  Log In
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-zinc-600 pt-6">
            © 2026 RocketTree Labs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
