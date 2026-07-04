"use client";

import { useState, useEffect } from "react";
import { Music, Disc, Radio, Play, ExternalLink } from "lucide-react";

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.882.51 9.387.51 9.387.51s7.505 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface StreamingPlayerProps {
  spotifyUrl?: string | null;
  appleMusicUrl?: string | null;
  tidalUrl?: string | null;
  youtubeUrl?: string | null;
  bandcampUrl?: string | null;
  soundcloudUrl?: string | null;
}

export function StreamingPlayer({
  spotifyUrl,
  appleMusicUrl,
  tidalUrl,
  youtubeUrl,
  bandcampUrl,
  soundcloudUrl,
}: StreamingPlayerProps) {
  const [activeTab, setActiveTab] = useState<string>("");

  // Parse Embed URLs
  const getSpotifyEmbed = (url: string) => {
    try {
      const match = url.match(/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/);
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const getYoutubeEmbed = (url: string) => {
    try {
      let videoId = "";
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1]?.split("&")[0] || "";
      } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1]?.split("?")[0] || "";
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const getAppleMusicEmbed = (url: string) => {
    try {
      if (url.includes("music.apple.com")) {
        return url.replace("music.apple.com", "embed.music.apple.com");
      }
      return url;
    } catch {
      return url;
    }
  };

  const getSoundcloudEmbed = (url: string) => {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ec4899&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  };

  const getTidalEmbed = (url: string) => {
    try {
      const match = url.match(/track\/([0-9]+)/);
      if (match) {
        return `https://embed.tidal.com/tracks/${match[1]}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Determine active services
  const tabs = [
    { id: "spotify", label: "Spotify", url: spotifyUrl, icon: <Disc className="w-4 h-4 text-emerald-400" />, getEmbed: getSpotifyEmbed, height: 152 },
    { id: "youtube", label: "YouTube", url: youtubeUrl, icon: <Youtube className="w-4 h-4 text-red-500" />, getEmbed: getYoutubeEmbed, height: 315 },
    { id: "soundcloud", label: "SoundCloud", url: soundcloudUrl, icon: <Radio className="w-4 h-4 text-orange-500" />, getEmbed: getSoundcloudEmbed, height: 166 },
    { id: "apple", label: "Apple Music", url: appleMusicUrl, icon: <Music className="w-4 h-4 text-pink-500" />, getEmbed: getAppleMusicEmbed, height: 175 },
    { id: "tidal", label: "Tidal", url: tidalUrl, icon: <Disc className="w-4 h-4 text-cyan-400" />, getEmbed: getTidalEmbed, height: 150 },
  ].filter(t => !!t.url);

  // Set default active tab
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  if (tabs.length === 0) {
    return (
      <div className="glass rounded-3xl border border-zinc-800 p-8 text-center space-y-4 bg-zinc-950/40">
        <Music className="w-12 h-12 text-zinc-700 mx-auto" />
        <div className="space-y-1">
          <p className="font-bold text-zinc-300">No Streaming Media Configured</p>
          <p className="text-xs text-zinc-500">Edit the profile to link Spotify, YouTube, SoundCloud, or Apple Music.</p>
        </div>
      </div>
    );
  }

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="glass rounded-3xl border border-zinc-800 bg-zinc-900/10 overflow-hidden flex flex-col">
      {/* Skinned Navigation Tabs */}
      <div className="flex items-center gap-2 p-3 bg-zinc-950/80 border-b border-zinc-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-zinc-850 border border-zinc-700 text-white shadow-md"
                : "bg-transparent border border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Embed Frame view */}
      <div className="p-4 bg-black/40 flex-1 flex flex-col justify-center min-h-[200px]">
        {currentTab.id === "youtube" ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800">
            <iframe
              src={currentTab.getEmbed(currentTab.url!)}
              title="YouTube video player"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <iframe
            src={currentTab.getEmbed(currentTab.url!)}
            width="100%"
            height={currentTab.height}
            className="border-0 rounded-xl overflow-hidden"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
        
        {/* External Link */}
        <div className="flex justify-end mt-3">
          <a
            href={currentTab.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-pink-500 transition-colors"
          >
            Open on {currentTab.label} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
