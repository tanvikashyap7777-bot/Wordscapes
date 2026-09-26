/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Capacitor } from "@capacitor/core";
import {
  Languages,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Volume2,
  VolumeX,
  Award,
  Info,
  X,
  Play,
  Lightbulb,
  MapPin,
  Trophy,
  Plus,
  Coins
} from "lucide-react";

import { shonaLevels } from "./data/shonaLevels";
import { englishLevels } from "./data/englishLevels";
import { Level, WordItem } from "./types";
import { SoundEffects } from "./components/SoundEffects";
import GameGrid from "./components/GameGrid";
import WordWheel from "./components/WordWheel";
import { HomeScreen } from "./components/HomeScreen";
import { MapScreen } from "./components/MapScreen";
import { Haptics } from "./utils/haptics";

// @ts-ignore
import shonaSavannah from "./assets/images/shona_savannah_1780112193151.png";
// @ts-ignore
import mistyMountains from "./assets/images/misty_mountains_1780112210275.png";

const bgImageMap: Record<string, string> = {
  shona_savannah: shonaSavannah,
  misty_mountains: mistyMountains,
};

type ScreenView = "home" | "map" | "game";

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenView>("home");

  // 1. Core State
  const [language, setLanguage] = useState<"shona" | "english">("shona");
  const [currentLevelNo, setCurrentLevelNo] = useState<number>(1);
  const [solvedWords, setSolvedWords] = useState<string[]>([]);
  const [solvedBonusWords, setSolvedBonusWords] = useState<string[]>([]);
  const [revealedCells, setRevealedCells] = useState<Record<string, string>>({}); // "row,col" -> "A"
  const [coins, setCoins] = useState<number>(250);

  // Stats / Unlocks
  const [shonaMaxLevel, setShonaMaxLevel] = useState<number>(1);
  const [englishMaxLevel, setEnglishMaxLevel] = useState<number>(1);

  // Interactive UI State
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTargetRevealActive, setIsTargetRevealActive] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState<boolean>(false);
  
  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "bonus" | "info" | "error">("info");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Load configurations from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("wordscapes_lang") as "shona" | "english";
      const savedCoins = localStorage.getItem("wordscapes_coins");
      const savedShonaMax = localStorage.getItem("wordscapes_shona_max");
      const savedEnglishMax = localStorage.getItem("wordscapes_english_max");

      if (savedLang) setLanguage(savedLang);
      if (savedCoins) setCoins(parseInt(savedCoins, 10));
      if (savedShonaMax) setShonaMaxLevel(parseInt(savedShonaMax, 10));
      if (savedEnglishMax) setEnglishMaxLevel(parseInt(savedEnglishMax, 10));

      // Load active level number for that language
      const savedLevel = localStorage.getItem(`wordscapes_level_${savedLang || "shona"}`);
      if (savedLevel) {
        setCurrentLevelNo(parseInt(savedLevel, 10));
      }
    } catch (e) {
      console.warn("Storage reading failed", e);
    }
  }, []);

  // 3. Current active levels lookup
  const levelsSource = language === "shona" ? shonaLevels : englishLevels;
  const currentLevel = useMemo(() => {
    const found = levelsSource.find((lvl) => lvl.levelNumber === currentLevelNo);
    return found || levelsSource[0];
  }, [levelsSource, currentLevelNo]);

  // Read saved state of solved words when level changes
  useEffect(() => {
    if (!currentLevel) return;
    try {
      const keyPrefix = `wordscapes_solved_${language}_lvl${currentLevel.levelNumber}`;
      const savedSolved = localStorage.getItem(keyPrefix);
      const savedBonus = localStorage.getItem(`${keyPrefix}_bonus`);
      const savedRevealed = localStorage.getItem(`${keyPrefix}_revealed`);

      if (savedSolved) {
        setSolvedWords(JSON.parse(savedSolved));
      } else {
        setSolvedWords([]);
      }

      if (savedBonus) {
        setSolvedBonusWords(JSON.parse(savedBonus));
      } else {
        setSolvedBonusWords([]);
      }

      if (savedRevealed) {
        setRevealedCells(JSON.parse(savedRevealed));
      } else {
        setRevealedCells({});
      }

      // Reset UI popovers
      setSelectedWord(null);
      setIsTargetRevealActive(false);
      setShowSuccessSplash(false);
    } catch (e) {
      console.warn("Error restoring level solved states", e);
    }
  }, [currentLevel, language]);

  // Helper: Trigger beautiful on-screen toasts
  const triggerToast = (msg: string, type: "success" | "bonus" | "info" | "error" = "info") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Track navigation & modal state in a ref for immediate access by hardware/system back button handlers
  const navigationStateRef = useRef({
    isTargetRevealActive,
    showSuccessSplash,
    showHowToPlay,
    showLevelSelect,
    selectedWord,
    currentScreen,
  });

  useEffect(() => {
    navigationStateRef.current = {
      isTargetRevealActive,
      showSuccessSplash,
      showHowToPlay,
      showLevelSelect,
      selectedWord,
      currentScreen,
    };
  }, [isTargetRevealActive, showSuccessSplash, showHowToPlay, showLevelSelect, selectedWord, currentScreen]);

  const lastBackPressTimeRef = useRef<number>(0);

  // Core Back Button Action Handler
  const handleBackAction = useCallback(() => {
    const state = navigationStateRef.current;

    // 1. Cancel Target (Bullseye) hint selection mode
    if (state.isTargetRevealActive) {
      setIsTargetRevealActive(false);
      return true;
    }

    // 2. Dismiss Level Complete Celebration Splash
    if (state.showSuccessSplash) {
      setShowSuccessSplash(false);
      return true;
    }

    // 3. Close How to Play modal
    if (state.showHowToPlay) {
      setShowHowToPlay(false);
      return true;
    }

    // 4. Close Level Select modal
    if (state.showLevelSelect) {
      setShowLevelSelect(false);
      return true;
    }

    // 5. Close Definition Clue / Word drawer
    if (state.selectedWord) {
      setSelectedWord(null);
      return true;
    }

    // 6. If currently on Game screen, navigate back to Map
    if (state.currentScreen === "game") {
      setCurrentScreen("map");
      return true;
    }

    // 7. If currently on Map screen, navigate back to Home
    if (state.currentScreen === "map") {
      setCurrentScreen("home");
      return true;
    }

    // 8. If on Home screen (root), prompt double-tap to exit on Android
    if (state.currentScreen === "home") {
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        // Exit application if on Android bridge or Capacitor
        if (typeof (window as any).AndroidBridge?.exitApp === "function") {
          (window as any).AndroidBridge.exitApp();
        } else if (typeof (Capacitor as any).Plugins?.App?.exitApp === "function") {
          (Capacitor as any).Plugins.App.exitApp();
        }
        return true;
      } else {
        lastBackPressTimeRef.current = now;
        triggerToast("Press back again to exit", "info");
        return true;
      }
    }

    return false;
  }, []);

  // Register Global Back Button Listeners (Android hardware, Capacitor, Cordova, Browser popstate, Escape key)
  useEffect(() => {
    const onBackButton = (e?: Event) => {
      if (e) {
        e.preventDefault?.();
      }
      handleBackAction();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleBackAction();
      }
    };

    // 1. Listen for Android Custom & Cordova events
    window.addEventListener("appBackButton", onBackButton);
    document.addEventListener("backbutton", onBackButton);

    // 2. Listen for Capacitor App Plugin backButton event if available
    let capacitorListenerHandle: { remove: () => void } | null = null;
    try {
      const capacitorApp = (Capacitor as any).Plugins?.App;
      if (capacitorApp && typeof capacitorApp.addListener === "function") {
        const promiseOrHandle = capacitorApp.addListener("backButton", () => {
          handleBackAction();
        });
        if (promiseOrHandle && typeof promiseOrHandle.then === "function") {
          promiseOrHandle.then((h: any) => {
            capacitorListenerHandle = h;
          }).catch(() => {});
        } else {
          capacitorListenerHandle = promiseOrHandle;
        }
      }
    } catch (e) {
      // Ignore if not running in Capacitor
    }

    // 3. Listen for Browser popstate & push history state for smooth back gesture handling
    const onPopState = () => {
      handleBackAction();
      window.history.pushState({ app: "wordscapes" }, "");
    };

    window.history.pushState({ app: "wordscapes" }, "");
    window.addEventListener("popstate", onPopState);

    // 4. Desktop Escape key
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("appBackButton", onBackButton);
      document.removeEventListener("backbutton", onBackButton);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
      if (capacitorListenerHandle && typeof capacitorListenerHandle.remove === "function") {
        capacitorListenerHandle.remove();
      }
    };
  }, [handleBackAction]);

  // Helper: Save current level states to localStorage
  const saveLevelState = (sol: string[], bon: string[], rev: Record<string, string>) => {
    try {
      const keyPrefix = `wordscapes_solved_${language}_lvl${currentLevel.levelNumber}`;
      localStorage.setItem(keyPrefix, JSON.stringify(sol));
      localStorage.setItem(`${keyPrefix}_bonus`, JSON.stringify(bon));
      localStorage.setItem(`${keyPrefix}_revealed`, JSON.stringify(rev));
    } catch (e) {
      console.warn("Persist failed", e);
    }
  };

  // Persist currency and overall progress
  const saveCoinsAndMaxProgress = (updatedCoins: number, updatedMax: number) => {
    try {
      setCoins(updatedCoins);
      localStorage.setItem("wordscapes_coins", updatedCoins.toString());
      if (language === "shona") {
        setShonaMaxLevel(updatedMax);
        localStorage.setItem("wordscapes_shona_max", updatedMax.toString());
      } else {
        setEnglishMaxLevel(updatedMax);
        localStorage.setItem("wordscapes_english_max", updatedMax.toString());
      }
    } catch (e) {
      console.warn("Progress save failed", e);
    }
  };

  // 4. Word Submission Processor
  const handleWordSubmit = (wordRaw: string) => {
    const wordClean = wordRaw.trim().toUpperCase();
    if (wordClean.length < 2) return;

    // A. Check in primary crossword grid words
    const matchingGridWord = currentLevel.words.find((w) => w.word.toUpperCase() === wordClean);
    if (matchingGridWord) {
      if (solvedWords.includes(wordClean)) {
        triggerToast(`"${wordClean.toLowerCase()}" is already solved!`, "info");
        SoundEffects.playError();
        Haptics.error();
        return;
      }

      // Add to solved words
      const nextSolved = [...solvedWords, wordClean];
      setSolvedWords(nextSolved);
      triggerToast(`Great! Found "${wordClean.toLowerCase()}"! +15 Coins`, "success");
      SoundEffects.playCorrectWord();
      Haptics.success();

      const newCoins = coins + 15;
      saveCoinsAndMaxProgress(newCoins, language === "shona" ? shonaMaxLevel : englishMaxLevel);
      saveLevelState(nextSolved, solvedBonusWords, revealedCells);

      // Auto popup definition drawer for educational translation!
      setSelectedWord(matchingGridWord);

      // Check if level completely solved
      const totalRequired = currentLevel.words.map((w) => w.word.toUpperCase());
      const isLevelComplete = totalRequired.every((requiredWord) => nextSolved.includes(requiredWord));

      if (isLevelComplete) {
        // Unlock next levels
        const activeMax = language === "shona" ? shonaMaxLevel : englishMaxLevel;
        const nextMax = Math.max(activeMax, currentLevel.levelNumber + 1);
        
        setTimeout(() => {
          SoundEffects.playLevelComplete();
          Haptics.levelComplete();
          setShowSuccessSplash(true);
          setSelectedWord(null);
          // Reward completion bonus (+50 Coins!)
          saveCoinsAndMaxProgress(coins + 65, nextMax); // 15 + 50
        }, 1200);
      }
      return;
    }

    // B. Check in supplementary Bonus dictionary list
    const isBonusWord = currentLevel.bonusWords.some((w) => w.toUpperCase() === wordClean);
    if (isBonusWord) {
      if (solvedBonusWords.includes(wordClean)) {
        triggerToast(`Already found bonus word: "${wordClean.toLowerCase()}"!`, "info");
        SoundEffects.playError();
        Haptics.error();
        return;
      }

      const nextBonus = [...solvedBonusWords, wordClean];
      setSolvedBonusWords(nextBonus);
      triggerToast(`Extra Bonus Word! "${wordClean.toLowerCase()}" (+5 Coins)`, "bonus");
      SoundEffects.playBonusWord();
      Haptics.bonus();

      const newCoins = coins + 5;
      saveCoinsAndMaxProgress(newCoins, language === "shona" ? shonaMaxLevel : englishMaxLevel);
      saveLevelState(solvedWords, nextBonus, revealedCells);
      return;
    }

    // C. Word not found in either list (Wrong anagram)
    triggerToast(`"${wordRaw.toLowerCase()}" isn't in this puzzle`, "error");
    SoundEffects.playError();
    Haptics.error();
  };

  // 5. Game Hints Controllers
  // A. Target Bullseye Hint
  const toggleBullseyeHint = () => {
    if (isTargetRevealActive) {
      setIsTargetRevealActive(false);
      Haptics.buttonTap();
      return;
    }

    if (coins < 120) {
      triggerToast("Need 120 coins for a Bullseye Hint!", "error");
      SoundEffects.playError();
      Haptics.error();
      return;
    }

    setIsTargetRevealActive(true);
    Haptics.buttonTap();
    triggerToast("Tap any empty letter tile on the board to reveal it!", "info");
  };

  // Execution: user selects a hidden crossword tile for Bullseye
  const handleCellClickForTargetReveal = (row: number, col: number) => {
    const cellKey = `${row},${col}`;
    
    // Find what word and letter corresponds to this location
    let targetChar = "";
    currentLevel.words.forEach((w) => {
      const len = w.word.length;
      for (let i = 0; i < len; i++) {
        const r = w.direction === "vertical" ? w.row + i : w.row;
        const c = w.direction === "horizontal" ? w.col + i : w.col;
        if (r === row && c === col) {
          targetChar = w.word[i].toUpperCase();
        }
      }
    });

    if (!targetChar) {
      setIsTargetRevealActive(false);
      return;
    }

    // Purchase reveal
    const updatedRevealed = { ...revealedCells, [cellKey]: targetChar };
    setRevealedCells(updatedRevealed);
    setIsTargetRevealActive(false);
    SoundEffects.playBonusWord();
    Haptics.bonus();

    const newCoins = coins - 120;
    saveCoinsAndMaxProgress(newCoins, language === "shona" ? shonaMaxLevel : englishMaxLevel);
    saveLevelState(solvedWords, solvedBonusWords, updatedRevealed);
    triggerToast("Bullseye revealed!", "success");
  };

  // B. Random Hint (Reveals a random unsolved letter on board)
  const handleRandomHint = () => {
    if (coins < 80) {
      triggerToast("Need 80 coins for a Random Hint!", "error");
      SoundEffects.playError();
      Haptics.error();
      return;
    }

    // Find all hidden tiles on grid
    const hiddenTiles: { r: number; c: number; char: string }[] = [];
    currentLevel.words.forEach((w) => {
      const len = w.word.length;
      const isWordSolved = solvedWords.includes(w.word.toUpperCase());
      if (isWordSolved) return; // already solved

      for (let i = 0; i < len; i++) {
        const r = w.direction === "vertical" ? w.row + i : w.row;
        const c = w.direction === "horizontal" ? w.col + i : w.col;
        const key = `${r},${c}`;
        
        // Skip if already manually revealed
        if (!revealedCells[key]) {
          hiddenTiles.push({ r, c, char: w.word[i].toUpperCase() });
        }
      }
    });

    if (hiddenTiles.length === 0) {
      triggerToast("No letters left to reveal!", "info");
      Haptics.error();
      return;
    }

    // Pick random hidden coordinate and purchase
    const randTile = hiddenTiles[Math.floor(Math.random() * hiddenTiles.length)];
    const key = `${randTile.r},${randTile.c}`;

    const updatedRevealed = { ...revealedCells, [key]: randTile.char };
    setRevealedCells(updatedRevealed);
    SoundEffects.playTick(1.5);
    Haptics.bonus();

    const newCoins = coins - 80;
    saveCoinsAndMaxProgress(newCoins, language === "shona" ? shonaMaxLevel : englishMaxLevel);
    saveLevelState(solvedWords, solvedBonusWords, updatedRevealed);
    triggerToast("Random letter revealed!", "success");
  };

  // C. AI Semantic Clue Hint (Deducts 50. Gives user a dictionary/meaning cue)
  const handleAICueHint = () => {
    if (coins < 60) {
      triggerToast("Need 60 coins for a Clue Hint!", "error");
      SoundEffects.playError();
      Haptics.error();
      return;
    }

    // Find remaining unsolved words
    const unsolvedWords = currentLevel.words.filter((w) => !solvedWords.includes(w.word.toUpperCase()));
    if (unsolvedWords.length === 0) {
      triggerToast("All words already solved!", "info");
      Haptics.error();
      return;
    }

    // Ask AI (or local lookup) for a semantic dictionary hint
    const targetWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)];
    
    // Set selected details to display as active drawer
    setSelectedWord(targetWord);
    SoundEffects.playTick(1.2);
    Haptics.bonus();

    const newCoins = coins - 60;
    saveCoinsAndMaxProgress(newCoins, language === "shona" ? shonaMaxLevel : englishMaxLevel);
    triggerToast(`Hint purchased for "${targetWord.word.length} letters"! Read definition below.`, "success");
  };

  // Reset current level progress manually
  const resetLevel = () => {
    if (window.confirm("Are you sure you want to reset solving progress for this level?")) {
      setSolvedWords([]);
      setSolvedBonusWords([]);
      setRevealedCells({});
      saveLevelState([], [], {});
      setSelectedWord(null);
      setIsTargetRevealActive(false);
      triggerToast("Level Reset!", "info");
    }
  };

  // Route to Language Track
  const handleSelectLanguageTrack = (track: "english" | "shona") => {
    Haptics.buttonTap();
    setLanguage(track);
    localStorage.setItem("wordscapes_lang", track);
    
    // Reset pointers for new language track
    const savedLevel = localStorage.getItem(`wordscapes_level_${track}`);
    if (savedLevel) {
      setCurrentLevelNo(parseInt(savedLevel, 10));
    } else {
      setCurrentLevelNo(1);
    }
    setCurrentScreen("map");
    triggerToast(`Loaded ${track === "shona" ? "Shona Track" : "English Track"}!`, "success");
    SoundEffects.playTick(1.1);
  };

  // Switch Language Module
  const handleToggleLanguage = () => {
    Haptics.buttonTap();
    const nextLang = language === "shona" ? "english" : "shona";
    handleSelectLanguageTrack(nextLang);
  };

  // Advance level
  const handleNextLevel = () => {
    Haptics.buttonTap();
    const totalLevels = language === "shona" ? shonaLevels.length : englishLevels.length;
    let nextLvl = currentLevelNo + 1;
    if (nextLvl > totalLevels) {
      nextLvl = 1; // loop back to 1
    }
    
    setCurrentLevelNo(nextLvl);
    localStorage.setItem(`wordscapes_level_${language}`, nextLvl.toString());
    setShowSuccessSplash(false);
  };

  // Toggle Mute Audio
  const handleToggleMute = () => {
    Haptics.buttonTap();
    const muted = SoundEffects.toggleMute();
    setIsMuted(muted);
    triggerToast(muted ? "Sound Muted" : "Sound Enabled", "info");
  };

  // Select level from map screen
  const handleSelectLevel = (lvlNo: number) => {
    Haptics.buttonTap();
    setCurrentLevelNo(lvlNo);
    localStorage.setItem(`wordscapes_level_${language}`, lvlNo.toString());
    setShowLevelSelect(false);
    setCurrentScreen("game");
    triggerToast(`Loaded Level ${lvlNo}!`, "info");
  };

  // Shuffle Letter Circle Positions visually (plays animation)
  const [shuffleKey, setShuffleKey] = useState<number>(0);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);

  useEffect(() => {
    if (currentLevel) {
      setShuffledLetters([...currentLevel.letters]);
    }
  }, [currentLevel]);

  const handleShuffleLetters = () => {
    Haptics.buttonTap();
    setShuffledLetters((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    setShuffleKey((prev) => prev + 1);
    SoundEffects.playTick(1.05);
  };

  // Auto-save game state when Android pauses or backgrounds the app
  useEffect(() => {
    const handleSaveOnPause = () => {
      if (document.hidden && currentLevel) {
        saveLevelState(solvedWords, solvedBonusWords, revealedCells);
        saveCoinsAndMaxProgress(coins, language === "shona" ? shonaMaxLevel : englishMaxLevel);
      }
    };
    document.addEventListener("visibilitychange", handleSaveOnPause);
    window.addEventListener("pagehide", handleSaveOnPause);
    return () => {
      document.removeEventListener("visibilitychange", handleSaveOnPause);
      window.removeEventListener("pagehide", handleSaveOnPause);
    };
  }, [currentLevel, solvedWords, solvedBonusWords, revealedCells, coins, language, shonaMaxLevel, englishMaxLevel]);

  // Dynamic Theme Styling
  const theme = currentLevel?.theme || {
    name: "Savannah Dusk",
    bgClass: "bg-slate-900",
    textColor: "text-white",
    accentColor: "bg-amber-500 text-stone-950",
    wheelColor: "bg-stone-950/80 border-amber-500/50"
  };

  const resolvedBgImage = bgImageMap[theme.bgImage || ""] || null;

  if (currentScreen === "home") {
    return <HomeScreen onSelectLanguage={handleSelectLanguageTrack} />;
  }

  if (currentScreen === "map") {
    return (
      <MapScreen
        levels={levelsSource}
        currentLevelNo={currentLevelNo}
        maxUnlockedLevel={language === "shona" ? shonaMaxLevel : englishMaxLevel}
        language={language}
        onSelectLevel={handleSelectLevel}
        onBackToHome={() => setCurrentScreen("home")}
      />
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full flex flex-col items-center justify-between text-white overflow-hidden font-sans select-none safe-area-bottom"
      style={{
        background: "radial-gradient(circle at top, #334155 0%, #0f172a 100%)",
      }}
    >
      {/* Immersive Starry Grid Backdrop Overlay */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#fbbf24 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Aesthetic Colorful Aura Glow Bubbles */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[110px] rounded-full pointer-events-none z-0" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* 1. Backdrop Image Overlay Blend for active level context */}
      {resolvedBgImage && (
        <img
          src={resolvedBgImage}
          alt={theme.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25 select-none pointer-events-none transition-opacity duration-1000 scale-[1.03]"
        />
      )}

      {/* 2. Audio & General Floating HUD Top Header with Safe Area Notch padding */}
      <header className="relative z-10 w-full max-w-md px-4 safe-area-top flex flex-col gap-2.5 shrink-0">
        <div className="w-full flex justify-between items-center h-13">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen("map")}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 cursor-pointer"
              title="Back to Map"
            >
              <ChevronLeft className="w-5 h-5 text-amber-400" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-0.5 font-display leading-none">
                TSVAGA MAZWI
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg tracking-tight font-display leading-tight">
                CHIKAMU {currentLevelNo}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg">
            {/* Smooth framer-motion layout language switcher slider */}
            <button
              onClick={handleToggleLanguage}
              className="flex items-center gap-2 pr-3.5 border-r border-white/15 select-none hover:opacity-90 active:scale-98 transition-all cursor-pointer"
              title={language === "shona" ? "Switch back to English" : "Switch back to Shona"}
            >
              <span className={`text-[10px] font-black tracking-wider transition-colors ${language === "english" ? "text-amber-400 font-bold" : "text-white/40"}`}>ENG</span>
              <div className="w-8 h-4.5 bg-white/15 rounded-full relative p-0.5 border border-white/10 flex items-center">
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className={`w-3 h-3 bg-amber-400 rounded-full ${language === "shona" ? "ml-auto" : "mr-auto"} shadow-[0_0_8px_rgba(251,191,36,0.65)]`}
                />
              </div>
              <span className={`text-[10px] font-black tracking-wider transition-colors ${language === "shona" ? "text-amber-400 font-bold" : "text-white/40"}`}>SHO</span>
            </button>

            {/* Premium Gold Vault Coins */}
            <div className="flex items-center gap-1.5 font-sans">
              <div className="w-4.5 h-4.5 bg-amber-400 rounded-sm flex items-center justify-center text-slate-950 font-black text-[9px] shadow-[0_0_10px_rgba(251,191,36,0.55)] select-none">
                $
              </div>
              <span className="text-white font-black text-xs md:text-sm tracking-tight">{coins.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Center Gameplay Zone */}
      <main className="relative z-10 w-full max-w-md flex flex-col items-center justify-between gap-2 py-1 grow px-4 min-h-0">
        
        {/* The Crossword Puzzle Interlocking Grid */}
        <GameGrid
          level={currentLevel}
          solvedWords={solvedWords}
          revealedCells={revealedCells}
          selectedWordId={selectedWord?.id || null}
          onSelectWord={(word) => setSelectedWord(word)}
          onCellClickForTargetReveal={handleCellClickForTargetReveal}
          isTargetRevealActive={isTargetRevealActive}
        />

        {/* Connect Action Wheels controller layout */}
        <div className="flex w-full items-center justify-between px-2 max-w-md mx-auto">
          {/* Left Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={toggleBullseyeHint}
              className={`p-3 rounded-full flex flex-col items-center justify-center transition-all border shadow-lg z-10 
                ${isTargetRevealActive ? "bg-amber-450 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.35)]" : "bg-white/5 hover:bg-white/10 text-amber-400 border-white/10"}`}
              title="Target Reveal cell (120c)"
            >
              <MapPin className={`w-5 h-5 ${isTargetRevealActive ? "text-stone-950 animate-bounce" : "text-amber-400"}`} />
              <span className="text-[8px] font-black uppercase mt-1 leading-none opacity-80">120c</span>
            </button>
          </div>

          <WordWheel
            key={`${currentLevel.id}_${shuffleKey}`}
            letters={shuffledLetters}
            onWordSubmit={handleWordSubmit}
            onShuffle={handleShuffleLetters}
            wheelColorClass="bg-white/5 border border-white/10"
            accentColorClass="bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          />

          {/* Right Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleRandomHint}
               className="p-3 rounded-full flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 text-amber-400 transition-all border border-white/10 shadow-lg z-10"
              title="Reveal random letter (80c)"
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-[8px] text-amber-400 font-black uppercase mt-1 leading-none opacity-80">80c</span>
            </button>
            <button
              onClick={handleAICueHint}
               className="p-3 rounded-full flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 text-sky-400 transition-all border border-white/10 shadow-lg z-10"
              title="Reveal clue (60c)"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[8px] text-sky-400 font-black uppercase mt-1 leading-none opacity-80">60c</span>
            </button>
          </div>
        </div>

      </main>

      {/* 5. IMMERSIVE COMPONENT OVERLAY DRAWER: Dynamic Dictionary Definitions Popup */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            className="fixed inset-x-0 bottom-0 z-40 max-w-sm mx-auto px-4 pb-8"
          >
            <div className="bg-slate-900 border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.65)] p-5 backdrop-blur-xl relative overflow-hidden">
              {/* Gold gradient aesthetic highlight */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_4px_12px_rgba(251,191,36,0.4)]" />
              
              <button
                onClick={() => setSelectedWord(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 mb-4 justify-start">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm bg-orange-500/20 text-orange-400 border border-orange-500/25">
                  {language === "shona" ? "TSANANGURO (CLUE)" : "MEANING NOTE"}
                </span>
                {solvedWords.includes(selectedWord.word) ? (
                  <span className="text-[9px] font-black uppercase tracking-wider text-green-400 border border-green-500/20 px-2 py-0.5 rounded-sm bg-green-500/5">
                    ✓ solved
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-sm bg-amber-500/5">
                    💡 clue
                  </span>
                )}
              </div>

              {/* Dynamic Theme Styled display bubbles */}
              <div className="flex flex-col items-center justify-center mb-4 mt-2 select-none">
                <div className="px-6 py-2 bg-amber-400 rounded-full text-slate-900 font-extrabold text-lg md:text-xl tracking-widest shadow-[0_0_25px_rgba(251,191,36,0.4)] uppercase font-display border border-white/35">
                  {selectedWord.word.toUpperCase().split("").join(" ")}
                </div>
              </div>
              
              <p className="text-center text-white/80 text-xs md:text-sm italic font-sans leading-relaxed px-1">
                {language === "shona" ? (
                  <span>
                    "{selectedWord.word.toLowerCase()}" zvinoreva kuti <strong className="text-amber-300 font-sans not-italic">"{selectedWord.definition}"</strong> muChirungu.
                  </span>
                ) : (
                  <span>
                    "{selectedWord.word.toLowerCase()}" means <strong className="text-amber-300 font-sans not-italic font-bold">"{selectedWord.definition}"</strong> in English.
                  </span>
                )}
              </p>

              {language === "shona" && (
                <div className="mt-4 p-2 rounded-xl bg-amber-500/5 border border-white/5 text-stone-400 text-[10px] text-center font-medium font-sans">
                  Learn cultural Shona vocabulary as you solve puzzles!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. TOAST GLOBAL FLOATER Notification Feed */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -45 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div
              className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm border backdrop-blur-md ${
                toastType === "success"
                  ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                  : toastType === "bonus"
                  ? "bg-purple-950/90 border-purple-500/30 text-purple-300"
                  : toastType === "error"
                  ? "bg-rose-950/90 border-rose-500/30 text-rose-300"
                  : "bg-stone-900/90 border-stone-700/50 text-stone-200"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-ping bg-current" />
              <span className="text-xs font-bold leading-normal">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FULL-SCREEN GAME MODALLERS */}
      {/* Modal A. How to Play Instruction Panel */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-stone-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display font-extrabold text-2xl text-yellow-300 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6" />
                <span>How to Play Wordscapes</span>
              </h2>

              <div className="space-y-4 text-xs text-stone-300 font-sans leading-relaxed">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-3xs font-black">1</span>
                    Solve Crosswords
                  </h3>
                  <p className="pl-5 mt-1">
                    Connect letters on the bottom circular wheel to submit words. Slide your finger or hold and drag your mouse.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-3xs font-black">2</span>
                    Explore Shona Track
                  </h3>
                  <p className="pl-5 mt-1">
                    Play levels featuring rich vocabulary in Shona! Learn meanings of cultural words like <span className="italic text-yellow-400">"Musha"</span> (Home) and <span className="italic text-yellow-400">"Amai"</span> (Mother) by clicking them in the solved grid!
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-3xs font-black">3</span>
                    Leverage Hints
                  </h3>
                  <p className="pl-5 mt-1">
                    Spend coins on <b>Bullseye hints</b> (tap specific tiles to unlock) or <b>Word clues</b> (inspect the meaning of hidden grid terms to deduce them).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-3 mt-6 rounded-2xl bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold tracking-wider active:scale-95 transition-all text-sm"
              >
                Got It! Lets Play
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal B. Level Selector popover scrolling drawer */}
      <AnimatePresence>
        {showLevelSelect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-stone-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setShowLevelSelect(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display font-extrabold text-2xl text-yellow-300 mb-2">
                Level Selection Map
              </h2>
              <p className="text-stone-400 text-xxs uppercase tracking-wider mb-4 leading-none">
                Language category: <span className="text-yellow-400 font-bold">{language}</span>
              </p>

              <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1.5">
                {levelsSource.map((lvl) => {
                  const isCurrent = lvl.levelNumber === currentLevelNo;
                  const maxUnlocked = language === "shona" ? shonaMaxLevel : englishMaxLevel;
                  const isLocked = lvl.levelNumber > maxUnlocked;

                  return (
                    <button
                      key={lvl.id}
                      disabled={isLocked && false} // Disable block strictly or allow freeplay as sandbox? Let's allow unlocks but marklocked!
                      onClick={() => handleSelectLevel(lvl.levelNumber)}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border font-bold text-lg select-none transition-all active:scale-95 ${
                        isCurrent
                          ? "bg-amber-400 text-stone-950 border-amber-300 scale-105 shadow-md shadow-amber-500/20"
                          : isLocked
                          ? "bg-stone-950/60 text-stone-600 border-stone-850 cursor-not-allowed opacity-60"
                          : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                      }`}
                    >
                      <span className="leading-none">{lvl.levelNumber}</span>
                      
                      {isLocked && (
                        <span className="text-[9px] font-semibold text-yellow-500/55 absolute bottom-1 uppercase leading-none">
                          Locked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Reset All progression button */}
              <button
                onClick={() => {
                  if (window.confirm("Warning: This will clear all level achievements and coin scores! Proceed?")) {
                    localStorage.clear();
                    setCoins(250);
                    setShonaMaxLevel(1);
                    setEnglishMaxLevel(1);
                    setCurrentLevelNo(1);
                    setSolvedWords([]);
                    setSolvedBonusWords([]);
                    setRevealedCells({});
                    setShowLevelSelect(false);
                    triggerToast("All Progress Erased!", "error");
                  }
                }}
                className="w-full mt-6 py-2.5 rounded-xl bg-red-650 text-red-100 hover:bg-red-600 font-bold transition-all hover:text-white text-xs border border-red-500/10 text-red-500 bg-red-500/10"
              >
                Reset All App Achievements
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal C. LEVEL COMPLETED SUCCESS SPLASH SCREEN CELEBRATION! */}
      <AnimatePresence>
        {showSuccessSplash && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-stone-950/95 backdrop-blur-md">
            
            {/* Spinning decorative sun/ring */}
            <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-radial from-amber-500/35 to-transparent blur-3xl animate-pulse pointer-events-none" />

            <motion.div
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
              className="text-center' flex flex-col items-center p-6 text-center select-none"
            >
              <div className="relative mb-5 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-dashed border-3 border-amber-400 absolute"
                />
                <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center shadow-lg relative z-10 animate-bounce">
                  <Award className="w-10 h-10 text-stone-950" />
                </div>
              </div>

              <h2 className="font-display font-extrabold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 tracking-tight leading-none drop-shadow-lg scale-102">
                Level Complete!
              </h2>
              
              <p className="text-stone-300 text-sm font-sans mt-3 max-w-xs font-semibold leading-relaxed">
                Superb! You solved all hidden interlocking words on Level {currentLevelNo}!
              </p>

              {/* Bonus Coins rewarded indicator */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 inline-flex gap-2 items-center bg-yellow-300 text-stone-950 px-5.5 py-2.5 rounded-full font-sans font-extrabold text-base border-3 border-white shadow-xl glow-word"
              >
                <div className="flex gap-1 items-center">
                  <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
                  <Coins className="w-5 h-5 text-stone-950 animate-bounce" />
                </div>
                <span>65 COINS BONUS!</span>
              </motion.div>

              {/* Show complete breakdown */}
              {language === "shona" && (
                <div className="mt-6 py-3 px-4.5 rounded-2xl bg-white/5 border border-white/5 text-stone-300 font-sans text-xs flex flex-col gap-1 max-w-xs">
                  <span className="font-bold text-yellow-400 font-display">Shona Vocabulary Mastered:</span>
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {currentLevel.words.map((w) => (
                      <span key={w.id} className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-850 font-bold lowercase">
                        {w.word.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Button controllers */}
              <div className="mt-8 flex flex-col gap-3 w-64 select-none">
                <button
                  onClick={handleNextLevel}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 hover:from-amber-300 hover:to-yellow-400 font-extrabold text-base tracking-wider shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-250"
                >
                  <span>NEXT PLAY LEVEL</span>
                  <ChevronRight className="w-5 h-5 text-stone-950 stroke-[3]" />
                </button>
                
                <button
                  onClick={() => setShowSuccessSplash(false)}
                  className="py-3 text-xs text-white/50 hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  Review solved crossword
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
