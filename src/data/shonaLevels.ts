/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level } from "../types";

export const shonaLevels: Level[] = [
  {
    id: 1,
    levelNumber: 1,
    language: "shona",
    letters: ["M", "U", "S", "H", "A"],
    words: [
      {
        id: "s1_w1",
        word: "MUSHA",
        row: 2,
        col: 0,
        direction: "horizontal",
        definition: "Home or Village. A sacred place of family, ancestry, and belonging."
      },
      {
        id: "s1_w2",
        word: "MUSA",
        row: 2,
        col: 0,
        direction: "vertical",
        definition: "Grace, kindness, or mercy. Often used as a traditional name."
      },
      {
        id: "s1_w3",
        word: "SAMU",
        row: 4,
        col: 0,
        direction: "horizontal",
        definition: "A mathematical problem or sum (borrowed), or a branch / teat."
      }
    ],
    bonusWords: ["UMA", "USA", "HAMU", "SHAMU", "SUMA"],
    theme: {
      name: "Savannah Sunrise",
      bgClass: "bg-gradient-to-b from-amber-900 via-orange-850 to-amber-950",
      bgImage: "shona_savannah", // Matches generated image
      textColor: "text-amber-50",
      accentColor: "bg-amber-500 text-amber-950 hover:bg-amber-400",
      wheelColor: "bg-amber-950/80 border-amber-500/50"
    }
  },
  {
    id: 2,
    levelNumber: 2,
    language: "shona",
    letters: ["G", "O", "M", "O", "A"],
    words: [
      {
        id: "s2_w1",
        word: "GOMO",
        row: 0,
        col: 1,
        direction: "horizontal",
        definition: "Mountain or large hill. Represents strength and majesty in Shona culture."
      },
      {
        id: "s2_w2",
        word: "MAGO",
        row: 0,
        col: 3,
        direction: "vertical",
        definition: "Wasps or hornets. Known for their active, buzzing colonies."
      },
      {
        id: "s2_w3",
        word: "GAMA",
        row: 2,
        col: 3,
        direction: "horizontal",
        definition: "To catch in mid-air (e.g. gama bhora - catch the ball) or gasp for air."
      },
      {
        id: "s2_w4",
        word: "MOGA",
        row: 2,
        col: 5,
        direction: "vertical",
        definition: "You alone (singular). Implies action done in solitude."
      }
    ],
    bonusWords: ["OGA", "OMA", "GOBA", "MAMO"],
    theme: {
      name: "Misty Highlands",
      bgClass: "bg-gradient-to-b from-slate-900 via-teal-950 to-emerald-950",
      bgImage: "misty_mountains", // Matches generated image
      textColor: "text-teal-50",
      accentColor: "bg-teal-500 text-teal-950 hover:bg-teal-400",
      wheelColor: "bg-slate-950/85 border-teal-500/50"
    }
  },
  {
    id: 3,
    levelNumber: 3,
    language: "shona",
    letters: ["A", "M", "A", "I", "O"],
    words: [
      {
        id: "s3_w1",
        word: "AMAI",
        row: 2,
        col: 0,
        direction: "horizontal",
        definition: "Mother. The cornerstone of the family and a highly respected title."
      },
      {
        id: "s3_w2",
        word: "MAI",
        row: 2,
        col: 1,
        direction: "vertical",
        definition: "Mother (shortened/conversational form) or madam."
      },
      {
        id: "s3_w3",
        word: "OMA",
        row: 0,
        col: 2,
        direction: "vertical",
        definition: "To dry up, harden, or become tough / stiff."
      }
    ],
    bonusWords: ["IMA", "MIA", "AMO", "MIO"],
    theme: {
      name: "Zambezi Mist",
      bgClass: "bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950",
      bgImage: "misty_mountains",
      textColor: "text-indigo-50",
      accentColor: "bg-indigo-400 text-slate-950 hover:bg-indigo-300",
      wheelColor: "bg-slate-950/80 border-indigo-500/50"
    }
  },
  {
    id: 4,
    levelNumber: 4,
    language: "shona",
    letters: ["C", "H", "A", "N", "D", "O"],
    words: [
      {
        id: "s4_w1",
        word: "CHANDO",
        row: 2,
        col: 0,
        direction: "horizontal",
        definition: "Cold weather, winter, or ice. Represents the chilly dry season (matsutso)."
      },
      {
        id: "s4_w2",
        word: "HANDI",
        row: 2,
        col: 1,
        direction: "vertical",
        definition: "I don't / I am not (e.g. handizivi - I don't know)."
      },
      {
        id: "s4_w3",
        word: "DONA",
        row: 5,
        col: 1,
        direction: "horizontal",
        definition: "To drip, fall down (like rain drops), or leak slowly."
      },
      {
        id: "s4_w4",
        word: "ONDA",
        row: 2,
        col: 5,
        direction: "vertical",
        definition: "To lose weight, become lean or thin."
      }
    ],
    bonusWords: ["DONA", "CHADO", "HADO", "NONDA", "CONA"],
    theme: {
      name: "Savannah Dusk",
      bgClass: "bg-gradient-to-b from-rose-950 via-red-900 to-amber-950",
      bgImage: "shona_savannah",
      textColor: "text-rose-50",
      accentColor: "bg-rose-550 text-white hover:bg-rose-400 bg-rose-500",
      wheelColor: "bg-rose-950/80 border-rose-500/50"
    }
  },
  {
    id: 5,
    levelNumber: 5,
    language: "shona",
    letters: ["Z", "U", "V", "A", "M"],
    words: [
      {
        id: "s5_w1",
        word: "ZUVA",
        row: 2,
        col: 0,
        direction: "horizontal",
        definition: "The Sun or a Day. Source of energy and calendar time."
      },
      {
        id: "s5_w2",
        word: "VUMA",
        row: 2,
        col: 2,
        direction: "vertical",
        definition: "To agree, accept, confess, or sing/respond in a harmony."
      },
      {
        id: "s5_w3",
        word: "MUZA",
        row: 3,
        col: 1,
        direction: "horizontal",
        definition: "One who comes, a visitor, or an heir (from ku-za)."
      }
    ],
    bonusWords: ["MUVU", "MUKA", "AMU", "VAZ", "UVA"],
    theme: {
      name: "Golden Highveld",
      bgClass: "bg-gradient-to-b from-orange-950 via-yellow-950 to-stone-950",
      bgImage: "shona_savannah",
      textColor: "text-yellow-50",
      accentColor: "bg-amber-400 text-stone-950 hover:bg-amber-300",
      wheelColor: "bg-stone-950/85 border-amber-500/40"
    }
  }
];
