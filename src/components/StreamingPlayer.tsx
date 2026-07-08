"use client";

import { Disc, Radio, Music, ExternalLink } from "lucide-react";

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
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23c5a059&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
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

  const activeMedia = [
    { id: "youtube", label: "YouTube Video", url: youtubeUrl, icon: <Youtube className="w-4 h-4 text-red-500" />, getEmbed: getYoutubeEmbed, isVideo: true },
    { id: "spotify", label: "Spotify Player", url: spotifyUrl, icon: <Disc className="w-4 h-4 text-emerald-400" />, getEmbed: getSpotifyEmbed, height: 152 },
    { id: "apple", label: "Apple Music", url: appleMusicUrl, icon: <Music className="w-4 h-4 text-pink-500" />, getEmbed: getAppleMusicEmbed, height: 175 },
    { id: "soundcloud", label: "SoundCloud Playlist", url: soundcloudUrl, icon: <Radio className="w-4 h-4 text-orange-500" />, getEmbed: getSoundcloudEmbed, height: 166 },
    { id: "tidal", label: "Tidal Player", url: tidalUrl, icon: <Disc className="w-4 h-4 text-cyan-400" />, getEmbed: getTidalEmbed, height: 150 },
  ].filter(t => !!t.url);

  if (activeMedia.length === 0) {
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

  return (
    <div className="flex flex-col gap-8">
      {activeMedia.map((media) => (
        <div 
          key={media.id} 
          className="glass rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden flex flex-col p-5 gap-4"
        >
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              {media.icon}
              <span className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">
                {media.label}
              </span>
            </div>
            <a
              href={media.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 hover:text-[#c5a059] transition-colors"
            >
              Open Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Player Frame */}
          <div className="flex-1 flex flex-col justify-center">
            {media.isVideo ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800/80">
                <iframe
                  src={media.getEmbed(media.url!)}
                  title="YouTube video player"
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <iframe
                src={media.getEmbed(media.url!)}
                width="100%"
                height={media.height}
                className="border-0 rounded-2xl overflow-hidden"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
