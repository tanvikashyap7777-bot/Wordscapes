import React, { useEffect } from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Show splash for 2.5 seconds
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-4"
        >
          <span className="text-xs md:text-sm uppercase tracking-widest text-amber-500 font-bold mb-2 font-display block text-center">
            WELCOME TO
          </span>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tighter font-display text-center leading-none select-none">
            TSVAGA<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">MAZWI</span>
          </h1>
        </motion.div>

        {/* Loading dots */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mt-12 flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-amber-400"
              animate={{
                y: ["0%", "-50%", "0%"],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
