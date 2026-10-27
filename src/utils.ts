import type { Delivery, PitchZone, SpeedUnit } from './types';
export const kmhToMph = (v: number) => v / 1.609344;
export const displaySpeed = (kmh: number, unit: SpeedUnit) => Math.round(unit === 'kmh' ? kmh : kmhToMph(kmh));
export const unitLabel = (unit: SpeedUnit) => unit === 'kmh' ? 'km/h' : 'mph';
export const zoneLabel: Record<PitchZone,string> = { yorker: 'Yorker', full: 'Full', good: 'Good length', short: 'Short' };
export const outcomeLabel: Record<Delivery['outcome'],string> = { dot: 'Dot ball', runs: 'Runs', boundary: 'Boundary', play_and_miss: 'Play & miss', wicket: 'Wicket' };
export const dateLabel = (timestamp: number) => new Date(timestamp).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
export const average = (values: number[]) => values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
