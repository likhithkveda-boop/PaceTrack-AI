import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class StartupErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('PaceTrack AI render error:', error); }
  render() {
    if (this.state.error) return <main style={{minHeight:'100vh',background:'#09090b',color:'#fafafa',fontFamily:'system-ui',padding:'32px',boxSizing:'border-box'}}><h1 style={{color:'#a3e635'}}>PaceTrack AI</h1><h2>App startup error</h2><p>The app hit a rendering error instead of showing a blank screen.</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',padding:'16px',background:'#18181b',borderRadius:'12px',color:'#fca5a5'}}>{this.state.error.message}</pre><button onClick={()=>location.reload()} style={{padding:'12px 18px',borderRadius:'8px',border:0,background:'#84cc16',color:'#09090b',fontWeight:700}}>Reload app</button></main>;
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element in index.html');
createRoot(rootElement).render(<React.StrictMode><StartupErrorBoundary><App /></StartupErrorBoundary></React.StrictMode>);
