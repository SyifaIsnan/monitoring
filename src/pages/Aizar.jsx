import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/* ── Data Statis & Initial State ────────────────────────── */

const DUMMY_USERS = ['Budi S.', 'Siti A.', 'Rizky M.', 'Dina F.', 'Agus T.', 'Nisa R.', 'Hendra K.'];
const ERROR_TYPES = [
  { type: 'warning', title: 'Login Gagal', desc: 'Percobaan login gagal 3x (Salah PIN)' },
  { type: 'danger', title: 'Pembayaran Gagal', desc: 'Timeout dari Payment Gateway' },
  { type: 'warning', title: 'QR Gagal', desc: 'Gagal generate QRIS dinamis' },
  { type: 'critical', title: 'NFC Mati', desc: 'Service NFC Reader tidak merespon' },
];

// Data awal untuk grafik cashflow (Pemasukan vs Pengeluaran)
const INITIAL_CASHFLOW = Array.from({ length: 15 }).map((_, i) => ({
  time: `10:${10 + i}`,
  pemasukan: Math.floor(Math.random() * 5000000) + 1000000,
  pengeluaran: Math.floor(Math.random() * 4000000) + 500000,
}));

/* ── Main Dashboard Component ───────────────────────────── */
export default function DashboardSmartPay() {
  const [registerToday, setRegisterToday] = useState(1284);
  const [activeUsers, setActiveUsers] = useState(3420);
  
  const [liveRegisters, setLiveRegisters] = useState([]);
  const [liveCashflow, setLiveCashflow] = useState(INITIAL_CASHFLOW);
  const [liveAlerts, setLiveAlerts] = useState([]);

  // Helper waktu
  const getCurrentTime = () => new Date().toLocaleTimeString('id-ID', { hour12: false });
  const getChartTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Inisialisasi list
    setLiveRegisters([
      { time: getCurrentTime(), name: 'Alex W.', phone: '+62 812-****-9901', status: 'verified' },
      { time: getCurrentTime(), name: 'Bambang P.', phone: '+62 857-****-1122', status: 'pending' },
    ]);
    
    setLiveAlerts([
      { type: 'warning', title: 'QR Gagal', desc: 'Gagal membaca QR dari Merchant A', time: getCurrentTime() }
    ]);

    // Simulasi Registrasi User (Tiap 3 detik)
    const regInterval = setInterval(() => {
      const hasNewUser = Math.random() > 0.4;
      if (hasNewUser) {
        setRegisterToday(prev => prev + 1);
        setLiveRegisters(prev => {
          const name = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
          const phone = `+62 8${Math.floor(Math.random() * 90) + 10}-****-${Math.floor(Math.random() * 9000) + 1000}`;
          const isVerified = Math.random() > 0.3;
          const newReg = { time: getCurrentTime(), name, phone, status: isVerified ? 'verified' : 'pending' };
          return [newReg, ...prev].slice(0, 6); // Simpan 6 data terbaru
        });
      }
    }, 3000);

    // Simulasi Cashflow Pemasukan & Pengeluaran (Tiap 2 detik)
    const cashflowInterval = setInterval(() => {
      setLiveCashflow(prev => {
        const newData = [...prev.slice(1)]; // Hapus data paling kiri
        newData.push({
          time: getChartTime(),
          pemasukan: Math.floor(Math.random() * 6000000) + 500000,
          pengeluaran: Math.floor(Math.random() * 5000000) + 200000,
        });
        return newData;
      });
      // Fluktuasi user aktif
      setActiveUsers(prev => prev + (Math.floor(Math.random() * 11) - 5));
    }, 2000);

    // Simulasi Alert Error (Tiap 4 detik)
    const alertInterval = setInterval(() => {
      const hasNewError = Math.random() > 0.6; 
      if (hasNewError) {
        setLiveAlerts(prev => {
          const errIndex = Math.floor(Math.random() * ERROR_TYPES.length);
          const newAlert = { ...ERROR_TYPES[errIndex], time: getCurrentTime() };
          return [newAlert, ...prev].slice(0, 6); // Simpan 6 error terbaru
        });
      }
    }, 4000);

    return () => {
      clearInterval(regInterval);
      clearInterval(cashflowInterval);
      clearInterval(alertInterval);
    };
  }, []);

  /* ── Helper Badges ──────────────────────────────────────── */
  const getRegBadge = (status) => {
    return status === 'verified' 
      ? <span className="badge badge-success" style={{ minWidth: 70, textAlign: 'center', fontSize: 11 }}>Verified</span>
      : <span className="badge badge-warning" style={{ minWidth: 70, textAlign: 'center', fontSize: 11 }}>Pending KYC</span>;
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case 'critical': 
        return <span className="badge" style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', minWidth: 70, textAlign: 'center', fontSize: '11px', padding: '4px 8px' }}>Critical</span>;
      case 'danger': 
        return <span className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', minWidth: 70, textAlign: 'center', fontSize: '11px', padding: '4px 8px' }}>Danger</span>;
      case 'warning': 
        return <span className="badge badge-warning" style={{ minWidth: 70, textAlign: 'center', fontSize: '11px', padding: '4px 8px' }}>Warning</span>;
      default: 
        return null;
    }
  };

  return (
    <>
      <Topbar title="SmartPay Monitoring Center" subtitle="Live analytics e-wallet: Registrasi, Cashflow, & System Health" />
      <div className="page-content section-gap">

        {/* ── 1. Top Stats Cards ────────────────────────────────── */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#3b82f6', '--stat-bg': 'rgba(59,130,246,.12)' }}>
            <div className="stat-info">
              <div className="stat-label">Register Hari Ini</div>
              <div className="stat-value">{registerToday.toLocaleString()}</div>
              <div className="stat-change up">+12% vs Kemarin</div>
            </div>
          </div>
          
          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#22c55e', '--stat-bg': 'rgba(34,197,94,.12)', animationDelay: '0.1s' }}>
            <div className="stat-info">
              <div className="stat-label">Active Users (Real-time)</div>
              <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeUsers.toLocaleString()}
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse-ring 2s infinite' }} />
              </div>
              <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Sedang membuka aplikasi</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#10b981', '--stat-bg': 'rgba(16,185,129,.12)', animationDelay: '0.2s' }}>
            <div className="stat-info">
              <div className="stat-label">Volume Pemasukan (Live)</div>
              <div className="stat-value" style={{ fontSize: 20 }}>Rp {((liveCashflow[liveCashflow.length-1]?.pemasukan || 0) / 1000000).toFixed(1)}M</div>
              <div className="stat-change up">Per detik ini</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#ef4444', '--stat-bg': 'rgba(239,68,68,.12)', animationDelay: '0.3s' }}>
            <div className="stat-info">
              <div className="stat-label">Volume Pengeluaran (Live)</div>
              <div className="stat-value" style={{ fontSize: 20 }}>Rp {((liveCashflow[liveCashflow.length-1]?.pengeluaran || 0) / 1000000).toFixed(1)}M</div>
              <div className="stat-change down" style={{ color: '#ef4444' }}>Per detik ini</div>
            </div>
          </div>
        </div>

        {/* ── 2. Grafik Pemasukan & Pengeluaran ─────────────────── */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.4s', marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Live Cashflow Transaksi (Pemasukan vs Pengeluaran)</div>
              <div className="card-subtitle">Update fluktuasi per detik (Dalam Rupiah)</div>
            </div>
            <span className="badge badge-success"><span className="badge-dot" /> Live Sync</span>
          </div>
          <div style={{ height: 320, width: '100%', marginTop: 20 }}>
            <ResponsiveContainer>
              <AreaChart data={liveCashflow} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `Rp${val / 1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="pemasukan" name="Top Up / Penerimaan" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="pengeluaran" name="Pembayaran / Transfer Keluar" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 3. Live Logs: Registrasi & Alerts ─────────────────── */}
        <div className="grid-2">
          
          {/* Tabel Registrasi User Baru */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Registrasi User</div>
                <div className="card-subtitle">Log pendaftaran real-time</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>User Info</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Status KYC</th>
                  </tr>
                </thead>
                <tbody>
                  {liveRegisters.map((reg, i) => (
                    <tr key={i} style={{ borderBottom: i < liveRegisters.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '12px 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', width: '70px' }}>{reg.time}</td>
                      <td style={{ padding: '12px 0', fontSize: 12 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{reg.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{reg.phone}</span>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>{getRegBadge(reg.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Alert Error (Desain yang kamu buat sebelumnya) */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Alert System</div>
                <div className="card-subtitle">Log anomali, gagal transaksi, NFC, dll</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Pesan Error</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Tingkat</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAlerts.map((a, i) => (
                    <tr key={i} style={{ borderBottom: i < liveAlerts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                       <td style={{ padding: '12px 0', fontSize: 12, color: '#ef4444', fontFamily: 'monospace', width: '70px' }}>{a.time}</td>
                       <td style={{ padding: '12px 0', fontSize: 12, color: a.type === 'critical' || a.type === 'danger' ? '#646464' : '#646464', fontWeight: 500 }}>
                          <span style={{display: 'block', fontWeight: 'bold'}}>{a.title}</span>
                          <span style={{fontSize: 11, color: 'var(--text-muted)', fontWeight: 'normal'}}>{a.desc}</span>
                       </td>
                       <td style={{ padding: '12px 0', textAlign: 'right' }}>{getAlertBadge(a.type)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}