// Web Audio API Sound Synthesizer with Mobile Speaker Optimization & Dynamics Compressor
// Zero external assets, 100% offline, crystal clear and loud on phone speakers!

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.9;
  private isUnlocked: boolean = false;

  constructor() {
    this.setupUnlockListeners();
  }

  /**
   * Mobile browsers (iOS Safari, Android Chrome) strictly require user interaction
   * to unlock AudioContext. We attach global touch/click listeners to wake it up immediately.
   */
  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.getContext();
      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        // Play silent 1-sample buffer to force hardware pipeline open on iOS
        try {
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);
          this.isUnlocked = true;
        } catch {}
      }
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Initialize master chain (Compressor -> Master Gain -> Destination)
      if (!this.compressor || !this.masterGain) {
        try {
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 1.5, this.ctx.currentTime);

          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        } catch {
          // Fallback if compressor fails
        }
      }
    }
    return this.ctx;
  }

  private getOutputNode(ctx: AudioContext): AudioNode {
    return this.compressor || this.masterGain || ctx.destination;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume * 1.5, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      // 1.5x boost for solid clarity on mobile phone speakers
      this.masterGain.gain.setValueAtTime(this.volume * 1.5, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Crisp, loud modern button tap
   */
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  /**
   * Realistic tumbling dice clack with tactile wooden clatter
   * Optimized for mobile phone audio range (700Hz - 2400Hz)
   */
  public playDiceRoll() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const clackPitches = [1100, 850, 1400, 950, 1200, 650];
      clackPitches.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Layer snappy impact tone
        osc.type = idx % 2 === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.04);

        gain.gain.setValueAtTime(0.85, time);
        gain.gain.exponentialRampToValueAtTime(0.005, time + 0.045);

        osc.connect(gain);
        gain.connect(this.getOutputNode(ctx));

        osc.start(time);
        osc.stop(time + 0.05);
      });
    } catch {}
  }

  /**
   * Clear, punchy marimba/woodblock step sound
   * Easily audible on small phone speakers
   */
  public playStep() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.9, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  /**
   * Joyful, bright ascending chime arpeggio for ladder climb
   * Frequencies: G4, C5, E5, G5, C6, E6 (392Hz - 1318Hz)
   */
  public playLadder() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.85, time);
        gain.gain.exponentialRampToValueAtTime(0.005, time + 0.22);

        osc.connect(gain);
        gain.connect(this.getOutputNode(ctx));

        osc.start(time);
        osc.stop(time + 0.24);
      });
    } catch {}
  }

  /**
   * Cartoon slide whistle down with vibrato for snake slide
   * Frequencies kept within mobile speaker range (950Hz -> 320Hz)
   */
  public playSnake() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const duration = 0.5;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Rich tone that cuts through mobile phone speakers
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + duration);

      // Lowpass filter to smooth the sawtooth into an organic comic whistle
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.getOutputNode(ctx));

      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {}
  }

  /**
   * Triumphant fanfare with rich harmonies for victory
   */
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [
        { f: 523.25, d: 0.14 }, // C5
        { f: 523.25, d: 0.14 }, // C5
        { f: 523.25, d: 0.14 }, // C5
        { f: 659.25, d: 0.28 }, // E5
        { f: 783.99, d: 0.28 }, // G5
        { f: 1046.5, d: 0.65 }, // C6
      ];

      let elapsed = 0;
      notes.forEach((note) => {
        const time = ctx.currentTime + elapsed;

        // Double oscillator for rich brass fanfare
        [note.f, note.f * 1.5].forEach((freq, subIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = subIdx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, time);

          const vol = subIdx === 0 ? 0.9 : 0.45;
          gain.gain.setValueAtTime(vol, time);
          gain.gain.exponentialRampToValueAtTime(0.005, time + note.d);

          osc.connect(gain);
          gain.connect(this.getOutputNode(ctx));

          osc.start(time);
          osc.stop(time + note.d + 0.02);
        });

        elapsed += note.d * 0.9;
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();
