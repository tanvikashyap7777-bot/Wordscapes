/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Level, WordItem } from "../types";

interface GameGridProps {
  level: Level;
  solvedWords: string[]; // List of solved word strings, e.g. ["MUSHA"]
  revealedCells: Record<string, string>; // Manual reveals from hints: key "row,col" -> char "A"
  selectedWordId: string | null;
  onSelectWord: (word: WordItem | null) => void;
  onCellClickForTargetReveal?: (row: number, col: number) => void;
  isTargetRevealActive: boolean;
}

export default function GameGrid({
  level,
  solvedWords,
  revealedCells,
  selectedWordId,
  onSelectWord,
  onCellClickForTargetReveal,
  isTargetRevealActive,
}: GameGridProps) {
  // 1. Build and calculate grid coordinates
  const gridData = useMemo(() => {
    const cells: Record<string, { letter: string; solved: boolean; wordIds: string[]; words: WordItem[] }> = {};
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    // Evaluate each word's cell occupancy
    level.words.forEach((w) => {
      const isWordSolved = solvedWords.includes(w.word.toUpperCase());
      const len = w.word.length;

      for (let i = 0; i < len; i++) {
        const r = w.direction === "vertical" ? w.row + i : w.row;
        const c = w.direction === "horizontal" ? w.col + i : w.col;

        const key = `${r},${c}`;

        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);

        if (!cells[key]) {
          cells[key] = {
            letter: w.word[i].toUpperCase(),
            solved: isWordSolved,
            wordIds: [w.id],
            words: [w],
          };
        } else {
          // If any word covering this intersection cell is solved, the cell is revealed
          if (isWordSolved) {
            cells[key].solved = true;
          }
          cells[key].wordIds.push(w.id);
          cells[key].words.push(w);
        }
      }
    });

    // If grid is empty
    if (minRow === Infinity) {
      return { cells: {}, rows: 0, cols: 0, minRow: 0, minCol: 0 };
    }

    const rowsCount = maxRow - minRow + 1;
    const colsCount = maxCol - minCol + 1;

    return {
      cells,
      rows: rowsCount,
      cols: colsCount,
      minRow,
      minCol,
    };
  }, [level, solvedWords]);

  const { cells, rows, cols, minRow, minCol } = gridData;

  // Handle clicking a grid tile
  const handleTileClick = (r: number, c: number) => {
    const key = `${r},${c}`;
    const cell = cells[key];

    // If Bullseye/Target reveal tool is active, let parent know
    if (isTargetRevealActive && onCellClickForTargetReveal) {
      onCellClickForTargetReveal(r, c);
      return;
    }

    if (!cell) return;

    // Highlight or select word details for the clicked tile
    if (cell.solved || revealedCells[key]) {
      // Find matches
      const firstWord = cell.words[0];
      if (firstWord) {
        onSelectWord(firstWord);
      }
    }
  };

  // Render a grid cell
  const renderCellGrid = () => {
    const gridItems = [];

    // Wordscapes has varying grid bounds. We draw a bounding box grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const actualRow = minRow + r;
        const actualCol = minCol + c;
        const key = `${actualRow},${actualCol}`;
        const cell = cells[key];

        if (cell) {
          const isRevealed = cell.solved || !!revealedCells[key];
          const revealLetter = revealedCells[key] || cell.letter;

          // Check if this cell is part of the currently selected word
          const isActiveWord = selectedWordId ? cell.wordIds.includes(selectedWordId) : false;

          gridItems.push(
            <div
              key={key}
              onClick={() => handleTileClick(actualRow, actualCol)}
              className="relative aspect-square flex items-center justify-center p-0.5 cursor-pointer select-none"
              style={{
                gridRowStart: r + 1,
                gridColumnStart: c + 1,
              }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: isRevealed
                    ? "rgba(255, 255, 255, 0.92)"
                    : isTargetRevealActive
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                  borderColor: isActiveWord
                    ? "#f59e0b" // amber warning border
                    : isTargetRevealActive
                    ? "rgba(245, 158, 11, 0.6)"
                    : "rgba(255, 255, 255, 0.15)",
                  boxShadow: isRevealed
                    ? "0 0 15px rgba(255, 255, 255, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                    : "inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                }}
                whileHover={isTargetRevealActive ? { scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.45)" } : { scale: 1.05 }}
                className={`w-full h-full rounded-xl border flex items-center justify-center shadow-lg transition-all relative overflow-hidden backdrop-blur-xs`}
              >
                {/* Solved grid letter in Wordscapes */}
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.span
                      id={`cell-letter-${actualRow}-${actualCol}`}
                      initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 180, damping: 12 }}
                      className="text-xl md:text-2xl font-black font-display text-slate-900"
                    >
                      {revealLetter}
                    </motion.span>
                  ) : null}
                </AnimatePresence>

                {/* Bullseye pointer indicator */}
                {isTargetRevealActive && !isRevealed && (
                  <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center bg-transparent">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                )}

                {/* Sub-solved visual feedback overlay */}
                {cell.solved && (
                  <motion.div
                    initial={{ scale: 1.3, opacity: 0.3 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-yellow-300 pointer-events-none rounded-xl"
                  />
                )}
              </motion.div>
            </div>
          );
        } else {
          // Empty space in crossword Grid
          gridItems.push(
            <div
              key={`empty-${r}-${c}`}
              className="aspect-square bg-transparent pointer-events-none"
              style={{
                gridRowStart: r + 1,
                gridColumnStart: c + 1,
              }}
            />
          );
        }
      }
    }
    return gridItems;
  };

  if (rows === 0 || cols === 0) {
    return (
      <div className="flex items-center justify-center text-white/50 h-48 italic">
        Invalid puzzle grid layout.
      </div>
    );
  }

  // Calculate optimum dynamic sizing classes based on layout shape
  const gridStyle = {
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    maxWidth: cols >= rows ? "420px" : "340px",
  };

  return (
    <div className="w-full flex justify-center py-2 px-4 select-none">
      <div
        id="crossword-grid"
        className="grid gap-1.5 w-full aspect-square md:aspect-auto md:h-auto select-none p-4 rounded-2xl bg-black/15 backdrop-blur-xs border border-white/5 shadow-2xl items-center justify-center"
        style={gridStyle}
      >
        {renderCellGrid()}
      </div>
    </div>
  );
}
