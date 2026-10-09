export type SoundscapeId = 'gamma-40hz' | 'alpha-10hz' | 'tokyo-rain' | 'deep-delta';

export interface SoundscapeMeta {
  id: SoundscapeId;
  title: string;
  subtitle: string;
  frequencyBadge: string;
}

export const SOUNDSCAPES: SoundscapeMeta[] = [
  {
    id: 'gamma-40hz',
    title: 'Binaural Beats (40Hz Gamma)',
    subtitle: 'Peak cognitive binding & deep work focus',
    frequencyBadge: '200Hz / 240Hz',
  },
  {
    id: 'alpha-10hz',
    title: 'Alpha Wave Soundscape',
    subtitle: 'Calm alertness & evening regeneration',
    frequencyBadge: '180Hz / 190Hz',
  },
  {
    id: 'tokyo-rain',
    title: 'Rain in Tokyo (Atmospheric)',
    subtitle: 'Filtered warm pink noise & acoustic masking',
    frequencyBadge: 'Low-Pass 650Hz',
  },
  {
    id: 'deep-delta',
    title: 'Night Cocoon Delta (2.5Hz)',
    subtitle: 'Slow-wave sleep onset & nervous system recovery',
    frequencyBadge: '110Hz / 112.5Hz',
  },
];

class BioSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentId: SoundscapeId = 'gamma-40hz';
  private nodes: AudioNode[] = [];
  private masterGain: GainNode | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public start(id?: SoundscapeId): void {
    if (id) {
      this.currentId = id;
    }
    this.stop();

    const ctx = this.ensureContext();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.6);
    master.connect(ctx.destination);
    this.masterGain = master;

    if (this.currentId === 'gamma-40hz' || this.currentId === 'alpha-10hz' || this.currentId === 'deep-delta') {
      const baseFreq =
        this.currentId === 'gamma-40hz' ? 200 : this.currentId === 'alpha-10hz' ? 174 : 110;
      const beatDiff =
        this.currentId === 'gamma-40hz' ? 40 : this.currentId === 'alpha-10hz' ? 10 : 2.5;

      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const panLeft = ctx.createStereoPanner();
      const panRight = ctx.createStereoPanner();

      oscLeft.type = 'sine';
      oscRight.type = 'sine';
      oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscRight.frequency.setValueAtTime(baseFreq + beatDiff, ctx.currentTime);

      panLeft.pan.setValueAtTime(-0.75, ctx.currentTime);
      panRight.pan.setValueAtTime(0.75, ctx.currentTime);

      oscLeft.connect(panLeft);
      oscRight.connect(panRight);
      panLeft.connect(master);
      panRight.connect(master);

      oscLeft.start();
      oscRight.start();
      this.nodes.push(oscLeft, oscRight, panLeft, panRight);
    }

    // Add a warm filtered noise layer for texture
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.currentId === 'tokyo-rain' ? 680 : 320, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.currentId === 'tokyo-rain' ? 0.9 : 0.28, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    whiteNoise.start();

    this.nodes.push(whiteNoise, filter, noiseGain);
    this.isPlaying = true;
  }

  public stop(): void {
    this.nodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    });
    this.nodes = [];
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.masterGain = null;
    }
    this.isPlaying = false;
  }

  public toggle(id?: SoundscapeId): boolean {
    if (this.isPlaying && (!id || id === this.currentId)) {
      this.stop();
      return false;
    }
    this.start(id || this.currentId);
    return true;
  }

  public playChime(): void {
    try {
      const ctx = this.ensureContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(792, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {
      // ignore if audio context blocked
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentId: this.currentId,
    };
  }
}

export const soundEngine = new BioSoundEngine();
