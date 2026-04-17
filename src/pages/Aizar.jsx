import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/* ── Data Statis & Initial State ────────────────────────── */

const DUMMY_USERS = ['Budi S.', 'Siti A.', 'Rizky M.', 'Dina F.', 'Agus T.', 'Nisa R.', 'Hendra K.', 'Zaki A.', 'Nadya P.'];
const ERROR_TYPES = [
  { type: 'warning', title: 'Login Gagal', desc: 'Percobaan login gagal 3x (Salah PIN)' },
  { type: 'danger', title: 'Pembayaran Gagal', desc: 'Timeout dari Payment Gateway' },
  { type: 'warning', title: 'QR Gagal', desc: 'Gagal generate QRIS dinamis' },
  { type: 'critical', title: 'NFC Mati', desc: 'Service NFC Reader tidak merespon' },
];

const TRX_TYPES = [
  { type: 'topup', name: 'Top Up VA BCA', range: [50000, 1500000] },
  { type: 'topup', name: 'Top Up VA Mandiri', range: [50000, 1000000] },
  { type: 'payment', name: 'Bayar QRIS Toko', range: [15000, 350000] },
  { type: 'payment', name: 'Transfer Antar Bank', range: [50000, 2500000] },
  { type: 'payment', name: 'Bayar Tagihan PLN', range: [100000, 800000] },
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
  const [liveTransactions, setLiveTransactions] = useState([]); // State baru untuk Top Up & Pay

  // Helper waktu
  const getCurrentTime = () => new Date().toLocaleTimeString('id-ID', { hour12: false });
  const getChartTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  // Helper Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
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

    setLiveTransactions([
      { time: getCurrentTime(), user: 'Dina F.', action: 'Bayar QRIS Toko', type: 'payment', amount: 45000 },
      { time: getCurrentTime(), user: 'Rizky M.', action: 'Top Up VA BCA', type: 'topup', amount: 500000 },
    ]);

    // Simulasi Registrasi User (Tiap 3.5 detik)
    const regInterval = setInterval(() => {
      const hasNewUser = Math.random() > 0.5;
      if (hasNewUser) {
        setRegisterToday(prev => prev + 1);
        setLiveRegisters(prev => {
          const name = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
          const phone = `+62 8${Math.floor(Math.random() * 90) + 10}-****-${Math.floor(Math.random() * 9000) + 1000}`;
          const isVerified = Math.random() > 0.3;
          const newReg = { time: getCurrentTime(), name, phone, status: isVerified ? 'verified' : 'pending' };
          return [newReg, ...prev].slice(0, 6);
        });
      }
    }, 3500);

    // Simulasi Aktivitas Transaksi (Tiap 1.5 detik)
    const trxInterval = setInterval(() => {
      const hasNewTrx = Math.random() > 0.3;
      if (hasNewTrx) {
        setLiveTransactions(prev => {
          const user = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
          const trxInfo = TRX_TYPES[Math.floor(Math.random() * TRX_TYPES.length)];
          // Generate random amount within range, rounded to nearest 1000
          const rawAmount = Math.floor(Math.random() * (trxInfo.range[1] - trxInfo.range[0])) + trxInfo.range[0];
          const amount = Math.round(rawAmount / 1000) * 1000; 

          const newTrx = { time: getCurrentTime(), user, action: trxInfo.name, type: trxInfo.type, amount };
          return [newTrx, ...prev].slice(0, 6);
        });
      }
    }, 1500);

    // Simulasi Cashflow Pemasukan & Pengeluaran (Tiap 2 detik)
    const cashflowInterval = setInterval(() => {
      setLiveCashflow(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: getChartTime(),
          pemasukan: Math.floor(Math.random() * 6000000) + 500000,
          pengeluaran: Math.floor(Math.random() * 5000000) + 200000,
        });
        return newData;
      });
      setActiveUsers(prev => prev + (Math.floor(Math.random() * 11) - 5));
    }, 2000);

    // Simulasi Alert Error (Tiap 4 detik)
    const alertInterval = setInterval(() => {
      const hasNewError = Math.random() > 0.6; 
      if (hasNewError) {
        setLiveAlerts(prev => {
          const errIndex = Math.floor(Math.random() * ERROR_TYPES.length);
          const newAlert = { ...ERROR_TYPES[errIndex], time: getCurrentTime() };
          return [newAlert, ...prev].slice(0, 6);
        });
      }
    }, 4000);

    return () => {
      clearInterval(regInterval);
      clearInterval(trxInterval);
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
        return <span className="badge" style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', minWidth: 60, textAlign: 'center', fontSize: '10px', padding: '3px 6px' }}>Critical</span>;
      case 'danger': 
        return <span className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', minWidth: 60, textAlign: 'center', fontSize: '10px', padding: '3px 6px' }}>Danger</span>;
      case 'warning': 
        return <span className="badge badge-warning" style={{ minWidth: 60, textAlign: 'center', fontSize: '10px', padding: '3px 6px' }}>Warning</span>;
      default: 
        return null;
    }
  };

  const getTrxBadge = (type) => {
    return type === 'topup' 
      ? <span className="badge badge-success" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#059669', fontSize: '10px', padding: '3px 6px' }}>IN</span>
      : <span className="badge badge-danger" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#dc2626', fontSize: '10px', padding: '3px 6px' }}>OUT</span>;
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

        {/* ── 3. Live Logs: 3 Kolom Responsif ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Tabel Registrasi User Baru */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Registrasi User</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>User Info</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveRegisters.map((reg, i) => (
                    <tr key={i} style={{ borderBottom: i < liveRegisters.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '12px 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', width: '60px' }}>{reg.time}</td>
                      <td style={{ padding: '12px 0', fontSize: 12 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{reg.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{reg.phone}</span>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>{getRegBadge(reg.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Aktivitas Transaksi (Top Up & Pembayaran) */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.55s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Transaksi</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Aktivitas</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTransactions.map((trx, i) => (
                    <tr key={i} style={{ borderBottom: i < liveTransactions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '12px 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', width: '60px' }}>{trx.time}</td>
                      <td style={{ padding: '12px 0', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {getTrxBadge(trx.type)}
                          <span style={{ fontWeight: 600, color: '#334155', fontSize: 11 }}>{trx.user}</span>
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{trx.action}</span>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 12, fontWeight: 600, color: trx.type === 'topup' ? '#059669' : '#dc2626' }}>
                        {trx.type === 'topup' ? '+' : '-'}{formatRupiah(trx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Alert Error */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Alert System</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Pesan Error</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Tingkat</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAlerts.map((a, i) => (
                    <tr key={i} style={{ borderBottom: i < liveAlerts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                       <td style={{ padding: '12px 0', fontSize: 11, color: '#ef4444', fontFamily: 'monospace', width: '60px' }}>{a.time}</td>
                       <td style={{ padding: '12px 0', fontSize: 12, color: '#646464' }}>
                          <span style={{display: 'block', fontWeight: 600}}>{a.title}</span>
                          <span style={{fontSize: 10, color: 'var(--text-muted)'}}>{a.desc}</span>
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