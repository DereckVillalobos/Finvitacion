export type Cue =
  | 'seal-crack'
  | 'paper'
  | 'whoosh'
  | 'ocean'
  | 'water'
  | 'bubble-pop'
  | 'magic-chime';
export class AudioManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambience: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;
  async unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : 0.42;
        this.master.connect(this.context.destination);
        this.noiseBuffer = this.context.createBuffer(
          1,
          this.context.sampleRate * 3,
          this.context.sampleRate,
        );
        const data = this.noiseBuffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < data.length; i++) {
          previous = (previous + Math.random() * 0.04 - 0.02) / 1.02;
          data[i] = previous * 4;
        }
      }
      if (this.context.state === 'suspended') await this.context.resume();
    } catch {
      /* Audio is enhancement; the invitation always continues. */
    }
  }
  setMuted(value: boolean) {
    this.muted = value;
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(
        value ? 0 : 0.42,
        this.context.currentTime,
        0.12,
      );
  }
  play(cue: Cue) {
    const c = this.context,
      master = this.master;
    if (!c || !master || c.state !== 'running') return;
    const now = c.currentTime;
    if (cue === 'magic-chime' || cue === 'bubble-pop') {
      const notes =
        cue === 'magic-chime' ? [659.25, 830.61, 987.77, 1318.5] : [520];
      notes.forEach((freq, i) => {
        const osc = c.createOscillator(),
          gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        if (cue === 'bubble-pop')
          osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.4);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.5);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
      return;
    }
    if (cue === 'ocean' && this.ambience) return;
    const source = c.createBufferSource(),
      filter = c.createBiquadFilter(),
      gain = c.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.value =
      cue === 'seal-crack' ? 4200 : cue === 'paper' ? 1800 : 650;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(now);
    if (cue === 'ocean') {
      source.loop = true;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 2);
      this.ambience = source;
    } else {
      const duration =
        cue === 'seal-crack' ? 0.16 : cue === 'paper' ? 0.7 : 1.3;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(
        cue === 'seal-crack' ? 0.7 : 0.3,
        now + 0.04,
      );
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      source.stop(now + duration + 0.01);
    }
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
  pause() {
    if (this.context?.state === 'running') void this.context.suspend();
  }
  resume() {
    if (this.context?.state === 'suspended') void this.context.resume();
  }
  stopOcean() {
    if (this.ambience) {
      this.ambience.stop();
      this.ambience = null;
    }
  }
  dispose() {
    this.stopOcean();
    void this.context?.close();
    this.context = null;
    this.master = null;
    this.noiseBuffer = null;
  }
}
