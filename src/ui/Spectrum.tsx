import { useEffect, useRef } from 'react';
import type { AudioMetrics } from '../audio/types';
interface Props { analyser: AnalyserNode | null; active: boolean; metrics: AudioMetrics; }
export default function Spectrum({ analyser, active, metrics }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf = 0; const bins = new Uint8Array(analyser?.frequencyBinCount ?? 512);
    const draw = () => {
      const bounds = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(bounds.width * dpr)), height = Math.max(1, Math.floor(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); const w = bounds.width, h = bounds.height; ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#0a1a20'; ctx.fillRect(0, 0, w, h);
      for (let y = 1; y < 5; y++) { ctx.beginPath(); ctx.strokeStyle = 'rgba(137,198,205,.08)'; ctx.moveTo(0, (h / 5) * y); ctx.lineTo(w, (h / 5) * y); ctx.stroke(); }
      for (let x = 1; x < 8; x++) { ctx.beginPath(); ctx.strokeStyle = 'rgba(137,198,205,.06)'; ctx.moveTo((w / 8) * x, 0); ctx.lineTo((w / 8) * x, h); ctx.stroke(); }
      if (active && analyser) analyser.getByteFrequencyData(bins); else bins.fill(0);
      const count = 72, gap = 3, barW = (w - gap * (count - 1)) / count;
      for (let i = 0; i < count; i++) { const idx = Math.floor(Math.pow(i / count, 1.65) * (bins.length * .82)); const value = active ? bins[idx] / 255 : .035 + Math.abs(Math.sin(i * .53)) * .035; const bh = Math.max(3, value * (h * .78)); const grad = ctx.createLinearGradient(0, h - bh, 0, h); grad.addColorStop(0, '#7af1e6'); grad.addColorStop(1, '#168b9b'); ctx.fillStyle = grad; ctx.globalAlpha = active ? .5 + (bins[idx] / 255) * .5 : .25; ctx.beginPath(); ctx.roundRect(i * (barW + gap), h - bh, Math.max(1, barW), bh, Math.min(3, barW / 2)); ctx.fill(); }
      ctx.globalAlpha = 1;
      const labels = ['60', '250', '1k', '3.5k', '8k', '16k']; ctx.fillStyle = '#78969c'; ctx.font = '10px ui-monospace, monospace'; labels.forEach((label, i) => ctx.fillText(label + ' Hz', 8 + i * (w - 55) / (labels.length - 1), h - 7));
      if (!active) { ctx.fillStyle = 'rgba(6,20,25,.48)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#829fa4'; ctx.font = '12px system-ui'; ctx.fillText('Start engine to view live spectrum', 14, 24); }
      raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, [analyser, active]);
  return <div className="spectrum-wrap"><canvas ref={canvasRef} aria-label="Live microphone frequency spectrum"/><div className="spectrum-readout"><span><i className={active ? 'dot-live' : 'dot-idle'}/>{active ? 'LIVE ANALYSIS' : 'ENGINE IDLE'}</span><span>INPUT RMS <b>{metrics.rmsDb <= -99 ? '—' : `${Math.round(metrics.rmsDb)} dBFS`}</b></span></div></div>;
}
