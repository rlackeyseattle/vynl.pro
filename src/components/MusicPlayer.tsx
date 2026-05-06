"use client";

import { useEffect, useState, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Track {
  id: string;
  title: string;
  url: string;
  albumArt?: string;
}

export function MusicPlayer({ tracks }: { tracks: Track[] }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    soundRef.current = new Howl({
      src: [currentTrack.url],
      html5: true,
      volume: volume,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => handleNext(),
    });

    if (isPlaying) {
      soundRef.current.play();
    }

    return () => {
      soundRef.current?.unload();
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (soundRef.current && isPlaying) {
        const seek = soundRef.current.seek() as number;
        const duration = soundRef.current.duration();
        setProgress((seek / duration) * 100 || 0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      soundRef.current?.pause();
    } else {
      soundRef.current?.play();
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const duration = soundRef.current?.duration() || 0;
    soundRef.current?.seek((val / 100) * duration);
    setProgress(val);
  };

  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800/50 shadow-2xl relative overflow-hidden group">
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Album Art */}
        <motion.div 
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl relative flex-shrink-0"
        >
          <img 
            src={currentTrack.albumArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"} 
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Controls */}
        <div className="flex-1 w-full space-y-6">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black tracking-tight">{currentTrack.title}</h3>
            <p className="text-pink-500 font-bold">Featured Track</p>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>00:00</span>
              <span>LIVE SCENE</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-8">
            <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-black translate-x-0.5" />}
            </button>
            <button onClick={handleNext} className="text-zinc-400 hover:text-white transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`transition-colors ${showPlaylist ? 'text-pink-500' : 'text-zinc-400 hover:text-white'}`}
            >
              <ListMusic className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Overlay */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 border-t border-zinc-800 pt-6"
          >
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrackIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    index === currentTrackIndex 
                      ? 'bg-pink-600/20 text-pink-500 border border-pink-500/30' 
                      : 'hover:bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  <span className="text-sm font-bold">{track.title}</span>
                  {index === currentTrackIndex && isPlaying && (
                    <div className="flex gap-0.5 h-3 items-end">
                      {[1,2,3,4].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 6, 10, 4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                          className="w-1 bg-pink-500 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <Volume2 className="w-32 h-32 -rotate-12" />
      </div>
    </div>
  );
}
