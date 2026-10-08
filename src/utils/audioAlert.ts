// Web Audio API Synthesizer for Industrial Alarm & Buzzer

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentOsc: OscillatorNode | null = null;
  private isBeeping: boolean = false;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playBuzzer(severity: 'WARNING' | 'DANGER' | 'CRITICAL' | 'FAULT') {
    if (this.isMuted || this.isBeeping) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.isBeeping = true;
      const ctx = this.audioCtx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (severity === 'CRITICAL') {
        // High urgency dual-tone siren
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);

        setTimeout(() => {
          this.isBeeping = false;
        }, 400);
      } else if (severity === 'DANGER') {
        // Rapid double beep
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);

        setTimeout(() => {
          this.isBeeping = false;
        }, 300);
      } else if (severity === 'WARNING') {
        // Mellow intermittent warning pulse
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);

        setTimeout(() => {
          this.isBeeping = false;
        }, 600);
      } else {
        // Sensor Fault click / tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);

        setTimeout(() => {
          this.isBeeping = false;
        }, 250);
      }
    } catch {
      // Audio context might be blocked prior to user interaction
      this.isBeeping = false;
    }
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  public stop() {
    if (this.currentOsc) {
      try {
        this.currentOsc.stop();
        this.currentOsc.disconnect();
      } catch {
        // ignore
      }
      this.currentOsc = null;
    }
    this.isBeeping = false;
  }
}

export const soundSynth = new SoundSynthesizer();
