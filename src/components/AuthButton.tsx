"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut, User as UserIcon, Zap } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-24 h-8 bg-zinc-800 rounded-full animate-pulse" />;
  }

  if (session) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
            {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
          </div>
          <span className="text-xs font-medium text-zinc-300 max-w-[120px] truncate">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all border border-zinc-700 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(219,39,119,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.5)]"
    >
      <Zap className="w-3.5 h-3.5" />
      Join the Scene
    </button>
  );
}
