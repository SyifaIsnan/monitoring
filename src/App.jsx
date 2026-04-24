import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Aizar from './pages/Aizar';
import Nadya from './pages/Nadya';
import Zaki from './pages/Zaki';
import './index.css';

function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--accent-light)', fontFamily: 'JetBrains Mono' }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--foreground)' }}>Halaman tidak ditemukan</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Gunakan navigasi di sidebar untuk berpindah halaman</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/aizar" element={<Aizar />} />
            <Route path="/nadya" element={<Nadya />} />
            <Route path="/zaki" element={<Zaki />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}