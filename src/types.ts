export type ProfileRole = 'bowler' | 'batter' | 'all-rounder';
export type BowlingStyle = 'Right-Arm Fast' | 'Left-Arm Fast' | 'Right-Arm Spin' | 'Left-Arm Spin' | 'Medium';
export type BattingStance = 'Right-Hand' | 'Left-Hand';
export type PitchZone = 'yorker' | 'full' | 'good' | 'short';
export type PitchLine = 'outside_off' | 'stumps' | 'down_leg';
export type Outcome = 'dot' | 'runs' | 'boundary' | 'play_and_miss' | 'wicket';
export type SpeedUnit = 'kmh' | 'mph';
export interface Profile { id?: number; name: string; role: ProfileRole; bowlingStyle: BowlingStyle; battingStance: BattingStance; createdAt: number; }
export interface Delivery { id?: number; timestamp: number; bowlerId: number; batterId: number; speedKmh: number; speedMph: number; pitchZone: PitchZone; pitchLine: PitchLine; outcome: Outcome; pitchLengthMeters: number; }
export interface AppSettings { id?: number; pitchPreset: '22yd' | '18yd' | '16yd' | 'custom'; customPitchDistance: number; speedUnit: SpeedUnit; cameraAngle: 'side_on' | 'behind_stumps'; voiceAnnounce: boolean; voiceVolume: number; }
