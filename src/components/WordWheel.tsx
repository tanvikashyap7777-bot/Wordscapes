/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { SoundEffects } from "./SoundEffects";
import { Haptics } from "../utils/haptics";

interface WordWheelProps {
  key?: string | number;
  letters: string[]; // e.g. ["M", "U", "S", "H", "A"]
  onWordSubmit: (word: string) => void;
  onShuffle?: () => void;
  wheelColorClass?: string;
  accentColorClass?: string;
}

export default function WordWheel({
  letters,
  onWordSubmit,
  onShuffle,
  wheelColorClass = "bg-stone-950/80 border-amber-500/50",
  accentColorClass = "bg-amber-500 text-stone-950",
}: WordWheelProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate circular coordinates for the letters
  const letterPositions = useMemo(() => {
    const N = letters.length;
    return letters.map((char, index) => {
      // Offset by -90 degrees so the first letter starts at the top
      const theta = -Math.PI / 2 + (2 * Math.PI / N) * index;
      const radius = 35; // % from center
      const x = 50 + radius * Math.cos(theta);
      const y = 50 + radius * Math.sin(theta);
      return { char, index, x, y };
    });
  }, [letters]);

  // Derive active selected characters as a string
  const activeWord = useMemo(() => {
    return selectedIndices.map((idx) => letters[idx]).join("");
  }, [selectedIndices, letters]);

  // Calculate mouse/touch relative coordinates mapped to 0-100 range
  const getRelativeCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  // Find if pointer is within a threshold distance of any letter button
  const findLetterUnderPointer = (x: number, y: number) => {
    const threshold = 12; // Distance tolerance in percentage units
    return letterPositions.find((pos) => {
      const dx = pos.x - x;
      const dy = pos.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < threshold;
    });
  };

  // Process dragging over a letter
  const checkLetterSelect = (clientX: number, clientY: number) => {
    const coords = getRelativeCoords(clientX, clientY);
    setPointerPos(coords);

    const matchObj = findLetterUnderPointer(coords.x, coords.y);
    if (matchObj) {
      const idx = matchObj.index;
      // If letter is already in sequence
      if (selectedIndices.includes(idx)) {
        // Allow backtracking (undoing last letter if user navigates backward)
        if (selectedIndices.length > 1 && selectedIndices[selectedIndices.length - 2] === idx) {
          setSelectedIndices((prev) => prev.slice(0, -1));
          SoundEffects.playTick(0.85); // slightly matching backtracking tone
          Haptics.backtrack();
        }
      } else {
        // Add new letter to chain
        setSelectedIndices((prev) => {
          const updated = [...prev, idx];
          // Raise pitch slightly for each successive connected letter for musical progress!
          SoundEffects.playTick(1 + updated.length * 0.12);
          Haptics.tick();
          return updated;
        });
      }
    }
  };

  // Event Handlers (Pointer Event API covers both Mouse and Touch natively!)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Release pointer capture to prevent drag-blocking issues
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Check initial connect
    const coords = getRelativeCoords(e.clientX, e.clientY);
    const matchObj = findLetterUnderPointer(coords.x, coords.y);
    
    if (matchObj) {
      setSelectedIndices([matchObj.index]);
      setPointerPos(coords);
      SoundEffects.playTick(1.0);
      Haptics.tick();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedIndices.length === 0) return;
    checkLetterSelect(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (selectedIndices.length > 0) {
      if (activeWord.length >= 2) {
        onWordSubmit(activeWord);
      } else {
        SoundEffects.playError();
      }
    }
    // Reset sequence
    setSelectedIndices([]);
    setPointerPos(null);
  };

  // Prevent default scroll on touch moves inside wheel to prevent pulling down refresh page on mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: TouchEvent) => {
      if (selectedIndices.length > 0) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      container.removeEventListener("touchmove", preventScroll);
    };
  }, [selectedIndices]);

  return (
    <div className="flex flex-col items-center justify-center select-none py-1">
      {/* Floating Active Word Bubble above the wheel */}
      <div className="h-12 flex items-center justify-center mb-4">
        <AnimatePresence>
          {activeWord ? (
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: -10 }}
              className={`px-8 py-2.5 rounded-full font-black text-xl tracking-widest shadow-[0_0_30px_rgba(251,191,36,0.55)] border border-white/30 capitalize font-sans ${accentColorClass}`}
            >
              {activeWord.toLowerCase()}
            </motion.div>
          ) : (
            <div className="text-white/40 text-xs uppercase tracking-widest font-mono select-none px-4 text-center">
              Drag letters to connect words
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* The letter wheel container */}
      <div
        id="word-wheel"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative w-64 h-64 md:w-72 md:h-72 rounded-full border-2 flex items-center justify-center cursor-pointer shadow-3xl select-none backdrop-blur-md touch-none ${wheelColorClass}`}
      >
        {/* SVG Drawing Canvas for connection lines (using coordinate space 0-100) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-visible"
          viewBox="0 0 100 100"
        >
          {/* Active Connection Line Paths */}
          {selectedIndices.length > 1 && (
            <path
              d={selectedIndices
                .map((idx, i) => {
                  const pos = letterPositions[idx];
                  return `${i === 0 ? "M" : "L"} ${pos.x} ${pos.y}`;
                })
                .join(" ")}
              className="fill-none stroke-amber-450 stroke-[4] stroke-linecap-round stroke-linejoin-round"
              style={{
                filter: "drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.9))",
                stroke: accentColorClass.includes("amber") ? "#fbbf24" : "#a78bfa",
              }}
            />
          )}

          {/* Line pointing to user's current hand/cursor position */}
          {selectedIndices.length > 0 && pointerPos && (
            <line
              x1={letterPositions[selectedIndices[selectedIndices.length - 1]].x}
              y1={letterPositions[selectedIndices[selectedIndices.length - 1]].y}
              x2={pointerPos.x}
              y2={pointerPos.y}
              className="stroke-[3] stroke-linecap-round"
              style={{
                stroke: accentColorClass.includes("amber") ? "rgba(251, 191, 36, 0.75)" : "rgba(167, 139, 250, 0.75)",
                strokeDasharray: "2,2",
              }}
            />
          )}
        </svg>

        {/* Floating Letters */}
        {letterPositions.map((pos) => {
          const isSelected = selectedIndices.includes(pos.index);
          const selectOrderIdx = selectedIndices.indexOf(pos.index);

          return (
            <div
              key={pos.index}
              className="absolute select-none z-20 pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                animate={{
                  scale: isSelected ? 1.25 : 1,
                  backgroundColor: isSelected ? "rgba(251, 191, 36, 0.95)" : "rgba(255, 255, 255, 0.12)",
                  borderColor: isSelected ? "#fbbf24" : "rgba(255, 255, 255, 0.25)",
                  boxShadow: isSelected 
                    ? "0 0 25px rgba(251, 191, 36, 0.6)" 
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                }}
                className={`w-14 h-14 md:w-15 md:h-15 rounded-full border flex items-center justify-center select-none backdrop-blur-xl`}
              >
                <span
                  className={`text-2xl md:text-3xl font-black font-display select-none tracking-tight ${
                    isSelected ? "text-slate-900" : "text-white"
                  }`}
                >
                  {pos.char}
                </span>

                {/* Number index badge in connect sequence */}
                {isSelected && selectOrderIdx >= 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-amber-400 text-[9px] font-black flex items-center justify-center border border-amber-400 shadow-md">
                    {selectOrderIdx + 1}
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}

        {/* Center decorative circular glass sphere */}
        <button
          onClick={() => {
            Haptics.buttonTap();
            onShuffle?.();
          }}
          className="absolute w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 active:scale-95 transition-all shadow-inner text-white/50 cursor-pointer z-30"
          title="Shuffle letters"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>

      {/* Mini letter list hint display */}
      <div className="mt-3 flex gap-2 items-center text-xs opacity-50 font-mono tracking-wider font-semibold select-none">
        <span>LETTERS:</span>
        <div className="flex gap-1">
          {letters.map((c, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded-sm bg-white/10 uppercase">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
