import { SignalAnalyzer } from './analyzer';
import { BASE_BANDS } from './types';
import type { AudioMetrics, AudioMode, EngineStatus } from './types';
export interface AudioEngineCallbacks { onMetrics: (metrics: AudioMetrics) => void; onStatus: (status: EngineStatus) => void; onError: (message: string) => void; }
export class AudioEngine {
  private ctx: AudioContext | null = null; private stream: MediaStream | null = null; private source: MediaStreamAudioSourceNode | null = null; private analyser: AnalyserNode | null = null;
  private highPass: BiquadFilterNode | null = null; private rumbleLowPass: BiquadFilterNode | null = null; private rumbleGain: GainNode | null = null; private rumbleInvert: GainNode | null = null; private rumbleMix: GainNode | null = null;
  private eq: BiquadFilterNode[] = []; private dialogue: BiquadFilterNode | null = null; private compressor: DynamicsCompressorNode | null = null; private master: GainNode | null = null; private analyzer: SignalAnalyzer | null = null;
  private frame = 0; private running = false; private mode: AudioMode = 'transparency'; private rumbleControl = true; private dialogueBoost = 4; private gains = [0,0,0,0,0];
  constructor(private callbacks: AudioEngineCallbacks) {}
  async start(): Promise<void> {
    if (this.running) { if (this.ctx?.state === 'suspended') await this.ctx.resume(); return; }
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone capture is unavailable. Open this app on HTTPS in a supported browser.');
    try {
      const ctx = new AudioContext({ latencyHint: 'interactive' }); this.ctx = ctx; await ctx.resume();
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: { ideal: 1 } }, video: false });
      this.source = ctx.createMediaStreamSource(this.stream); this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 2048; this.analyser.smoothingTimeConstant = 0.68;
      this.highPass = ctx.createBiquadFilter(); this.highPass.type = 'highpass'; this.highPass.frequency.value = 80; this.highPass.Q.value = 0.707;
      this.rumbleLowPass = ctx.createBiquadFilter(); this.rumbleLowPass.type = 'lowpass'; this.rumbleLowPass.frequency.value = 280; this.rumbleLowPass.Q.value = 0.707;
      this.rumbleGain = ctx.createGain(); this.rumbleGain.gain.value = 0; this.rumbleMix = ctx.createGain(); this.rumbleMix.gain.value = 1;
      this.eq = BASE_BANDS.map(b => { const node = ctx.createBiquadFilter(); node.type = 'peaking'; node.frequency.value = b.frequency; node.Q.value = b.q; node.gain.value = 0; return node; });
      this.dialogue = ctx.createBiquadFilter(); this.dialogue.type = 'peaking'; this.dialogue.frequency.value = 2200; this.dialogue.Q.value = 1.05; this.dialogue.gain.value = 0;
      this.compressor = ctx.createDynamicsCompressor(); this.compressor.threshold.value = -24; this.compressor.knee.value = 30; this.compressor.ratio.value = 4; this.compressor.attack.value = 0.003; this.compressor.release.value = 0.25;
      this.master = ctx.createGain(); this.master.gain.value = this.mode === 'mute' ? 0 : 0.82;
      const invert = ctx.createGain(); invert.gain.value = -1; this.rumbleInvert = invert;
      this.source.connect(this.analyser); this.source.connect(this.highPass); this.highPass.connect(this.rumbleMix);
      this.source.connect(this.rumbleLowPass); this.rumbleLowPass.connect(this.rumbleGain); this.rumbleGain.connect(invert); invert.connect(this.rumbleMix);
      let previous: AudioNode = this.rumbleMix; for (const band of this.eq) { previous.connect(band); previous = band; }
      previous.connect(this.dialogue); this.dialogue.connect(this.compressor); this.compressor.connect(this.master); this.master.connect(ctx.destination);
      this.analyzer = new SignalAnalyzer(this.analyser); this.running = true; this.applyMode(this.mode); this.setEq(this.gains); this.setRumbleControl(this.rumbleControl); this.setDialogueBoost(this.dialogueBoost); this.tick(); this.emitStatus();
    } catch (error) { this.cleanup(); const message = error instanceof Error ? error.message : 'Unable to start microphone processing.'; this.callbacks.onError(message); throw error; }
  }
  stop(): void { this.cleanup(); this.callbacks.onMetrics({rmsDb:-100,lowDb:-100,voiceDb:-100,speech:false,rumble:false,peakDb:-100}); this.emitStatus(); }
  private cleanup(): void {
    this.running = false; cancelAnimationFrame(this.frame); this.stream?.getTracks().forEach(t => t.stop()); this.stream = null; const ctx = this.ctx; this.ctx = null;
    try { this.source?.disconnect(); this.highPass?.disconnect(); this.rumbleLowPass?.disconnect(); this.rumbleGain?.disconnect(); this.rumbleInvert?.disconnect(); this.rumbleMix?.disconnect(); this.eq.forEach(n => n.disconnect()); this.dialogue?.disconnect(); this.compressor?.disconnect(); this.master?.disconnect(); this.analyser?.disconnect(); } catch { /* already disconnected */ }
    this.source=null;this.highPass=null;this.rumbleLowPass=null;this.rumbleGain=null;this.rumbleInvert=null;this.rumbleMix=null;this.eq=[];this.dialogue=null;this.compressor=null;this.master=null;this.analyser=null;this.analyzer=null; if (ctx && ctx.state !== 'closed') void ctx.close();
  }
  private tick = () => {
    if (!this.running || !this.analyzer || !this.ctx) return; const metrics = this.analyzer.read(); this.callbacks.onMetrics(metrics); const now = this.ctx.currentTime;
    const speechBoost = this.mode === 'dialogue' && metrics.speech ? this.dialogueBoost : (this.mode === 'dialogue' ? this.dialogueBoost * 0.22 : 0); this.dialogue?.gain.setTargetAtTime(speechBoost, now, 0.07);
    const attenuate = this.mode === 'dialogue' && this.rumbleControl && metrics.rumble ? 0.72 : 0; this.rumbleGain?.gain.setTargetAtTime(attenuate, now, 0.22); this.frame = requestAnimationFrame(this.tick);
  };
  applyMode(mode: AudioMode): void {
    this.mode = mode;
    if (this.ctx) { const now = this.ctx.currentTime; this.master?.gain.setTargetAtTime(mode === 'mute' ? 0 : 0.82, now, 0.035); this.highPass?.frequency.setTargetAtTime(mode === 'dialogue' ? 115 : 80, now, 0.12); this.dialogue?.gain.setTargetAtTime(mode === 'dialogue' ? this.dialogueBoost * 0.22 : 0, now, 0.12); this.compressor?.threshold.setTargetAtTime(mode === 'dialogue' ? -24 : -6, now, 0.1); this.compressor?.ratio.setTargetAtTime(mode === 'dialogue' ? 4 : 1, now, 0.1); if (mode !== 'dialogue') this.rumbleGain?.gain.setTargetAtTime(0, now, 0.12); }
    this.emitStatus();
  }
  setEq(gains: number[]): void { this.gains = gains.slice(0, 5).map(v => Math.max(-12, Math.min(12, Number(v)||0))); this.eq.forEach((node, i) => { if (this.ctx) node.gain.setTargetAtTime(this.gains[i] ?? 0, this.ctx.currentTime, 0.035); }); }
  setDialogueBoost(gain: number): void { this.dialogueBoost = Math.max(0, Math.min(9, gain)); if (this.dialogue && this.ctx && this.mode === 'dialogue') this.dialogue.gain.setTargetAtTime(this.dialogueBoost * 0.22, this.ctx.currentTime, 0.08); }
  setRumbleControl(enabled: boolean): void { this.rumbleControl = enabled; if (!enabled && this.ctx) this.rumbleGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08); }
  getAnalyser(): AnalyserNode | null { return this.analyser; }
  private emitStatus(): void {
    const ctx = this.ctx; const status: EngineStatus = { running: this.running, mic: this.stream?.getAudioTracks().some(t=>t.readyState==='live') ? 'Microphone live' : 'Microphone stopped', output: this.mode === 'mute' ? 'Output muted' : (ctx?.state === 'running' ? 'Device output (Bluetooth if routed)' : 'Not connected'), sampleRate: ctx?.sampleRate ?? 0, baseLatencyMs: ctx && Number.isFinite(ctx.baseLatency) ? Math.round(ctx.baseLatency * 1000) : null, outputLatencyMs: ctx && Number.isFinite(ctx.outputLatency) ? Math.round(ctx.outputLatency * 1000) : null };
    this.callbacks.onStatus(status);
  }
}