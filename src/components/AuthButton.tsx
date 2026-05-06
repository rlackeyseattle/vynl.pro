"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-zinc-300">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(219,39,119,0.3)] hover:shadow-[0_0_20px_rgba(219,39,119,0.5)]"
    >
      Join the Scene
    </button>
  );
}
