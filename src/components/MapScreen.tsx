import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Home, Lock, Star } from "lucide-react";
import { Level } from "../types";
import { Haptics } from "../utils/haptics";

interface MapScreenProps {
  levels: Level[];
  currentLevelNo: number;
  maxUnlockedLevel: number;
  language: "english" | "shona";
  onSelectLevel: (lvlNo: number) => void;
  onBackToHome: () => void;
}

export function MapScreen({ levels, currentLevelNo, maxUnlockedLevel, language, onSelectLevel, onBackToHome }: MapScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to active level on mount
  useEffect(() => {
    if (containerRef.current) {
      const activeElement = containerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ block: "center", behavior: "auto" });
      }
    }
  }, []);

  const handleLevelClick = (lvlNo: number, isUnlocked: boolean) => {
    if (isUnlocked) {
      Haptics.buttonTap();
      onSelectLevel(lvlNo);
    } else {
      Haptics.error();
    }
  };

  const handleBack = () => {
    Haptics.buttonTap();
    onBackToHome();
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col text-white overflow-hidden font-sans select-none"
      style={{
        background: "radial-gradient(circle at top, #334155 0%, #0f172a 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#fbbf24 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[110px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Header with Safe Area Top */}
      <header className="relative z-20 w-full px-4 safe-area-top pb-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shrink-0">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 p-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 cursor-pointer"
          title="Back to Home"
        >
          <Home className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Home</span>
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">{language} TRACK</span>
          <h2 className="text-xl font-black font-display tracking-tight drop-shadow-md">LEVEL MAP</h2>
        </div>
      </header>

      {/* Map Nodes Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden p-6 z-10 flex flex-col-reverse items-center gap-10 scroll-smooth pb-36 pt-16 safe-area-bottom"
      >
        {/* Connection Path line background */}
        <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-white/5 -translate-x-1/2 z-0 rounded-full border-x border-white/10 shadow-inner" />
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-amber-500/30 -translate-x-1/2 z-0 rounded-full" />

        {levels.map((lvl, index) => {
          const isUnlocked = lvl.levelNumber <= maxUnlockedLevel;
          const isCurrent = lvl.levelNumber === currentLevelNo;
          const isCompleted = lvl.levelNumber < maxUnlockedLevel;
          
          // Zig-zag offset
          const offsetIndex = index % 4;
          let translateX = '0';
          if (offsetIndex === 1) translateX = '60px';
          if (offsetIndex === 3) translateX = '-60px';

          return (
            <motion.div
              key={lvl.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative z-10 flex items-center justify-center w-full"
              style={{ transform: `translateX(${translateX})` }}
              data-active={isCurrent ? "true" : "false"}
            >
              <button
                onClick={() => handleLevelClick(lvl.levelNumber, isUnlocked)}
                disabled={!isUnlocked}
                className={`group relative flex items-center justify-center rounded-full transition-all duration-300 ${isCurrent ? 'z-20' : 'z-10'}`}
              >
                {/* Visual node */}
                <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 backdrop-blur-sm
                    ${isCurrent ? 'bg-amber-400 border-white scale-125 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 
                      isCompleted ? 'bg-yellow-400/90 border-yellow-200' : 
                      isUnlocked ? 'bg-slate-700 border-amber-400/50 active:scale-95' : 
                      'bg-slate-800 border-slate-700/50 opacity-80 cursor-not-allowed'}
                  `}
                >
                  {!isUnlocked ? (
                    <Lock className="w-6 h-6 text-slate-500" />
                  ) : isCurrent ? (
                    <span className="text-2xl font-black font-display text-slate-900 leading-none">{lvl.levelNumber}</span>
                  ) : isCompleted ? (
                    <span className="text-xl font-black font-display text-emerald-900 leading-none flex items-center flex-col gap-0.5">
                      {lvl.levelNumber}
                      <Star className="w-3 h-3 text-emerald-800 fill-emerald-800" />
                    </span>
                  ) : (
                    <span className="text-xl font-black font-display text-amber-400 leading-none">{lvl.levelNumber}</span>
                  )}
                </div>

                {/* Theme name badge */}
                {isUnlocked && (
                  <div className={`absolute whitespace-nowrap px-3 py-1.5 rounded-xl border font-sans font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-lg transition-all ${
                    isCurrent ? '-bottom-10 bg-slate-900 text-amber-400 border-amber-400 scale-100 z-30' :
                    '-bottom-8 bg-slate-800 text-white/70 border-white/10 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100'
                  }`}>
                    {lvl.theme.name}
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
        {/* End of path base marker */}
        <div className="w-8 h-8 rounded-full bg-slate-800 border-4 border-slate-700 z-10 shadow-lg mt-12" />
      </div>
    </div>
  );
}
