// Original synthesized sounds (Web Audio). No third-party notification sounds are
// used; an approved notification asset is still an open request. All gameplay
// works with sound off.

const STORAGE_KEY = 's-factor-sound';

class SoundManager {
  private ctx: AudioContext | null = null;
  enabled = readPreference();

  /** Must be called from a user gesture before any sound can play. */
  unlock(): void {
    if (!this.enabled) return;
    try {
      this.ctx ??= new AudioContext();
      if (this.ctx.state === 'suspended') void this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      // Storage may be unavailable (private mode); the toggle still works for this session.
    }
    if (on) this.unlock();
  }

  /** Short two-note chime for simulated messages. */
  chime(): void {
    this.tone(880, 0, 0.12, 0.08);
    this.tone(1320, 0.09, 0.18, 0.07);
  }

  /** Soft click used as an optional beat cue. */
  tick(): void {
    this.tone(660, 0, 0.05, 0.05);
  }

  private tone(freq: number, delay: number, length: number, gain: number): void {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + length + 0.02);
  }
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export const sound = new SoundManager();
