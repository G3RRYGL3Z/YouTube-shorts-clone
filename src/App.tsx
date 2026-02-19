import { TierProvider } from './context/TierContext';
import { TierBar } from './components/TierBar';
import { ShortsFeed } from './components/ShortsFeed';
import './App.css';

const appStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  background: '#0d0d0f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const phoneFrameStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 300,
  height: 640,
  borderRadius: 28,
  overflow: 'hidden',
  boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
  border: '3px solid #16161a',
  background: '#0f0f0f',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

function App() {
  return (
    <TierProvider>
      <div className="app" style={appStyle}>
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Shorts+ phone demo
        </div>
        <div className="phone-frame" style={phoneFrameStyle}>
          <TierBar />
          <ShortsFeed />
        </div>
      </div>
    </TierProvider>
  );
}

export default App;
