import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDiscoveryFeed } from "@/app/actions/swipe";
import { SwipeDeck } from "@/components/SwipeDeck";
import { redirect } from "next/navigation";
import { Zap, Heart, Music2 } from "lucide-react";

export const metadata = {
  title: "Match & Book | vynl.pro",
  description: "Tinder-style discovery engine connecting bands with venues. Swipe to book.",
};

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const role = (session.user as any).role as "BAND" | "VENUE";
  const feedResult = await getDiscoveryFeed(100);

  const initialCards = "cards" in feedResult ? feedResult.cards : [];
  const feedRole = "role" in feedResult ? feedResult.role : role;
  const feedError = "error" in feedResult ? feedResult.error : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-festival">
      {/* Hero header */}
      <div className="border-b border-zinc-800/60 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Match &amp; Book
            </h1>
          </div>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            {role === "BAND"
              ? "Discover open stage slots near you. Swipe right to send your EPK."
              : "Find your next headliner. Swipe right to send a booking invite."}
          </p>

          {/* Role pill */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-sm">
            {role === "BAND" ? (
              <>
                <Music2 className="w-4 h-4 text-indigo-400" />
                <span className="text-zinc-300 font-medium">Artist Mode</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-zinc-300 font-medium">Venue Mode</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main deck area */}
      <div className="container mx-auto px-4 py-8">
        {feedError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-black text-white mb-2">Location Needed</h3>
            <p className="text-zinc-400 text-sm max-w-xs">{feedError}</p>
            <a
              href={role === "BAND" ? "/onboarding" : "/venues"}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full text-white font-bold text-sm"
            >
              Update My Profile
            </a>
          </div>
        ) : (
          <SwipeDeck
            initialCards={initialCards}
            role={feedRole as "BAND" | "VENUE"}
            radiusMiles={100}
          />
        )}
      </div>

      {/* Legend */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3">
            <div className="text-2xl mb-1">❌</div>
            <div className="text-zinc-400 text-xs">Pass</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3">
            <div className="text-2xl mb-1">🎶</div>
            <div className="text-zinc-400 text-xs">Match = Draft Contract</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-zinc-400 text-xs">Book It</div>
          </div>
        </div>
      </div>
    </div>
  );
}
