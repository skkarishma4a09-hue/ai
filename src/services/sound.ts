// Synthesized Web Audio API sound alert engine for AgriMind notifications & reminders

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'SUCCESS';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private activeSources: OscillatorNode[] = [];

  constructor() {
    // Lazy initialized on first user interaction
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('agrimind_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('agrimind_sound_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.8;
      }
    }
  }

  private initCtx(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimind_sound_muted', String(muted));
    }
    if (muted) {
      this.stopAll();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimind_sound_volume', String(this.volume));
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setEnabled(enabled: boolean) {
    this.setMuted(!enabled);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stopAll() {
    this.activeSources.forEach(src => {
      try { src.stop(); } catch {}
    });
    this.activeSources = [];
  }

  // Plays alarm sound according to Alert Severity mapping
  public playAlarmForSeverity(severity: AlertSeverity | string) {
    if (this.isMuted) return;
    const sev = (severity || 'LOW').toUpperCase();
    switch (sev) {
      case 'CRITICAL':
        this.playCritical();
        break;
      case 'HIGH':
        this.playWarning();
        break;
      case 'MEDIUM':
        this.playAttention();
        break;
      case 'SUCCESS':
        this.playSuccess();
        break;
      case 'LOW':
      default:
        this.playNotification();
        break;
    }
  }

  // LOW severity: Gentle subtle chime (notification.mp3 synthetic equivalent)
  public playNotification() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

      const peakGain = 0.15 * this.volume;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.activeSources.push(osc);
      osc.start(now);
      osc.stop(now + 0.5);
      osc.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== osc);
      };
    } catch {}
  }

  // Alias for backward compatibility
  public playChime() {
    this.playNotification();
  }

  // MEDIUM severity: Double pleasant attention harmonic (attention.mp3 synthetic equivalent)
  public playAttention() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc2.frequency.setValueAtTime(783.99, now); // G5
      osc2.frequency.setValueAtTime(1046.5, now + 0.12); // C6

      const peakGain = 0.22 * this.volume;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      this.activeSources.push(osc1, osc2);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
      osc1.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== osc1 && s !== osc2);
      };
    } catch {}
  }

  // HIGH severity: Urgent warning warble (warning.mp3 synthetic equivalent)
  public playWarning() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Urgent warble between 700Hz and 880Hz
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.1);
      osc.frequency.linearRampToValueAtTime(700, now + 0.2);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc.frequency.linearRampToValueAtTime(700, now + 0.4);

      const peakGain = 0.28 * this.volume;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.activeSources.push(osc);
      osc.start(now);
      osc.stop(now + 0.7);
      osc.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== osc);
      };
    } catch {}
  }

  // Alias
  public playAlert() {
    this.playWarning();
  }

  // CRITICAL severity: Pulsing siren alarm (critical.mp3 synthetic equivalent)
  public playCritical() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      // 3 rapid emergency pulses
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.setValueAtTime(600, now + 0.15);
      osc.frequency.setValueAtTime(950, now + 0.3);
      osc.frequency.setValueAtTime(600, now + 0.45);
      osc.frequency.setValueAtTime(950, now + 0.6);

      const peakGain = 0.32 * this.volume;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.activeSources.push(osc);
      osc.start(now);
      osc.stop(now + 0.9);
      osc.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== osc);
      };
    } catch {}
  }

  public playEmergency() {
    this.playCritical();
  }

  // SUCCESS: Pleasant bright chord (success.mp3 synthetic equivalent)
  public playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc2.frequency.setValueAtTime(1046.50, now + 0.24); // C6

      const peakGain = 0.2 * this.volume;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      this.activeSources.push(osc1, osc2);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
      osc1.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== osc1 && s !== osc2);
      };
    } catch {}
  }
}

export const soundService = new SoundService();

