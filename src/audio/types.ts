export type AudioMode = 'transparency' | 'dialogue' | 'mute';
export type BandId = 'bass' | 'lowMid' | 'vocal' | 'clarity' | 'air';
export interface EqBand { id: BandId; label: string; range: string; frequency: number; gain: number; q: number; }
export interface AudioMetrics { rmsDb: number; lowDb: number; voiceDb: number; speech: boolean; rumble: boolean; peakDb: number; }
export interface EngineStatus { running: boolean; mic: string; output: string; sampleRate: number; baseLatencyMs: number | null; outputLatencyMs: number | null; }
export const BASE_BANDS: EqBand[] = [
  { id: 'bass', label: 'Sub / Bass', range: '80–250 Hz', frequency: 160, gain: 0, q: 0.8 },
  { id: 'lowMid', label: 'Low-mid', range: '500 Hz', frequency: 500, gain: 0, q: 1 },
  { id: 'vocal', label: 'Mid / Vocal', range: '1 kHz', frequency: 1000, gain: 0, q: 1 },
  { id: 'clarity', label: 'High-mid / Clarity', range: '3 kHz', frequency: 3000, gain: 0, q: 1.1 },
  { id: 'air', label: 'Treble / Air', range: '8 kHz+', frequency: 8000, gain: 0, q: 0.8 },
];
export type PresetName = 'Flat' | 'Vocal Clarity' | 'Bass Boost' | 'Podcast/Dialogue' | 'Custom';
export const PRESETS: Record<Exclude<PresetName, 'Custom'>, number[]> = {
  'Flat': [0, 0, 0, 0, 0], 'Vocal Clarity': [-2, -1, 3, 5, 2], 'Bass Boost': [5, 3, 0, -1, 1], 'Podcast/Dialogue': [-4, -2, 4, 5, 1],
};
export const PREFS_KEY = 'auraassist.preferences.v1';
export interface SavedPreferences { mode: AudioMode; preset: PresetName; gains: number[]; dialogueBoost: number; rumbleControl: boolean; }
export const DEFAULT_PREFS: SavedPreferences = { mode: 'transparency', preset: 'Flat', gains: [0,0,0,0,0], dialogueBoost: 4, rumbleControl: true };
export function loadPreferences(): SavedPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') as Partial<SavedPreferences> | null;
    if (!saved) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...saved, gains: Array.isArray(saved.gains) && saved.gains.length === 5 ? saved.gains.map(v => Math.max(-12, Math.min(12, Number(v) || 0))) : DEFAULT_PREFS.gains };
  } catch { return DEFAULT_PREFS; }
}