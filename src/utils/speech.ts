import { LanguageCode } from '../types';

export const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  german: 'de-DE',
  italian: 'it-IT',
  russian: 'ru-RU',
};

export const LANGUAGE_NAMES: Record<LanguageCode, { ar: string; native: string; flag: string }> = {
  german: { ar: 'الألمانية', native: 'Deutsch', flag: '🇩🇪' },
  italian: { ar: 'الإيطالية', native: 'Italiano', flag: '🇮🇹' },
  russian: { ar: 'الروسية', native: 'Русский', flag: '🇷🇺' },
};

// Web Audio API sound synthesizer
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  playError() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  playCompletion() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEffects();

// Speech Synthesis
export function speakText(text: string, language: LanguageCode, rate = 0.88): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = LANGUAGE_LOCALES[language] || 'de-DE';
      utterance.lang = targetLocale;
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = targetLocale.split('-')[0].toLowerCase();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase() === targetLocale.toLowerCase()
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

// Compare pronunciation similarity between spoken text and target phrase
export function evaluatePronunciationSimilarity(spoken: string, target: string): number {
  const cleanSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

  if (cleanSpoken === cleanTarget) return 100;
  if (!cleanSpoken || !cleanTarget) return 0;

  // Simple token / character similarity
  const targetWords = cleanTarget.split(/\s+/);
  const spokenWords = cleanSpoken.split(/\s+/);

  let matchCount = 0;
  for (const word of targetWords) {
    if (spokenWords.includes(word)) {
      matchCount++;
    }
  }

  const tokenScore = (matchCount / targetWords.length) * 100;
  return Math.min(100, Math.round(tokenScore));
}
