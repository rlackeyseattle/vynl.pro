import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";

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
          <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-black bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                  vynl.pro
                </span>
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/" className="hover:text-pink-400 transition-colors">The Circuit</Link>
                <AuthButton />
              </nav>
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
