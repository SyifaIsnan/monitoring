import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, PieChart, Pie, Cell, Sector
} from 'recharts';

/* ── Data ────────────────────────────────────────────────── */
const TX_LIMIT_TOTAL = 10000;
const TX_LIMIT_USED = 6842;

const PAYMENT_HOURLY = [
  { jam: '07', berhasil: 42, gagal: 3 }, { jam: '08', berhasil: 88, gagal: 7 },
  { jam: '09', berhasil: 132, gagal: 12 }, { jam: '10', berhasil: 174, gagal: 8 },
  { jam: '11', berhasil: 156, gagal: 11 }, { jam: '12', berhasil: 210, gagal: 15 },
  { jam: '13', berhasil: 190, gagal: 9 }, { jam: '14', berhasil: 148, gagal: 6 },
  { jam: '15', berhasil: 172, gagal: 14 }, { jam: '16', berhasil: 128, gagal: 5 },
  { jam: '17', berhasil: 88, gagal: 4 }, { jam: '18', berhasil: 56, gagal: 2 },
];

const LOGIN_HOURLY = [
  { jam: '07', berhasil: 68, gagal: 4 }, { jam: '08', berhasil: 145, gagal: 11 },
  { jam: '09', berhasil: 210, gagal: 18 }, { jam: '10', berhasil: 188, gagal: 9 },
  { jam: '11', berhasil: 162, gagal: 7 }, { jam: '12', berhasil: 134, gagal: 5 },
  { jam: '13', berhasil: 120, gagal: 8 }, { jam: '14', berhasil: 156, gagal: 6 },
  { jam: '15', berhasil: 142, gagal: 12 }, { jam: '16', berhasil: 98, gagal: 4 },
  { jam: '17', berhasil: 72, gagal: 3 }, { jam: '18', berhasil: 44, gagal: 2 },
];

const TX_PIE = [
  { name: 'Berhasil', value: 5840, color: '#22c55e' },
  { name: 'Pending', value: 682, color: '#f59e0b' },
  { name: 'Gagal', value: 320, color: '#ef4444' },
];

const LOGIN_WEEK = [
  { hari: 'Sen', login: 820 }, { hari: 'Sel', login: 940 },
  { hari: 'Rab', login: 880 }, { hari: 'Kam', login: 1100 },
  { hari: 'Jum', login: 1240 }, { hari: 'Sab', login: 680 },
  { hari: 'Min', login: 520 },
];

const ALERTS = [
  { type: 'danger', title: 'Login Gagal Berulang', desc: '12x gagal login — IP 203.78.14.11 (14:32)', time: '4 mnt lalu' },
  { type: 'danger', title: 'Pembayaran Gagal', desc: 'TRX#9912 — Bank BNI timeout', time: '7 mnt lalu' },
  { type: 'warning', title: 'QR Code Gagal Scan', desc: 'Gate 2 — Barcode rusak, device ID QR-04', time: '15 mnt lalu' },
  { type: 'danger', title: 'NFC Mati', desc: 'Perangkat NFC-07 tidak responsif sejak 13:20', time: '28 mnt lalu' },
  { type: 'warning', title: 'Login Gagal', desc: 'Akun user@smartcenter.id — 5x percobaan', time: '33 mnt lalu' },
  { type: 'danger', title: 'Pembayaran Gagal', desc: 'TRX#9887 — Saldo tidak cukup (QRIS)', time: '41 mnt lalu' },
];

/* ── Pie Active Shape ────────────────────────────────────── */
const renderActive = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={800} fontFamily="JetBrains Mono">{value.toLocaleString()}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize={12}>{payload.name}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill={fill} fontSize={12} fontWeight={700}>{(percent * 100).toFixed(1)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

/* ── Alert Icon ──────────────────────────────────────────── */
function AlertIcon({ type }) {
  if (type === 'danger') return <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  return <svg width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

export default function Aizar() {
  const [activePie, setActivePie] = useState(0);
  const pct = Math.round((TX_LIMIT_USED / TX_LIMIT_TOTAL) * 100);
  const remaining = TX_LIMIT_TOTAL - TX_LIMIT_USED;

  return (
    <>
      <Topbar title="Aizar — Transaksi & User" subtitle="Monitoring limit transaksi, login, dan distribusi pembayaran" />
      <div className="page-content section-gap">

        {/* ── Row 1: Limit + Stats ──────────────────────────── */}
        <div className="grid-4">
          {/* Limit Card spans 1 col */}
          <div className="limit-card animate-fade-up" style={{ '--stat-color': '#4072af' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Limit Transaksi Harian</div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'white', lineHeight: 1 }}>{TX_LIMIT_USED.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>dari {TX_LIMIT_TOTAL.toLocaleString()} limit</div>
            <div style={{ margin: '14px 0 6px', height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#22c55e', borderRadius: 10, transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
              <span>{pct}% terpakai</span>
              <span style={{ color: remaining < 2000 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>Sisa: {remaining.toLocaleString()}</span>
            </div>
          </div>

          {[
            { label: 'User Login Hari Ini', value: '1,842', icon: '👥', color: '#4072af', bg: 'var(--accent-light)', change: '+14%', up: true },
            { label: 'User Daftar Hari Ini', value: '237', icon: '✨', color: '#22c55e', bg: 'rgba(34,197,94,.1)', change: '+22%', up: true },
            { label: 'Pembayaran Berhasil', value: '3,210', icon: '✅', color: '#f59e0b', bg: 'rgba(245,158,11,.1)', change: '+6%', up: true },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-fade-up" style={{ '--stat-color': s.color, '--stat-bg': s.bg, animationDelay: `${(i + 1) * 0.08}s` }}>
              <div className="stat-icon-wrap" style={{ fontSize: 20 }}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change} vs kemarin</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Payment Chart + Login Chart ───────────── */}
        <div className="grid-2">
          <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Pembayaran Berhasil vs Gagal</div>
                <div className="card-subtitle">Per jam hari ini</div>
              </div>
              <span className="badge badge-info">Per Jam</span>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PAYMENT_HOURLY} barSize={14} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" vertical={false} />
                  <XAxis dataKey="jam" tick={{ fontSize: 11, fill: '#6b8aaa' }} tickFormatter={v => `${v}:00`} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b8aaa' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} labelFormatter={v => `Jam ${v}:00`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="berhasil" name="Berhasil" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gagal" name="Gagal" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.26s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Login Berhasil vs Gagal</div>
                <div className="card-subtitle">Per jam hari ini</div>
              </div>
              <span className="badge badge-info">Per Jam</span>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LOGIN_HOURLY} barSize={14} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" vertical={false} />
                  <XAxis dataKey="jam" tick={{ fontSize: 11, fill: '#6b8aaa' }} tickFormatter={v => `${v}:00`} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b8aaa' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} labelFormatter={v => `Jam ${v}:00`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="berhasil" name="Berhasil" fill="#4072af" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gagal" name="Gagal" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 3: Pie + Line + Alerts ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr', gap: 16 }}>

          {/* Pie */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.32s' }}>
            <div className="card-header">
              <div className="card-title">Distribusi Transaksi</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={200} height={200}>
                <Pie
                  activeIndex={activePie}
                  activeShape={renderActive}
                  data={TX_PIE}
                  cx={100} cy={100}
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={(_, i) => setActivePie(i)}
                >
                  {TX_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {TX_PIE.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>{e.name}</span>
                  <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{e.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>



          {/* Weekly Login Chart */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.38s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Grafik Login User — 7 Hari Terakhir</div>
                <div className="card-subtitle">Tren jumlah login harian</div>
              </div>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={LOGIN_WEEK} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4072af" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4072af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />
                  <XAxis dataKey="hari" tick={{ fontSize: 12, fill: '#6b8aaa' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b8aaa' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} />
                  <Line type="monotone" dataKey="login" name="Login" stroke="#4072af" strokeWidth={2.5} dot={{ r: 5, fill: '#4072af', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>


            {/* Summary row */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
              {[
                { label: 'Total 7 Hari', val: LOGIN_WEEK.reduce((a, b) => a + b.login, 0).toLocaleString() },
                { label: 'Rata-rata/Hari', val: Math.round(LOGIN_WEEK.reduce((a, b) => a + b.login, 0) / 7).toLocaleString() },
                { label: 'Tertinggi', val: Math.max(...LOGIN_WEEK.map(d => d.login)).toLocaleString() },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--foreground)' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.44s' }}>
            <div className="card-header">
              <div className="card-title">Alerts Aktif</div>
              <span className="badge badge-danger"><span className="badge-dot" /> {ALERTS.length} aktif</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 320, overflowY: 'auto' }}>
              {ALERTS.map((a, i) => (
                <div key={i} className={`alert-item ${a.type}`}>
                  <span className="alert-icon"><AlertIcon type={a.type} /></span>
                  <div className="alert-text">
                    <strong>{a.title}</strong>
                    <span>{a.desc}</span>
                  </div>
                  <span className="alert-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}