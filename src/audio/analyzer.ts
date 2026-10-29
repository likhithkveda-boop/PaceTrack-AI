import type { AudioMetrics } from './types';
const db = (rms: number) => 20 * Math.log10(Math.max(rms, 1e-6));
export class SignalAnalyzer {
  private time = new Float32Array(2048); private freq = new Float32Array(1024); private lowRun = 0; private voiceRun = 0;
  constructor(private readonly analyser: AnalyserNode) { this.analyser.fftSize = 2048; this.analyser.smoothingTimeConstant = 0.72; this.analyser.minDecibels = -100; this.analyser.maxDecibels = -15; }
  read(): AudioMetrics {
    this.analyser.getFloatTimeDomainData(this.time); this.analyser.getFloatFrequencyData(this.freq);
    let sum = 0, peak = 0; for (let i = 0; i < this.time.length; i++) { const v = this.time[i]; sum += v * v; peak = Math.max(peak, Math.abs(v)); }
    const rms = Math.sqrt(sum / this.time.length); const hzPerBin = this.analyser.context.sampleRate / this.analyser.fftSize;
    let total = 0, low = 0, voice = 0;
    for (let i = 1; i < this.freq.length; i++) { const linear = Math.pow(10, this.freq[i] / 20); total += linear * linear; const hz = i * hzPerBin; if (hz < 300) low += linear * linear; if (hz >= 1000 && hz <= 3500) voice += linear * linear; }
    const lowRatio = low / Math.max(total, 1e-12), voiceRatio = voice / Math.max(total, 1e-12);
    const rmsDb = db(rms), lowDb = db(Math.sqrt(low / this.freq.length)), voiceDb = db(Math.sqrt(voice / this.freq.length));
    this.lowRun = lowRatio > 0.58 && rmsDb > -58 ? Math.min(12, this.lowRun + 1) : Math.max(0, this.lowRun - 1);
    this.voiceRun = voiceRatio > 0.12 && rmsDb > -52 && voiceDb > -55 ? Math.min(8, this.voiceRun + 1) : Math.max(0, this.voiceRun - 1);
    return { rmsDb, lowDb, voiceDb, speech: this.voiceRun >= 2, rumble: this.lowRun >= 5, peakDb: db(peak) };
  }
}