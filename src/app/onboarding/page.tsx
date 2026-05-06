"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Image as ImageIcon, Calendar, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    genre: "",
    zip: "",
    headerImage: "",
    design1Image: "",
    design2Image: "",
    tracks: [],
    youtubeLinks: "",
    compensation: "",
    travelRadius: "",
  });

  const totalSteps = 3;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    // In a real app, we'd save this to the DB via an API route
    console.log("Saving profile:", formData);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step >= i ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "33%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              className="h-full bg-gradient-to-r from-pink-600 to-indigo-600"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass p-8 md:p-12 rounded-3xl border border-zinc-800/50"
          >
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                    <Music className="text-pink-500" /> IDENTITY
                  </h2>
                  <p className="text-zinc-400">Tell us who you are and set the visual tone.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Artist / Band Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="The Midnight Echo"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Main Genre</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Synthwave / Rock"
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Location (Zip)</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="59901"
                      value={formData.zip}
                      onChange={(e) => setFormData({...formData, zip: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> DESIGN ELEMENT IMAGES (Parallax Layers)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="aspect-video bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:border-pink-500/50 transition-colors cursor-pointer">
                      Header Layer
                    </div>
                    <div className="aspect-video bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:border-pink-500/50 transition-colors cursor-pointer">
                      Design Element 1
                    </div>
                    <div className="aspect-video bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:border-pink-500/50 transition-colors cursor-pointer">
                      Design Element 2
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                    <ImageIcon className="text-fuchsia-500" /> CONTENT
                  </h2>
                  <p className="text-zinc-400">Upload your music and link your video channel.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed border-zinc-800 rounded-3xl text-center space-y-4 hover:border-fuchsia-500/50 transition-colors">
                    <Music className="w-12 h-12 text-zinc-700 mx-auto" />
                    <div>
                      <p className="font-bold">Drop your tracks here</p>
                      <p className="text-sm text-zinc-500">MP3, WAV (Unlimited uploads for Vynl Pro)</p>
                    </div>
                    <button className="px-6 py-2 bg-zinc-800 rounded-full text-sm font-bold">Browse Files</button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">YouTube Channel / Playlist Link</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-fuchsia-500 outline-none"
                      placeholder="https://youtube.com/..."
                      value={formData.youtubeLinks}
                      onChange={(e) => setFormData({...formData, youtubeLinks: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                    <Calendar className="text-indigo-500" /> LOGISTICS
                  </h2>
                  <p className="text-zinc-400">Set your booking requirements and availability.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Desired Compensation</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="$250 / hour or $1000 / show"
                      value={formData.compensation}
                      onChange={(e) => setFormData({...formData, compensation: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Travel Radius (miles)</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="150"
                      value={formData.travelRadius}
                      onChange={(e) => setFormData({...formData, travelRadius: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-4">Select your typical availability:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button key={day} className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors">
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-zinc-800">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 font-bold transition-colors ${step === 1 ? 'opacity-0' : 'text-zinc-400 hover:text-white'}`}
              >
                <ChevronLeft /> BACK
              </button>
              
              {step < totalSteps ? (
                <button 
                  onClick={nextStep}
                  className="bg-zinc-100 text-black px-8 py-4 rounded-full font-black flex items-center gap-2 hover:bg-white transition-all shadow-xl shadow-white/5"
                >
                  NEXT STEP <ChevronRight />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-pink-600 to-indigo-600 text-white px-10 py-4 rounded-full font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-pink-600/20"
                >
                  LAUNCH PROFILE <Save />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
