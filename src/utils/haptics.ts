/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Native & Web Haptics Engine optimized for Android devices
class HapticsManager {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private vibrate(ms: number) {
    if (!this.isEnabled) return;
    try {
      // 1. AndroidBridge (Direct native Java Vibrator)
      if (typeof (window as any).AndroidBridge?.vibrate === "function") {
        (window as any).AndroidBridge.vibrate(ms);
        return;
      }
      // 2. Navigator Vibration API (Standard Android WebView & Chrome)
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(ms);
      }
    } catch {
      // Non-blocking fallback
    }
  }

  private vibratePattern(pattern: number[]) {
    if (!this.isEnabled) return;
    try {
      // 1. AndroidBridge
      if (typeof (window as any).AndroidBridge?.vibratePattern === "function") {
        (window as any).AndroidBridge.vibratePattern(pattern.join(","));
        return;
      }
      // 2. Navigator
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(pattern);
      }
    } catch {
      // Non-blocking fallback
    }
  }

  /**
   * Crisp micro-pulse when touching/connecting a letter on the Word Wheel
   */
  public tick() {
    this.vibrate(12);
  }

  /**
   * Subtle tick when dragging backward to undo the last selected letter
   */
  public backtrack() {
    this.vibrate(8);
  }

  /**
   * Quick tap on UI buttons (hints, shuffle, level buttons)
   */
  public buttonTap() {
    this.vibrate(10);
  }

  /**
   * Rewarding tactile double-pulse when a valid crossword word is submitted
   */
  public success() {
    this.vibratePattern([25, 40, 35]);
  }

  /**
   * Sparkling pulse when a bonus dictionary word is discovered
   */
  public bonus() {
    this.vibratePattern([15, 30, 20, 30, 35]);
  }

  /**
   * Distinct vibration when an invalid word is submitted or insufficient coins
   */
  public error() {
    this.vibrate(70);
  }

  /**
   * Grand triumphant celebration pattern when finishing the entire puzzle
   */
  public levelComplete() {
    this.vibratePattern([40, 50, 45, 60, 75]);
  }
}

export const Haptics = new HapticsManager();
