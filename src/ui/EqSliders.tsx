import type React from 'react';
import { BASE_BANDS } from '../audio/types';
interface Props { gains:number[]; onChange:(index:number,value:number)=>void; }
export default function EqSliders({gains,onChange}:Props){return <div className="eq-list">{BASE_BANDS.map((band,i)=><div className="eq-band" key={band.id}>
  <div className="eq-band-heading"><div><span className="eq-name">{band.label}</span><span className="eq-range">{band.range}</span></div><output className={gains[i]>0?'gain-positive':gains[i]<0?'gain-negative':'gain-neutral'}>{gains[i]>0?'+':''}{gains[i]} <small>dB</small></output></div>
  <input aria-label={`${band.label} gain`} type="range" min={-12} max={12} step={1} value={gains[i]} style={{'--range-fill':`${((gains[i]+12)/24)*100}%`} as React.CSSProperties} onChange={e=>{onChange(i,Number(e.target.value));if('vibrate'in navigator)navigator.vibrate?.(5)}} />
  <div className="range-labels"><span>−12 dB</span><span>0</span><span>+12 dB</span></div>
</div>)}</div>}
