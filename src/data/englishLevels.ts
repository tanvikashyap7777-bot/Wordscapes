/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level } from "../types";

export const englishLevels: Level[] = [
  {
    id: 101, // English is offset for unique ID's
    levelNumber: 1,
    language: "english",
    letters: ["S", "T", "A", "R", "E"],
    words: [
      {
        id: "e1_w1",
        word: "STAR",
        row: 0,
        col: 1,
        direction: "horizontal",
        definition: "A luminous astronomical object of plasma, or a celebrity."
      },
      {
        id: "e1_w2",
        word: "TEA",
        row: 0,
        col: 2,
        direction: "vertical",
        definition: "A hot drink made by infusing dried crushed leaves."
      },
      {
        id: "e1_w3",
        word: "ART",
        row: 0,
        col: 3,
        direction: "vertical",
        definition: "Creative expression, such as painting, sculpture, or music."
      },
      {
        id: "e1_w4",
        word: "EAT",
        row: 2,
        col: 1,
        direction: "horizontal",
        definition: "To consume food as nourishment."
      }
    ],
    bonusWords: ["STARE", "TEAR", "RATE", "RUST", "SEAT", "EARS", "ERA"],
    theme: {
      name: "Mountain Mist",
      bgClass: "bg-gradient-to-b from-slate-900 via-zinc-950 to-neutral-950",
      bgImage: "misty_mountains", // Cool aesthetic
      textColor: "text-slate-100",
      accentColor: "bg-sky-400 text-slate-950 hover:bg-sky-300",
      wheelColor: "bg-slate-950/80 border-sky-500/50"
    }
  },
  {
    id: 102,
    levelNumber: 2,
    language: "english",
    letters: ["G", "R", "O", "W", "N"],
    words: [
      {
        id: "e2_w1",
        word: "GROWN",
        row: 0,
        col: 0,
        direction: "horizontal",
        definition: "Fully developed or matured."
      },
      {
        id: "e2_w2",
        word: "GROW",
        row: 0,
        col: 0,
        direction: "vertical",
        definition: "To undergo natural development by increasing in size."
      },
      {
        id: "e2_w3",
        word: "WORN",
        row: 3,
        col: 0,
        direction: "horizontal",
        definition: "Damaged or shabby from use or wear."
      },
      {
        id: "e2_w4",
        word: "ROW",
        row: 0,
        col: 1,
        direction: "vertical",
        definition: "A line of things, or propelling a boat with oars."
      },
      {
        id: "e2_w5",
        word: "OWN",
        row: 0,
        col: 2,
        direction: "vertical",
        definition: "To possess or have something belonging to oneself."
      }
    ],
    bonusWords: ["WON", "NOW", "NOR", "RONG", "WRONG"],
    theme: {
      name: "Savannah Dusk",
      bgClass: "bg-gradient-to-b from-orange-950 via-amber-900 to-amber-950",
      bgImage: "shona_savannah",
      textColor: "text-amber-50",
      accentColor: "bg-orange-500 text-white hover:bg-orange-400",
      wheelColor: "bg-stone-950/80 border-orange-500/50"
    }
  },
  {
    id: 103,
    levelNumber: 3,
    language: "english",
    letters: ["P", "L", "A", "N", "E", "T"],
    words: [
      {
        id: "e3_w1",
        word: "PLANET",
        row: 2,
        col: 0,
        direction: "horizontal",
        definition: "A celestial body moving in an elliptical orbit around a star."
      },
      {
        id: "e3_w2",
        word: "PLATE",
        row: 2,
        col: 0,
        direction: "vertical",
        definition: "A flat dish, typically circular, from which food is eaten."
      },
      {
        id: "e3_w3",
        word: "LANE",
        row: 2,
        col: 1,
        direction: "vertical",
        definition: "A narrow road or path, often in the countryside."
      },
      {
        id: "e3_w4",
        word: "NET",
        row: 2,
        col: 3,
        direction: "vertical",
        definition: "A mesh fabric used for catching fish, butterflies, etc."
      }
    ],
    bonusWords: ["PLANT", "PALE", "PEAT", "NEAT", "PLAN", "LATE", "TAPE", "PEN", "LET", "TEN", "PAN", "TAN"],
    theme: {
      name: "Midnight Ridge",
      bgClass: "bg-gradient-to-b from-slate-950 via-indigo-950 to-zinc-950",
      bgImage: "misty_mountains",
      textColor: "text-indigo-50",
      accentColor: "bg-indigo-400 text-slate-950 hover:bg-indigo-300",
      wheelColor: "bg-slate-950/80 border-indigo-500/50"
    }
  },
  {
    id: 104,
    levelNumber: 4,
    language: "english",
    letters: ["S", "H", "I", "N", "E"],
    words: [
      {
        id: "e4_w1",
        word: "SHINE",
        row: 0,
        col: 0,
        direction: "horizontal",
        definition: "To emit or reflect light; be bright."
      },
      {
        id: "e4_w2",
        word: "SINE",
        row: 0,
        col: 0,
        direction: "vertical",
        definition: "A trigonometric function of an angle."
      },
      {
        id: "e4_w3",
        word: "HENS",
        row: 0,
        col: 1,
        direction: "vertical",
        definition: "Female chickens, known for laying eggs."
      }
    ],
    bonusWords: ["SHE", "HIS", "SIN", "HEN", "SEIN", "SHIN", "INS"],
    theme: {
      name: "Savannah Sunrise",
      bgClass: "bg-gradient-to-b from-amber-900 via-orange-850 to-amber-950",
      bgImage: "shona_savannah",
      textColor: "text-amber-100",
      accentColor: "bg-amber-400 text-stone-900 hover:bg-amber-300",
      wheelColor: "bg-amber-950/80 border-amber-500/50"
    }
  }
];
