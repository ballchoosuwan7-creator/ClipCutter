// Web Audio API Synthesizer for SFX and Music Ducking Simulation

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGainNode: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private isBgmPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = muted ? 0 : 0.2;
    }
  }

  public playSfx(type: 'whoosh' | 'pop' | 'impact' | 'rimshot' | 'ding') {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      if (type === 'whoosh') {
        // Filtered noise sweep
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.38);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.38);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.4);
      } else if (type === 'pop') {
        // High click / pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'impact') {
        // Cinematic sub bass boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'rimshot') {
        // Rimshot punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'ding') {
        // Sparkling high chime / ding
        const frequencies = [1320, 1760, 2640];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.02);

          gain.gain.setValueAtTime(0.25, now + idx * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.02);
          osc.stop(now + 0.85);
        });
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public setAudioDucking(isSpeaking: boolean, duckingVolumePercent: number = 15) {
    if (!this.bgmGainNode || !this.ctx || this.isMuted) return;
    const targetGain = isSpeaking ? (duckingVolumePercent / 100) * 0.35 : 0.28;
    this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.bgmGainNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
  }

  public startBgmLoop(mood: string = 'serious') {
    if (this.isBgmPlaying) return;
    try {
      const ctx = this.initContext();
      this.isBgmPlaying = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, ctx.currentTime);
      gain.connect(ctx.destination);
      this.bgmGainNode = gain;

      // Select chord tones based on mood
      let chord = [220, 277.18, 329.63]; // A minor
      if (mood === 'exciting' || mood === 'funny') {
        chord = [261.63, 329.63, 392.00]; // C major
      } else if (mood === 'inspiring') {
        chord = [293.66, 369.99, 440.00]; // D major
      } else if (mood === 'emotional') {
        chord = [174.61, 220.00, 261.63]; // F major / Dm
      }

      this.bgmOscillators = chord.map(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        return osc;
      });
    } catch {
      // Handle audio limitation
    }
  }

  public stopBgmLoop() {
    if (!this.isBgmPlaying) return;
    try {
      this.bgmOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.bgmOscillators = [];
      this.isBgmPlaying = false;
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
