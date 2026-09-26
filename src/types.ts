/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WordDirection = "horizontal" | "vertical";

export interface WordItem {
  id: string; // Unique ID for key mapping
  word: string; // The target word, uppercase (e.g. "AMAI")
  row: number; // Starting row coordinate in grid
  col: number; // Starting column coordinate in grid
  direction: WordDirection;
  definition?: string; // Dictionary definition or translation (educational value!)
}

export interface Level {
  id: number;
  levelNumber: number;
  language: "english" | "shona";
  letters: string[]; // List of letters, e.g., ["A", "M", "A", "I"] or ["M", "U", "S", "H", "A"]
  words: WordItem[]; // Correct terms of the puzzle that intersect in the grid
  bonusWords: string[]; // Words valid in the language but not part of the grid
  theme: {
    name: string;
    bgClass: string;
    bgImage?: string;
    textColor: string;
    accentColor: string;
    wheelColor: string;
  };
}

export interface GridCell {
  row: number;
  col: number;
  letter: string;
  isSolved: boolean;
  wordIds: string[]; // Association to which word(s) use this cell
}

export interface WheelLetter {
  id: string;
  char: string;
  angle: number; // Angle in degrees/radians for circular layout
  x: number; // Relative x coordinate (0 - 100) or pixels
  y: number; // Relative y coordinate (0 - 100) or pixels
}
