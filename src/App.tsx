import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { Activity, AudioLines, Bluetooth, Check, ChevronDown, CircleHelp, Headphones, Mic, MicOff, Pause, Play, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, Volume2, Waves } from 'lucide-react';
import { AudioEngine } from './audio/AudioEngine';
import { DEFAULT_PREFS, loadPreferences, PRESETS } from './audio/types';
import type { AudioMetrics, AudioMode, EngineStatus, PresetName } from './audio/types';
import EqSliders from './ui/EqSliders';
import Spectrum from './ui/Spectrum';

const EMPTY_METRICS: AudioMetrics = { rmsDb: -100, lowDb: -100, voiceDb: -100, speech: false, rumble: false, peakDb: -100 };
const EMPTY_STATUS: EngineStatus = { running: false, mic: 'Microphone stopped', output: 'Not connected', sampleRate: 0, baseLatencyMs: null, outputLatencyMs: null };
const modeMeta: Record<AudioMode, { label: string; sub: string }> = {
  transparency: { label: 'Transparency', sub: 'Natural pass-through' },
  dialogue: { label: 'Dialogue boost', sub: 'Speech-focused DSP' },
  mute: { label: 'Mute / standby', sub: 'Zero output gain' },
};
export default function App() {
  const initial = useMemo(() => loadPreferences(), []);
  const [prefs, setPrefs] = useState(initial);
  const [engineStatus, setEngineStatus] = useState(EMPTY_STATUS);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const engineRef = useRef<AudioEngine | null>(null);
  const persistTimer = useRef<number | undefined>(undefined);
  const updatePrefs = useCallback((patch: Partial<typeof prefs>) => setPrefs(prev => ({ ...prev, ...patch })), []);

  useEffect(() => {
    window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      try { localStorage.setItem('auraassist.preferences.v1', JSON.stringify(prefs)); } catch { /* storage may be disabled */ }
    }, 100);
    return () => window.clearTimeout(persistTimer.current);
  }, [prefs]);
  useEffect(() => {
    const engine = new AudioEngine({ onMetrics: setMetrics, onStatus: setEngineStatus, onError: setError });
    engineRef.current = engine;
    return () => { engine.stop(); engineRef.current = null; };
  }, []);
  useEffect(() => { engineRef.current?.applyMode(prefs.mode); }, [prefs.mode]);
  useEffect(() => { engineRef.current?.setEq(prefs.gains); }, [prefs.gains]);
  useEffect(() => { engineRef.current?.setRumbleControl(prefs.rumbleControl); }, [prefs.rumbleControl]);
  useEffect(() => { engineRef.current?.setDialogueBoost(prefs.dialogueBoost); }, [prefs.dialogueBoost]);

  const start = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { await engineRef.current?.start(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not start the audio engine.'); }
    finally { setBusy(false); }
  };
  const stop = () => engineRef.current?.stop();
  const choosePreset = (value: PresetName) => {
    if (value === 'Custom') { updatePrefs({ preset: 'Custom' }); return; }
    updatePrefs({ preset: value, gains: [...PRESETS[value]] });
  };
  const changeGain = (index: number, value: number) => {
    const gains = [...prefs.gains]; gains[index] = value;
    const match = (Object.keys(PRESETS) as Array<keyof typeof PRESETS>).find(p => PRESETS[p].every((n, i) => n === gains[i]));
    updatePrefs({ gains, preset: match ?? 'Custom' });
  };
  const reset = () => updatePrefs({ ...DEFAULT_PREFS, gains: [...DEFAULT_PREFS.gains] });
  const analyser = engineRef.current?.getAnalyser() ?? null;

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Waves size={21}/></div><div><div className="brand-title">aura<span>assist</span></div><div className="brand-subtitle">SMART PASSTHROUGH PROCESSOR</div></div></div><button className="icon-btn" onClick={() => setHelpOpen(v => !v)} aria-expanded={helpOpen} aria-label="About AuraAssist"><CircleHelp size={20}/></button></header>
    {helpOpen && <section className="notice-card about-card"><div className="notice-icon"><ShieldCheck size={19}/></div><div><b>Software passthrough, not hardware ANC</b><p>AuraAssist captures your phone microphone and routes processed sound to the current system output. It cannot enable earbud transparency registers or guarantee safe/low-latency hearing assistance.</p></div></section>}
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-mark"/> PERSONAL AUDIO LAB <span className="version-chip">BETA · 1.0</span></div><h1>Hear your world.<br/><span>On your terms.</span></h1><p>Adaptive microphone passthrough with real-time speech clarity and a five-band EQ.</p></div><div className={`engine-orb ${engineStatus.running ? 'orb-active' : ''}`} aria-hidden="true"><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-core"><AudioLines size={38}/></div><span className="orb-tick tick-one"/><span className="orb-tick tick-two"/><span className="orb-tick tick-three"/></div></section>
    <section className="engine-panel"><div className="engine-state"><span className={engineStatus.running ? 'status-pip status-on' : 'status-pip'}/><div><b>{engineStatus.running ? 'ENGINE ONLINE' : 'ENGINE STANDBY'}</b><span>{engineStatus.running ? 'Mic stream connected' : 'Microphone access required'}</span></div></div><button className={`engine-button ${engineStatus.running ? 'engine-stop' : ''}`} onClick={engineStatus.running ? stop : start} disabled={busy}>{busy ? <span className="spinner"/> : engineStatus.running ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}{busy ? 'Starting…' : engineStatus.running ? 'Stop engine' : 'Start engine'}</button><div className="engine-foot"><span><Mic size={13}/>{engineStatus.mic}</span><span><Bluetooth size={13}/>{engineStatus.output}</span></div></section>
    {error && <div className="error-box" role="alert"><MicOff size={18}/><div><b>Audio engine could not start</b><p>{error}</p><span>Use HTTPS, allow microphone access, and keep this page in the foreground.</span></div><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
    <section className="section-block"><div className="section-title-row"><div><div className="section-kicker">01 / OPERATING MODE</div><h2>Choose your focus</h2></div><span className="tiny-status"><Activity size={13}/> LIVE DSP</span></div><div className="mode-grid">{(['transparency', 'dialogue', 'mute'] as AudioMode[]).map((mode, i) => { const Icon = [Volume2, Sparkles, Pause][i]; return <button key={mode} className={`mode-card ${prefs.mode === mode ? 'selected' : ''} ${mode === 'mute' ? 'muted-mode' : ''}`} onClick={() => updatePrefs({ mode })} aria-pressed={prefs.mode === mode}><div className="mode-icon"><Icon size={20}/></div><div className="mode-card-label">{modeMeta[mode].label}</div><div className="mode-card-sub">{modeMeta[mode].sub}</div>{prefs.mode === mode && <span className="selected-check"><Check size={12}/></span>}</button>; })}</div></section>
    <section className="section-block visual-section"><div className="section-title-row"><div><div className="section-kicker">02 / INPUT MONITOR</div><h2>Live spectrum</h2></div><span className={engineStatus.running ? 'live-badge' : 'idle-badge'}><i/> {engineStatus.running ? 'ANALYSING' : 'IDLE'}</span></div><Spectrum analyser={analyser} active={engineStatus.running} metrics={metrics}/><div className="metric-grid"><div className="metric-cell"><span>RMS LEVEL</span><b>{metrics.rmsDb > -99 ? `${Math.round(metrics.rmsDb)} dBFS` : '—'}</b></div><div className="metric-cell"><span>VOICE BAND</span><b>{metrics.voiceDb > -99 ? `${Math.round(metrics.voiceDb)} dBFS` : '—'}</b></div><div className="metric-cell"><span>DETECTION</span><b className="metric-text">{metrics.speech ? 'Speech' : metrics.rumble ? 'Low rumble' : 'Listening'}</b></div></div></section>
    <section className="section-block eq-section"><div className="section-title-row"><div><div className="section-kicker">03 / TONE SHAPING</div><h2>Five-band equalizer</h2></div><button className="text-button" onClick={reset}><RotateCcw size={14}/> Reset</button></div><div className="preset-row"><label htmlFor="preset-select">PRESET</label><div className="preset-select-wrap"><select id="preset-select" value={prefs.preset} onChange={e => choosePreset(e.target.value as PresetName)}><option>Flat</option><option>Vocal Clarity</option><option>Bass Boost</option><option>Podcast/Dialogue</option><option>Custom</option></select><ChevronDown size={15}/></div></div><EqSliders gains={prefs.gains} onChange={changeGain}/><div className="eq-disclaimer"><SlidersHorizontal size={15}/><span>EQ changes save automatically on this device. Slider range −12 to +12 dB.</span></div></section>
    <section className="section-block smart-section"><div className="section-title-row"><div><div className="section-kicker">04 / ADAPTIVE PROCESSING</div><h2>Smart controls</h2></div><div className="smart-icon"><Activity size={18}/></div></div><div className="setting-row"><div className="setting-symbol"><Waves size={18}/></div><div className="setting-copy"><b>Environmental rumble reduction</b><p>Gently attenuates sustained low-frequency energy in Dialogue Boost mode.</p><span className="setting-hint">BELOW 300 Hz · ADAPTIVE</span></div><button className={`toggle ${prefs.rumbleControl ? 'toggle-on' : ''}`} role="switch" aria-checked={prefs.rumbleControl} onClick={() => updatePrefs({ rumbleControl: !prefs.rumbleControl })}><span/></button></div><div className="setting-row boost-row"><div className="setting-symbol"><Sparkles size={18}/></div><div className="setting-copy"><b>Speech presence boost</b><p>Extra peaking-filter lift when voice-band energy is detected.</p><span className="setting-hint">1.0–3.5 kHz FORMANT BAND</span></div><output className="boost-value">+{prefs.dialogueBoost.toFixed(0)} <small>dB</small></output></div><input aria-label="Speech presence boost" className="boost-range" style={{ '--boost-fill': `${(prefs.dialogueBoost / 9) * 100}%` } as React.CSSProperties} type="range" min={0} max={9} step={1} value={prefs.dialogueBoost} onChange={e => updatePrefs({ dialogueBoost: Number(e.target.value) })}/><div className="range-labels boost-range-labels"><span>Subtle</span><span>Strong</span></div></section>
    <section className="section-block connection-section"><div className="section-title-row"><div><div className="section-kicker">05 / ROUTING & LATENCY</div><h2>Audio status</h2></div><Headphones size={20} className="status-headphones"/></div><div className="route-card"><div className="route-row"><div className="route-symbol"><Mic size={17}/></div><div className="route-info"><b>Microphone input</b><span>{engineStatus.mic}</span></div><span className={engineStatus.running ? 'route-dot ok' : 'route-dot'}/></div><div className="route-connector"/><div className="route-row"><div className="route-symbol"><Headphones size={17}/></div><div className="route-info"><b>System audio output</b><span>{engineStatus.output}</span></div><span className={engineStatus.running && prefs.mode !== 'mute' ? 'route-dot ok' : 'route-dot'}/></div></div><div className="latency-grid"><div><span>BASE LATENCY</span><b>{engineStatus.baseLatencyMs === null ? '—' : `~${engineStatus.baseLatencyMs} ms`}</b></div><div><span>OUTPUT LATENCY</span><b>{engineStatus.outputLatencyMs === null ? '—' : `~${engineStatus.outputLatencyMs} ms`}</b></div><div><span>SAMPLE RATE</span><b>{engineStatus.sampleRate ? `${(engineStatus.sampleRate / 1000).toFixed(1)} kHz` : '—'}</b></div></div><p className="latency-note">Web Audio context estimates are not end-to-end Bluetooth latency. Earbud buffering and OS routing can add substantial delay.</p></section>
    <section className="safety-note"><div className="safety-icon"><ShieldCheck size={17}/></div><div><b>Listen safely</b><p>Start at low volume. This experimental app is not a hearing aid, medical device, or replacement for environmental awareness. Bluetooth delay can impair conversation and situational awareness; stop immediately if audio feeds back or feels uncomfortable.</p></div></section>
    <footer className="footer"><div className="footer-brand"><div className="brand-mark small"><Waves size={15}/></div><span>AURAASSIST</span></div><span>PROCESS LOCALLY · NO ACCOUNT</span><span className="footer-version">V1.0.0 BETA</span></footer>
  </main>;
}
