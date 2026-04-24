import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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

const INITIAL_CASHFLOW = Array.from({ length: 15 }).map((_, i) => ({
  time: `10:${String(10 + i).padStart(2, '0')}`,
  pemasukan: Math.floor(Math.random() * 5000000) + 1000000,
  pengeluaran: Math.floor(Math.random() * 4000000) + 500000,
}));

const INITIAL_TRX_PER_JAM = [
  { jam: '07:00', topup: 124, payment: 89 },
  { jam: '08:00', topup: 210, payment: 178 },
  { jam: '09:00', topup: 340, payment: 290 },
  { jam: '10:00', topup: 480, payment: 412 },
  { jam: '11:00', topup: 390, payment: 355 },
  { jam: '12:00', topup: 520, payment: 480 },
  { jam: '13:00', topup: 310, payment: 270 },
  { jam: '14:00', topup: 445, payment: 398 },
];

const INITIAL_LOGINS = [
  { time: '10:24', ip: '114.12.55.1', user: 'admin_root', attempts: 8, status: 'blocked' },
  { time: '10:22', ip: '103.145.22.8', user: 'dina_f', attempts: 2, status: 'failed' },
  { time: '10:20', ip: '192.168.1.10', user: 'budi_s', attempts: 1, status: 'success' },
];

const INITIAL_FRAUD_USERS = [
  { user: 'anon_99', score: 92, flag: 'Multiple IPs in 5m', time: '10:25' },
  { user: 'test_bot', score: 88, flag: 'High Trx Frequency', time: '10:21' },
  { user: 'joko_w', score: 75, flag: 'Unusual Amount', time: '10:15' },
];

const INITIAL_PENDING_QUEUE = [
  { id: 'TX-921', user: 'Agus T.', amount: 150000, time: '10:26', gateway: 'BCA' },
  { id: 'TX-922', user: 'Nisa R.', amount: 50000, time: '10:25', gateway: 'QRIS' },
  { id: 'TX-923', user: 'Budi S.', amount: 350000, time: '10:20', gateway: 'Mandiri' },
];

/* ── Main Dashboard Component ───────────────────────────── */
export default function Aizar() {
  const [registerToday, setRegisterToday] = useState(1284);
  const [activeUsers, setActiveUsers] = useState(3420);

  const [totalTrxToday, setTotalTrxToday] = useState(8420);
  const [avgTrxPerUser, setAvgTrxPerUser] = useState(2.46);

  const [liveRegisters, setLiveRegisters] = useState([]);
  const [liveCashflow, setLiveCashflow] = useState(INITIAL_CASHFLOW);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);

  // System Health
  const [apiLatency, setApiLatency] = useState(45);
  const [successRate, setSuccessRate] = useState(99.2);

  // Analytics
  const [uptimeSeconds, setUptimeSeconds] = useState(14 * 86400 + 5 * 3600 + 32 * 60);
  const [loginAttempts, setLoginAttempts] = useState(INITIAL_LOGINS);
  const [fraudLog, setFraudLog] = useState(INITIAL_FRAUD_USERS);
  const [pendingQueue, setPendingQueue] = useState(INITIAL_PENDING_QUEUE);
  const [pendingVolume, setPendingVolume] = useState(12500000);

  const [trxPerJam, setTrxPerJam] = useState(INITIAL_TRX_PER_JAM);

  const getCurrentTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  const getChartTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatUptime = (totalSeconds) => {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  useEffect(() => {
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

    const metricsInterval = setInterval(() => {
      const newLatency = Math.floor(Math.random() * (120 - 30 + 1)) + 30;
      setApiLatency(newLatency);
      setUptimeSeconds(prev => prev + 60);

      setSuccessRate(prev => {
        const drop = Math.random() > 0.8 ? (Math.random() * 0.5) : -(Math.random() * 0.2);
        const newVal = prev - drop;
        return newVal > 100 ? 100 : newVal < 95 ? 96 : Number(newVal.toFixed(2));
      });

      setPendingVolume(prev => Math.max(5000000, prev + (Math.floor(Math.random() * 5000000) - 2500000)));

      const addedTrx = Math.floor(Math.random() * 30) + 10;
      setTotalTrxToday(prev => {
        const newTotal = prev + addedTrx;
        setAvgTrxPerUser(Number((newTotal / (registerToday + Math.floor(Math.random() * 5))).toFixed(2)));
        return newTotal;
      });
    }, 60000);

    const regInterval = setInterval(() => {
      const addedUsers = Math.floor(Math.random() * 10) + 5;
      setRegisterToday(prev => prev + addedUsers);
      setLiveRegisters(prev => {
        const name = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
        const phone = `+62 8${Math.floor(Math.random() * 90) + 10}-****-${Math.floor(Math.random() * 9000) + 1000}`;
        const newReg = { time: getCurrentTime(), name, phone, status: Math.random() > 0.3 ? 'verified' : 'pending' };
        return [newReg, ...prev].slice(0, 6);
      });
    }, 60000);

    const trxInterval = setInterval(() => {
      setLiveTransactions(prev => {
        const trxInfo = TRX_TYPES[Math.floor(Math.random() * TRX_TYPES.length)];
        const rawAmount = Math.floor(Math.random() * (trxInfo.range[1] - trxInfo.range[0])) + trxInfo.range[0];
        const amount = Math.round(rawAmount / 1000) * 1000;
        const newTrx = { time: getCurrentTime(), user: DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)], action: trxInfo.name, type: trxInfo.type, amount };
        return [newTrx, ...prev].slice(0, 6);
      });

      setLiveCashflow(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: getChartTime(),
          pemasukan: Math.floor(Math.random() * 8000000) + 2000000,
          pengeluaran: Math.floor(Math.random() * 7000000) + 1000000,
        });
        return newData;
      });

      setActiveUsers(prev => Math.max(1000, prev + (Math.floor(Math.random() * 41) - 20)));

      setTrxPerJam(prev => {
        const newData = [...prev];
        const lastIdx = newData.length - 1;
        newData[lastIdx] = {
          ...newData[lastIdx],
          topup: newData[lastIdx].topup + Math.floor(Math.random() * 20),
          payment: newData[lastIdx].payment + Math.floor(Math.random() * 18),
        };
        return newData;
      });
    }, 60000);

    const alertInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setLiveAlerts(prev => {
          const errIndex = Math.floor(Math.random() * ERROR_TYPES.length);
          return [{ ...ERROR_TYPES[errIndex], time: getCurrentTime() }, ...prev].slice(0, 6);
        });
      }

      if (Math.random() > 0.6) {
        setLoginAttempts(prev => {
          const isBlocked = Math.random() > 0.7;
          const newAttempt = {
            time: getCurrentTime(),
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            user: isBlocked ? 'admin' : DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)].replace(' ', '').toLowerCase(),
            attempts: isBlocked ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3) + 1,
            status: isBlocked ? 'blocked' : 'failed'
          };
          return [newAttempt, ...prev].slice(0, 6);
        });
      }

      if (Math.random() > 0.7) {
        setFraudLog(prev => {
          const flags = ['Proxy IP', 'Velocity Check Failed', 'Unusual Location'];
          const newFraud = {
            user: DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)].replace(' ', '_').toLowerCase(),
            score: Math.floor(Math.random() * 20) + 80,
            flag: flags[Math.floor(Math.random() * flags.length)],
            time: getCurrentTime()
          };
          return [newFraud, ...prev].slice(0, 6);
        });
      }

      setPendingQueue(prev => {
        const newQueue = [...prev];
        if (Math.random() > 0.5 && newQueue.length > 0) newQueue.pop();
        if (Math.random() > 0.4) {
          newQueue.unshift({
            id: `TX-${Math.floor(Math.random() * 900) + 100}`,
            user: DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)],
            amount: Math.floor(Math.random() * 500000) + 20000,
            time: getCurrentTime(),
            gateway: ['BCA', 'QRIS', 'Mandiri', 'OVO'][Math.floor(Math.random() * 4)]
          });
        }
        return newQueue.slice(0, 6);
      });
    }, 60000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(regInterval);
      clearInterval(trxInterval);
      clearInterval(alertInterval);
    };
  }, []);

  /* ── Helper Badges ── */
  const getRegBadge = (status) => status === 'verified'
    ? <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', minWidth: 70, textAlign: 'center', fontSize: 11 }}>Verified</span>
    : <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', minWidth: 70, textAlign: 'center', fontSize: 11 }}>Pending KYC</span>;

  const getAlertBadge = (type) => {
    const styles = {
      critical: { bg: '#7f1d1d', color: '#fca5a5' },
      danger: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
      warning: { bg: 'rgba(245,158,11,0.1)', color: '#d97706' }
    };
    const s = styles[type] || styles.warning;
    return <span className="badge" style={{ backgroundColor: s.bg, color: s.color, minWidth: 60, textAlign: 'center', fontSize: '10px', padding: '3px 6px' }}>{type.toUpperCase()}</span>;
  };

  const getTrxBadge = (type) => type === 'topup'
    ? <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '10px', padding: '2px 6px', borderRadius: 4 }}>IN</span>
    : <span style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontSize: '10px', padding: '2px 6px', borderRadius: 4 }}>OUT</span>;

  const getLoginBadge = (status) => {
    if (status === 'success') return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Success</span>;
    if (status === 'blocked') return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Blocked</span>;
    return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>Failed</span>;
  };

  const cardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' };

  const totalTrxChart = trxPerJam.reduce((acc, d) => acc + d.topup + d.payment, 0);

  return (
    <>
      <Topbar title="SmartPay Command Center" subtitle="Enterprise Wallet Operations: Bisnis, Infrastruktur, & Keamanan" />
      <div className="page-content section-gap" style={{ padding: '0 24px 40px' }}>

        {/* ── ROW 1: TOP BIZ STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 24, marginBottom: 20 }}>
          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': '#3b82f6', '--stat-bg': 'rgba(59,130,246,.12)' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Register Hari Ini</div>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{registerToday.toLocaleString()}</div>
              <div className="stat-change up" style={{ marginTop: 8 }}>+12% vs Kemarin</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': '#22c55e', '--stat-bg': 'rgba(34,197,94,.12)', animationDelay: '0.1s' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Active Users (Real-time)</div>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                {activeUsers.toLocaleString()} <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'pulse-ring 2s infinite' }} />
              </div>
              <div className="stat-change" style={{ color: '#64748b', marginTop: 8 }}>Koneksi socket terbuka</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': '#10b981', '--stat-bg': 'rgba(16,185,129,.12)', animationDelay: '0.2s' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Volume Pemasukan (In)</div>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                Rp {((liveCashflow[liveCashflow.length - 1]?.pemasukan || 0) / 1000000).toFixed(1)}M
              </div>
              <div className="stat-change up" style={{ marginTop: 8 }}>Per menit ini</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': '#ef4444', '--stat-bg': 'rgba(239,68,68,.12)', animationDelay: '0.3s' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Volume Pengeluaran (Out)</div>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                Rp {((liveCashflow[liveCashflow.length - 1]?.pengeluaran || 0) / 1000000).toFixed(1)}M
              </div>
              <div className="stat-change down" style={{ color: '#ef4444', marginTop: 8 }}>Per menit ini</div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: SYSTEM HEALTH & PENDING ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': apiLatency > 100 ? '#f59e0b' : '#3b82f6', '--stat-bg': apiLatency > 100 ? 'rgba(245,158,11,.12)' : 'rgba(59,130,246,.12)', animationDelay: '0.4s' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>API Latency & Uptime</div>
              <div className="stat-value" style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', marginTop: 4 }}>{apiLatency} ms</div>
              <div className="stat-change up" style={{ color: '#3b82f6', fontWeight: 600, marginTop: 8 }}>Up: {formatUptime(uptimeSeconds)}</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': '#6366f1', '--stat-bg': 'rgba(99,102,241,.12)', animationDelay: '0.6s' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Transaksi Hari Ini</div>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>
                {totalTrxToday.toLocaleString()}
              </div>
              <div className="stat-change up" style={{ color: '#6366f1', fontWeight: 600, marginTop: 8 }}>
                Avg {avgTrxPerUser}x / user
              </div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ ...cardStyle, '--stat-color': '#f59e0b', '--stat-bg': 'rgba(245,158,11,.12)', animationDelay: '0.7s' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Pending Volume</div>
              <div className="stat-value" style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>Rp {(pendingVolume / 1000000).toFixed(1)}M</div>
              <div className="stat-change" style={{ color: '#d97706', marginTop: 8 }}>{pendingQueue.length} Transaksi tertahan</div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: CHARTS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>

          {/* Chart 1: Live Cashflow */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '0.8s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div className="card-title" style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Live Cashflow (IDR)</div>
                <div className="card-subtitle" style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Pemasukan vs Pengeluaran</div>
              </div>
            </div>
            <div style={{ height: 280, width: '100%', marginTop: 10 }}>
              <ResponsiveContainer>
                <AreaChart data={liveCashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                  <Area type="monotone" dataKey="pemasukan" name="In" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                  <Area type="monotone" dataKey="pengeluaran" name="Out" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Transaksi per Jam */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '0.9s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div className="card-title" style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Volume Transaksi per Jam</div>
                <div className="card-subtitle" style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Top Up vs Pembayaran — Total: {totalTrxChart.toLocaleString()} trx
                </div>
              </div>
            </div>
            <div style={{ height: 280, width: '100%', marginTop: 10 }}>
              <ResponsiveContainer>
                <BarChart data={trxPerJam} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="jam" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value, name) => [value.toLocaleString(), name === 'topup' ? 'Top Up' : 'Pembayaran']}
                  />
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 11, fontWeight: 500 }}
                    formatter={(value) => value === 'topup' ? 'Top Up' : 'Pembayaran'}
                  />
                  <Bar dataKey="topup" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={400} />
                  <Bar dataKey="payment" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={400} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ── ROW 4: LOG TABLES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

          {/* Table 1: Registrasi User */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '1.1s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div className="card-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Registrasi User</div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>User Info</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveRegisters.map((reg, i) => (
                    <tr key={i} style={{ borderBottom: i < liveRegisters.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: 11, color: '#64748b', fontFamily: 'monospace', width: '50px' }}>{reg.time}</td>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{reg.name}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{reg.phone}</span>
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>{getRegBadge(reg.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Live Transaksi */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '1.2s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div className="card-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Live Transaksi</div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Aktivitas</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTransactions.map((trx, i) => (
                    <tr key={i} style={{ borderBottom: i < liveTransactions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: 11, color: '#64748b', fontFamily: 'monospace', width: '50px' }}>{trx.time}</td>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {getTrxBadge(trx.type)}
                          <span style={{ fontWeight: 600, color: '#334155', fontSize: 11 }}>{trx.user}</span>
                        </div>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{trx.action}</span>
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontSize: 12, fontWeight: 600, color: trx.type === 'topup' ? '#059669' : '#dc2626' }}>
                        {trx.type === 'topup' ? '+' : '-'}{formatRupiah(trx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: Pending Queue */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '1.3s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div className="card-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Antrean Pending</div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Info Trx</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Gateway</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQueue.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Tidak ada antrean pending</td></tr>
                  ) : pendingQueue.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < pendingQueue.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{item.user}</span>
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{item.id} • {item.time}</span>
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 11, color: '#475569', fontWeight: 500 }}>{item.gateway}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#d97706' }}>
                        {formatRupiah(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4: Alert System */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '1.4s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div className="card-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Live Alert System</div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Pesan Error</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Tingkat</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAlerts.map((a, i) => (
                    <tr key={i} style={{ borderBottom: i < liveAlerts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: 11, color: '#ef4444', fontFamily: 'monospace', width: '50px' }}>{a.time}</td>
                      <td style={{ padding: '10px 0', fontSize: 12, color: '#646464' }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{a.title}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{a.desc}</span>
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>{getAlertBadge(a.type)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 5: Login Attempts */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '1.5s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div className="card-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Login Attempts</div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block', animation: 'pulse-ring 1.5s infinite' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Info & IP</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'center' }}>Hit</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginAttempts.map((log, i) => (
                    <tr key={i} style={{ borderBottom: i < loginAttempts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{log.user}</span>
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{log.time} • {log.ip}</span>
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 700, textAlign: 'center', color: log.attempts > 3 ? '#ef4444' : '#64748b' }}>
                        {log.attempts}x
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>{getLoginBadge(log.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 6: Fraud Score Board */}
          <div className="card animate-fade-up" style={{ ...cardStyle, animationDelay: '1.6s' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div className="card-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Fraud Score Board</div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block', animation: 'blink 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>User / Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Anomaly Flag</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {fraudLog.map((log, i) => (
                    <tr key={i} style={{ borderBottom: i < fraudLog.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>{log.user}</span>
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{log.time}</span>
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 11, color: '#b45309', fontWeight: 500 }}>{log.flag}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace', color: log.score > 85 ? '#dc2626' : '#d97706' }}>
                          {log.score}
                        </span>
                      </td>
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