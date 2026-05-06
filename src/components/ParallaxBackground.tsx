"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxBackgroundProps {
  children: React.ReactNode;
  imageUrl: string;
  speed?: number;
}

export function ParallaxBackground({ children, imageUrl, speed = 0.5 }: ParallaxBackgroundProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  return (
    <div ref={ref} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40 z-20" />
        <img 
          src={imageUrl} 
          alt="Parallax background" 
          className="w-full h-full object-cover scale-110"
        />
      </motion.div>
      <div className="relative z-30 container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
