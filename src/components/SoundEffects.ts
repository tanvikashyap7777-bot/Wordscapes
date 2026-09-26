/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple synthesizer for audio feedback in the game using Web Audio API
class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    // Setup Android / Mobile user interaction unlock & lifecycle listeners
    if (typeof window !== "undefined") {
      const unlock = () => {
        if (!this.isUnlocked) {
          this.initCtx();
          this.isUnlocked = true;
        }
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("pointerdown", unlock);
      };
      window.addEventListener("touchstart", unlock, { passive: true });
      window.addEventListener("pointerdown", unlock, { passive: true });

      // Handle Android app backgrounding & resuming to save battery
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === "running") {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx && this.ctx.state === "suspended" && !this.isMuted) {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  public initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended" && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAudio() {
    try {
      const ctx = this.initCtx();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn("Audio unlock error", e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ctx && this.ctx.state === "running") {
      this.ctx.suspend().catch(() => {});
    } else if (!this.isMuted && this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.isMuted;
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  public playTick(frequencyMultiplier: number = 1) {
    if (this.isMuted) return;
    try {
      const audioCtx = this.initCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(350 * frequencyMultiplier, audioCtx.currentTime);
      // Quickly slide up slightly
      osc.frequency.exponentialRampToValueAtTime(450 * frequencyMultiplier, audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  public playError() {
    if (this.isMuted) return;
    try {
      const audioCtx = this.initCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  public playCorrectWord() {
    if (this.isMuted) return;
    try {
      const audioCtx = this.initCtx();
      const now = audioCtx.currentTime;

      // Play a nice multi-note major chord (C Major)
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        // Stagger entrance slightly for arpeggio effect
        const startTime = now + i * 0.04;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.25);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  public playBonusWord() {
    if (this.isMuted) return;
    try {
      const audioCtx = this.initCtx();
      const now = audioCtx.currentTime;

      // Sparkly chime sound
      const notes = [587.33, 659.25, 783.99]; // D5, E5, G5
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        const startTime = now + i * 0.05;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.25);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  public playLevelComplete() {
    if (this.isMuted) return;
    try {
      const audioCtx = this.initCtx();
      const now = audioCtx.currentTime;

      // Joyful triumphant chord sequence
      const chord1 = [392.00, 493.88, 587.33]; // G major
      const chord2 = [523.25, 659.25, 783.99, 1046.50]; // C major high banner
      
      // Let's sweep/arpeggiate first chord
      chord1.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        const start = now + i * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });

      // Play final powerful chord with some delay
      const finalDelay = 0.25;
      chord2.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        const start = now + finalDelay + i * 0.04;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.linearRampToValueAtTime(freq + (i === 3 ? 10 : 0), start + 0.4);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.7);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.85);
      });
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }
}

export const SoundEffects = new SoundEffectsManager();
