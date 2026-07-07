"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music, Image as ImageIcon, Calendar, ChevronRight, ChevronLeft, 
  Save, Loader2, Sparkles, Building, Link as LinkIcon, DollarSign,
  AlertCircle
} from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import ImageUploader from "@/components/ImageUploader";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role = session?.user ? (session.user as any).role : "BAND";
  const isBand = role === "BAND";
  const totalSteps = 3;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    genre: "",
    zip: "",
    // Band visual files
    headerImage: "",
    design1Image: "",
    design2Image: "",
    profileImage: "",
    backgroundImage: "",
    // Band links
    spotifyUrl: "",
    appleMusicUrl: "",
    youtubeUrl: "",
    soundcloudUrl: "",
    // Band logistics
    minimumGuarantee: "",
    expectedDraw: "",
    isTouring: false,
    bandRider: "",

    // Venue identity
    venueType: "Club",
    exteriorImage: "",
    interiorImage: "",
    stageImage: "",
    // Venue logistics
    bookingDays: "",
    averagePay: "",
    payType: "Guarantee",
    // Venue specs
    ageRequirement: "21+",
    targetBandsDescription: "",
    website: ""
  });

  // Pre-fill user details from session once loaded
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        zip: (session.user as any).zip || ""
      }));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
        <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">Initializing OS...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="glass max-w-md w-full p-8 rounded-3xl border border-zinc-800 text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-pink-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Auth Required</h2>
          <p className="text-zinc-400 text-sm">Please log in to complete your onboarding profile.</p>
          <button 
            onClick={() => router.push("/auth/login?callbackUrl=/onboarding")}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full font-black text-white hover:brightness-110 transition-all"
          >
            LOG IN NOW
          </button>
        </div>
      </div>
    );
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const dataToSave: any = {
        name: formData.name,
        zip: formData.zip,
        genre: formData.genre,
      };

      if (isBand) {
        dataToSave.headerImage = formData.headerImage;
        dataToSave.design1Image = formData.design1Image;
        dataToSave.design2Image = formData.design2Image;
        dataToSave.profileImage = formData.profileImage || formData.headerImage; // Default avatar to header
        dataToSave.spotifyUrl = formData.spotifyUrl;
        dataToSave.appleMusicUrl = formData.appleMusicUrl;
        dataToSave.youtubeUrl = formData.youtubeUrl;
        dataToSave.soundcloudUrl = formData.soundcloudUrl;
        dataToSave.minimumGuarantee = formData.minimumGuarantee ? parseFloat(formData.minimumGuarantee) : undefined;
        dataToSave.expectedDraw = formData.expectedDraw ? parseInt(formData.expectedDraw) : undefined;
        dataToSave.isTouring = formData.isTouring;
        dataToSave.bandRider = formData.bandRider;
        // Generate custom URL slug based on band name
        dataToSave.slug = formData.name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      } else {
        dataToSave.venueType = formData.venueType;
        dataToSave.exteriorImage = formData.exteriorImage;
        dataToSave.interiorImage = formData.interiorImage;
        dataToSave.stageImage = formData.stageImage;
        dataToSave.bookingDays = formData.bookingDays;
        dataToSave.averagePay = formData.averagePay;
        dataToSave.payType = formData.payType;
        dataToSave.ageRequirement = formData.ageRequirement;
        dataToSave.targetBandsDescription = formData.targetBandsDescription;
        dataToSave.website = formData.website;
        dataToSave.slug = formData.name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      }

      const res = await updateProfile(dataToSave);

      if (!res.success) {
        setError(res.error || "Failed to save profile");
      } else {
        // Redirect to new custom profile URL or dashboard
        router.push(res.slug ? `/${res.slug}` : "/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16 bg-festival">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Progress Bar & Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Welcome to Vynl OS // Initial Calibration
            </span>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-8">
            Complete your {isBand ? "Artist Profile" : "Venue Directory"}
          </h1>

          <div className="flex items-center justify-between max-w-xs mx-auto mb-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  step >= i 
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="h-1 bg-zinc-850 rounded-full max-w-xs mx-auto overflow-hidden">
            <motion.div 
              initial={{ width: "33%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              className="h-full bg-cyan-400"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="glass p-8 md:p-12 rounded-3xl border border-zinc-850 bg-zinc-950/40"
          >
            {/* ────────────────── STEP 1: IDENTITY & VISUALS ────────────────── */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black mb-2 flex items-center gap-3 text-white uppercase tracking-tight">
                    {isBand ? <Music className="text-cyan-400" /> : <Building className="text-cyan-400" />} 
                    01 // Identity & Brand
                  </h2>
                  <p className="text-sm text-zinc-400">Specify your credentials and set the visual layout.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      {isBand ? "Artist / Band Name" : "Venue / Business Name"}
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                      placeholder={isBand ? "The Midnight Echo" : "The Sunset Room"}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">ZIP Code</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                      placeholder="90210"
                      value={formData.zip}
                      onChange={(e) => setFormData({...formData, zip: e.target.value})}
                    />
                  </div>

                  {isBand ? (
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Genre(s)</label>
                      <input 
                        type="text" 
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                        placeholder="Synthwave, Indie Rock, Retro"
                        value={formData.genre}
                        onChange={(e) => setFormData({...formData, genre: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Venue Type</label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                        value={formData.venueType}
                        onChange={(e) => setFormData({...formData, venueType: e.target.value})}
                      >
                        <option value="Club">Nightclub / DJ Booth</option>
                        <option value="Bar">Bar / Pub Stage</option>
                        <option value="Theatre">Theatre / Concert Hall</option>
                        <option value="Arena">Arena / Large Hall</option>
                        <option value="Festival">Outdoor Festival Grounds</option>
                      </select>
                    </div>
                  )}
                </div>

                {isBand ? (
                  <div className="space-y-6 pt-4 border-t border-zinc-900">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-400" /> Parallax Brand Layer Images
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ImageUploader 
                        label="Header Banner" 
                        value={formData.headerImage} 
                        onChange={(url) => setFormData({...formData, headerImage: url})}
                        aspectRatio="wide"
                        description="Top Hero Header banner background"
                      />
                      <ImageUploader 
                        label="Design Element 1" 
                        value={formData.design1Image} 
                        onChange={(url) => setFormData({...formData, design1Image: url})}
                        aspectRatio="square"
                        description="Left floating visual asset"
                      />
                      <ImageUploader 
                        label="Design Element 2" 
                        value={formData.design2Image} 
                        onChange={(url) => setFormData({...formData, design2Image: url})}
                        aspectRatio="square"
                        description="Right floating visual asset"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4 border-t border-zinc-900">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-400" /> Venue Photo Portfolio
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ImageUploader 
                        label="Exterior Stage / Facade" 
                        value={formData.exteriorImage} 
                        onChange={(url) => setFormData({...formData, exteriorImage: url})}
                        aspectRatio="wide"
                        description="Building facade or marquee view"
                      />
                      <ImageUploader 
                        label="Interior Seating / Lounge" 
                        value={formData.interiorImage} 
                        onChange={(url) => setFormData({...formData, interiorImage: url})}
                        aspectRatio="wide"
                        description="Inside seating or bar area view"
                      />
                      <ImageUploader 
                        label="Performance Stage" 
                        value={formData.stageImage} 
                        onChange={(url) => setFormData({...formData, stageImage: url})}
                        aspectRatio="wide"
                        description="Stage layout, rig, and lighting view"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ────────────────── STEP 2: MEDIA / LOGISTICS ────────────────── */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black mb-2 flex items-center gap-3 text-white uppercase tracking-tight">
                    <LinkIcon className="text-cyan-400" /> 02 // {isBand ? "Streaming Links" : "Booking & Hours"}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {isBand ? "Link your music feeds. Avoid files; use direct URLs." : "Configure weekly schedules and compensation model details."}
                  </p>
                </div>

                {isBand ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Spotify Artist URL</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="https://open.spotify.com/artist/..."
                          value={formData.spotifyUrl}
                          onChange={(e) => setFormData({...formData, spotifyUrl: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">YouTube Channel / Video</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="https://youtube.com/watch?v=..."
                          value={formData.youtubeUrl}
                          onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">SoundCloud Track / Page</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="https://soundcloud.com/..."
                          value={formData.soundcloudUrl}
                          onChange={(e) => setFormData({...formData, soundcloudUrl: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Apple Music Link</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="https://music.apple.com/..."
                          value={formData.appleMusicUrl}
                          onChange={(e) => setFormData({...formData, appleMusicUrl: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Booking Nights (Days)</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="Friday, Saturday, Sunday"
                          value={formData.bookingDays}
                          onChange={(e) => setFormData({...formData, bookingDays: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Average Compensation ($)</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="$500 - $1500 / night"
                          value={formData.averagePay}
                          onChange={(e) => setFormData({...formData, averagePay: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Pay Model / Type</label>
                        <select 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          value={formData.payType}
                          onChange={(e) => setFormData({...formData, payType: e.target.value})}
                        >
                          <option value="Guarantee">Flat Guarantee (Fixed Pay)</option>
                          <option value="Door Split">Door Split (Ticket Shares)</option>
                          <option value="Bar Tab">Bar Tab / % Food & Beverage</option>
                          <option value="Hybrid">Hybrid Model (Flat + Split)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ────────────────── STEP 3: LOGISTICS / SPECS ────────────────── */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black mb-2 flex items-center gap-3 text-white uppercase tracking-tight">
                    <Calendar className="text-cyan-400" /> 03 // Operations & Logistics
                  </h2>
                  <p className="text-sm text-zinc-400">Complete final specifications before compiling your profile.</p>
                </div>

                {isBand ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                          Minimum Guarantee Floor ($)
                        </label>
                        <div className="relative flex items-center">
                          <DollarSign className="absolute left-4 w-4 h-4 text-zinc-500" />
                          <input 
                            type="number" 
                            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                            placeholder="500"
                            value={formData.minimumGuarantee}
                            onChange={(e) => setFormData({...formData, minimumGuarantee: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                          Average Local Draw (Fans)
                        </label>
                        <input 
                          type="number" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          placeholder="100"
                          value={formData.expectedDraw}
                          onChange={(e) => setFormData({...formData, expectedDraw: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                          Technical Rider Requirement Details
                        </label>
                        <textarea 
                          rows={4}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none placeholder-zinc-650"
                          placeholder="PA system details, inputs required, stage layout notes, cables, sound engineer notes..."
                          value={formData.bandRider}
                          onChange={(e) => setFormData({...formData, bandRider: e.target.value})}
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2 md:col-span-2">
                        <input 
                          type="checkbox" 
                          id="isTouring"
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                          checked={formData.isTouring}
                          onChange={(e) => setFormData({...formData, isTouring: e.target.checked})}
                        />
                        <label htmlFor="isTouring" className="text-xs font-bold uppercase tracking-wide text-zinc-300 cursor-pointer">
                          We are currently touring nationally or regionally
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Age Requirement</label>
                        <select 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          value={formData.ageRequirement}
                          onChange={(e) => setFormData({...formData, ageRequirement: e.target.value})}
                        >
                          <option value="21+">21+ Strictly</option>
                          <option value="18+">18+ (Under 18 with adult)</option>
                          <option value="All Ages">All Ages Welcome</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Website / Link</label>
                        <input 
                          type="text" 
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-650"
                          placeholder="https://sunsetroom.com"
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                          Target Artists & Style Preferences
                        </label>
                        <textarea 
                          rows={4}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none placeholder-zinc-650"
                          placeholder="Describe the genres, performance styles, draws, and sound vibes you typically book at your venue..."
                          value={formData.targetBandsDescription}
                          onChange={(e) => setFormData({...formData, targetBandsDescription: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-zinc-900">
              <button 
                onClick={prevStep}
                disabled={step === 1 || saving}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${
                  step === 1 || saving ? 'opacity-0 cursor-default' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
              
              {step < totalSteps ? (
                <button 
                  onClick={nextStep}
                  className="bg-cyan-500 text-black px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10"
                >
                  NEXT STEP <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-gradient-to-r from-cyan-400 to-indigo-600 text-white px-10 py-3.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      COMPILING PROFILE... <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      LAUNCH PROFILE <Save className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
