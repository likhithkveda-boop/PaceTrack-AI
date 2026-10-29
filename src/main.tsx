import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/aura.css';

class StartupErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('AuraAssist render error:', error); }
  render() {
    if (this.state.error) return <main className="fatal-shell"><div className="fatal-panel"><div className="brand-mark">A</div><h1>AuraAssist</h1><h2>Startup issue</h2><p>A rendering error prevented the dashboard from loading.</p><pre>{this.state.error.message}</pre><button onClick={() => location.reload()}>Reload app</button></div></main>;
    return this.props.children;
  }
}
const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element in index.html');
createRoot(root).render(<React.StrictMode><StartupErrorBoundary><App /></StartupErrorBoundary></React.StrictMode>);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => { navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(console.warn); });