"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, User, MapPin, Loader2, AlertCircle, Music, Building, ArrowRight, Zap } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<"BAND" | "VENUE" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zip, setZip] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select whether you are a Band or a Venue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Register the user
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name, zip }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok || registerData.error) {
        setError(registerData.error || "Failed to register account");
        setLoading(false);
        return;
      }

      // Automatically sign in the user
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/map",
      });

      if (loginRes?.error) {
        setError("Account created, but automatic sign-in failed. Please log in.");
        router.push("/auth/login");
      } else {
        router.push("/map");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full space-y-8 glass p-8 sm:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl relative z-10"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-black text-white tracking-tighter uppercase">
              VYNL<span className="text-pink-500">.PRO</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">
            Join the Circuit
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Select your profile type and start booking gigs
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-sm text-red-400 animate-pulse">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Step 1: Role Selection Cards */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 block text-center mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("BAND")}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 ${
                  role === "BAND"
                    ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${role === "BAND" ? "bg-pink-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>
                    <Music className="w-6 h-6" />
                  </div>
                  {role === "BAND" && <span className="w-2 h-2 rounded-full bg-pink-500" />}
                </div>
                <h3 className="text-lg font-bold text-white uppercase">Band & Artist</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Build your EPK, set parameters, and swipe to secure gig bookings instantly.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("VENUE")}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 ${
                  role === "VENUE"
                    ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${role === "VENUE" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>
                    <Building className="w-6 h-6" />
                  </div>
                  {role === "VENUE" && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </div>
                <h3 className="text-lg font-bold text-white uppercase">Venue & Bar</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  List stage slots, check bands, and negotiate crowd-backed agreements.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Form Inputs */}
          {role && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  {role === "BAND" ? "Band / Artist Name" : "Venue Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none transition-all placeholder-zinc-600"
                    placeholder={role === "BAND" ? "e.g. The Midnight Echo" : "e.g. The Outpost Grill"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none transition-all placeholder-zinc-600"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none transition-all placeholder-zinc-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none transition-all placeholder-zinc-600"
                      placeholder="99201"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-pink-600/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    CREATE ACCOUNT <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </form>

        <div className="text-center pt-4 border-t border-zinc-800/60">
          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-pink-500 hover:text-pink-400 font-bold transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
