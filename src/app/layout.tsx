import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { Search } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "vynl.pro - Universal Musician OS",
  description: "Professional EPK ecosystem for musicians and comprehensive database for venues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 flex flex-col min-h-screen`}>
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-[#050505]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#050505]/80">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-10">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-black text-white tracking-tighter">
                    VYNL<span className="text-cyan-400">.PRO</span>
                  </span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                  <Link href="/map" className="text-cyan-400 border-b-2 border-cyan-400 pb-[19px] mt-[19px]">Dashboard</Link>
                  <Link href="/venues" className="text-zinc-400 hover:text-white transition-colors">Venues</Link>
                  <Link href="/artists" className="text-zinc-400 hover:text-white transition-colors">Artists</Link>
                  <Link href="/analytics" className="text-zinc-400 hover:text-white transition-colors">Analytics</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-6">
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="Search profiles or cities..." className="bg-zinc-900/80 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-64" />
                </div>
                <AuthButton />
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-zinc-800 bg-zinc-950 py-8 md:py-12 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-zinc-400">
                © 2022 Robert T. Lackey, Rocket Tree Labs LLC. Kalispell, MT.
              </div>
              <div className="text-sm text-zinc-400">
                <Link href="/contact" className="hover:text-pink-400 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
