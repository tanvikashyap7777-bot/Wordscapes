import React from "react";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { Haptics } from "../utils/haptics";

interface HomeScreenProps {
  onSelectLanguage: (lang: "english" | "shona") => void;
}

export function HomeScreen({ onSelectLanguage }: HomeScreenProps) {
  const handleSelect = (lang: "english" | "shona") => {
    Haptics.buttonTap();
    onSelectLanguage(lang);
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center text-white overflow-hidden font-sans select-none p-6 safe-area-top safe-area-bottom"
      style={{
        background: "radial-gradient(circle at top, #334155 0%, #0f172a 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#fbbf24 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[110px] rounded-full pointer-events-none z-0" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 flex flex-col items-center max-w-sm w-full"
      >
        <div className="mb-10 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2 font-display">CHOOSE YOUR PATH</span>
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tighter font-display text-center leading-none">
            TSVAGA<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">MAZWI</span>
          </h1>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={() => handleSelect("shona")}
            className="group relative w-full overflow-hidden rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:scale-98 border border-amber-500/30 hover:border-amber-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] p-6 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between z-10">
              <div className="flex flex-col items-start gap-1">
                <span className="text-2xl font-black font-display text-amber-400">Shona Track</span>
                <span className="text-xs text-white/50 font-medium">Learn Zimbabwean vocabulary</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-amber-400 fill-amber-400 ml-1" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleSelect("english")}
            className="group relative w-full overflow-hidden rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:scale-98 border border-blue-500/30 hover:border-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] p-6 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between z-10">
              <div className="flex flex-col items-start gap-1">
                <span className="text-2xl font-black font-display text-blue-400">English Track</span>
                <span className="text-xs text-white/50 font-medium">Classic puzzle experience</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-blue-400 fill-blue-400 ml-1" />
              </div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
