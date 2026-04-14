import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TRAFFIC = [
  { time: '00:00', req: 120, err: 4 }, { time: '03:00', req: 80, err: 2 },
  { time: '06:00', req: 210, err: 7 }, { time: '09:00', req: 540, err: 12 },
  { time: '12:00', req: 720, err: 18 }, { time: '15:00', req: 680, err: 9 },
  { time: '18:00', req: 590, err: 14 }, { time: '21:00', req: 310, err: 5 },
];

const MODULES = [
  { name: 'API Gateway', status: 'online', uptime: '99.98%', resp: '42ms', req: '12.4k' },
  { name: 'Auth Service', status: 'online', uptime: '99.95%', resp: '28ms', req: '8.1k' },
  { name: 'Payment Service', status: 'warning', uptime: '99.12%', resp: '154ms', req: '3.2k' },
  { name: 'Notification Svc', status: 'online', uptime: '99.99%', resp: '18ms', req: '5.7k' },
  { name: 'CCTV Stream', status: 'online', uptime: '98.80%', resp: '—', req: '—' },
  { name: 'Database Master', status: 'online', uptime: '99.99%', resp: '6ms', req: '41k' },
];

const ACTIVITY = [
  { type: 'success', msg: 'Pembayaran berhasil — TRX#8821', time: '2 menit lalu' },
  { type: 'danger', msg: 'Login gagal 3x — IP 192.168.1.45', time: '4 menit lalu' },
  { type: 'warning', msg: 'Payment Service latensi tinggi', time: '11 menit lalu' },
  { type: 'info', msg: 'User baru terdaftar — aizarahm@gmail', time: '15 menit lalu' },
  { type: 'success', msg: 'Tiket wisata #T-192 dicetak', time: '22 menit lalu' },
  { type: 'danger', msg: 'QR Code gagal scan — Gate 3', time: '29 menit lalu' },
  { type: 'info', msg: 'Backup database selesai', time: '45 menit lalu' },
];

const STAT_CARDS = [
  { label: 'Total Request / Jam', value: '12,480', change: '+8.4%', up: true, color: '#4072af', bg: '#dae2ef', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { label: 'User Aktif Hari Ini', value: '1,246', change: '+12.1%', up: true, color: '#22c55e', bg: 'rgba(34,197,94,.12)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Transaksi Berhasil', value: '3,840', change: '+5.2%', up: true, color: '#f59e0b', bg: 'rgba(245,158,11,.12)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg> },
  { label: 'Error Rate', value: '0.71%', change: '-0.3%', up: false, color: '#ef4444', bg: 'rgba(239,68,68,.12)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
];

function StatusDot({ status }) {
  const c = status === 'online' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', animation: status === 'online' ? 'pulse-ring 2s infinite' : 'blink 1.5s infinite' }} />;
}

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(p => p + 1), 5000); return () => clearInterval(t); }, []);

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview sistem Smart Center secara keseluruhan" />
      <div className="page-content section-gap">

        {/* Stat Cards */}
        <div className="grid-4">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="stat-card animate-fade-up" style={{ '--stat-color': s.color, '--stat-bg': s.bg, animationDelay: `${i * 0.08}s` }}>
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change} dari kemarin</div>
              </div>
            </div>
          ))}
        </div>

        {/* Traffic + Services */}
        <div className="grid-2-1">
          <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Traffic Request Hari Ini</div>
                <div className="card-subtitle">Request masuk vs error per interval</div>
              </div>
              <span className="badge badge-neutral">24 jam</span>
            </div>
            <div className="chart-wrap" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAFFIC} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4072af" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4072af" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b8aaa' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b8aaa' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="req" name="Request" stroke="#4072af" fill="url(#reqGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="err" name="Error" stroke="#ef4444" fill="url(#errGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Services */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.28s' }}>
            <div className="card-header">
              <div className="card-title">Status Services</div>
            </div>
            {MODULES.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < MODULES.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                <StatusDot status={m.status} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                <span className={`badge badge-${m.status === 'online' ? 'success' : 'warning'}`}>{m.uptime}</span>
                {m.resp !== '—' && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{m.resp}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* System Overview + Activity */}
        <div className="grid-2">
          {/* System Health */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.32s' }}>
            <div className="card-header">
              <div className="card-title">System Health</div>
              <span className="badge badge-success"><span className="badge-dot" /> Normal</span>
            </div>
            {[
              { label: 'CPU Usage', val: 42, color: '#4072af' },
              { label: 'RAM Usage', val: 67, color: '#f59e0b' },
              { label: 'Disk Usage', val: 55, color: '#22c55e' },
              { label: 'Network I/O', val: 30, color: '#3b82f6' },
            ].map((r, i) => (
              <div key={i} className="progress-wrap">
                <div className="progress-header">
                  <span className="progress-label">{r.label}</span>
                  <span className="progress-value" style={{ color: r.val > 80 ? '#ef4444' : r.val > 60 ? '#f59e0b' : r.color }}>{r.val}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${r.val}%`, background: r.val > 80 ? '#ef4444' : r.val > 60 ? '#f59e0b' : r.color }} />
                </div>
              </div>
            ))}
          </div>

        <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
        
        {/* Header tetap */}
        <div className="card-header">
          <div className="card-title">Activity Feed</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time</span>
        </div>

        {/* Hanya alert list yang scroll */}
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} className={`alert-item ${a.type}`}>
              <span className="alert-icon">
                {a.type === 'success' && (
                  <svg width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}

                {a.type === 'danger' && (
                  <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                )}

                {a.type === 'warning' && (
                  <svg width="14" height="14" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                )}

                {a.type === 'info' && (
                  <svg width="14" height="14" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
              </span>

              <div className="alert-text">
                <strong style={{ fontSize: 12 }}>{a.msg}</strong>
                <span>{a.time}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
          
          </div>

        {/* Summary Bar Chart */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Ringkasan Harian — 7 Hari Terakhir</div>
              <div className="card-subtitle">Transaksi, user aktif, dan error per hari</div>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: 'Sen', tx: 820, users: 540, err: 12 },
                { day: 'Sel', tx: 932, users: 620, err: 8 },
                { day: 'Rab', tx: 901, users: 580, err: 15 },
                { day: 'Kam', tx: 1100, users: 710, err: 9 },
                { day: 'Jum', tx: 1240, users: 830, err: 11 },
                { day: 'Sab', tx: 780, users: 420, err: 5 },
                { day: 'Min', tx: 690, users: 390, err: 3 },
              ]} barSize={20} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b8aaa' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b8aaa' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="tx" name="Transaksi" fill="#4072af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="users" name="User Aktif" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="err" name="Error" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}