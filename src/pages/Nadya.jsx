import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/* ── Data ───────────────────────────────────────────────── */
const VISITOR_WEEK = [
  { hari: 'Sen', pengunjung: 1420 }, { hari: 'Sel', pengunjung: 1780 },
  { hari: 'Rab', pengunjung: 1640 }, { hari: 'Kam', pengunjung: 2100 },
  { hari: 'Jum', pengunjung: 2450 }, { hari: 'Sab', pengunjung: 3120 },
  { hari: 'Min', pengunjung: 2870 },
];

const CCTV_LIST = [
  { id: 'CAM-01', name: 'Pintu Masuk Utama', status: 'aktif', viewers: 3 },
  { id: 'CAM-02', name: 'Area Tiket', status: 'aktif', viewers: 1 },
  { id: 'CAM-03', name: 'Zona Wisata A', status: 'aktif', viewers: 2 },
  { id: 'CAM-04', name: 'Parkiran Timur', status: 'mati', viewers: 0 },
  { id: 'CAM-05', name: 'Lobby Informasi', status: 'aktif', viewers: 1 },
  { id: 'CAM-06', name: 'Zona Kuliner', status: 'aktif', viewers: 0 },
];

const TRENDING_SEARCH = [
  { rank: 1, topic: 'Wisata Pantai Anyer', count: 1240 },
  { rank: 2, topic: 'Tiket Masuk Taman Safari', count: 980 },
  { rank: 3, topic: 'Jadwal Event Weekend', count: 754 },
  { rank: 4, topic: 'Promo Liburan Lebaran', count: 621 },
  { rank: 5, topic: 'Wisata Keluarga Bogor', count: 489 },
];

const TRENDING_NEWS_SEARCH = [
  { rank: 1, topic: 'Festival Budaya Nasional 2025', count: 832 },
  { rank: 2, topic: 'Pembukaan Wahana Baru', count: 614 },
  { rank: 3, topic: 'Diskon Tiket Pelajar', count: 502 },
  { rank: 4, topic: 'Kolaborasi Seniman Lokal', count: 388 },
];

const TRENDING_NEWS_CLICK = [
  { rank: 1, topic: 'Wisata Gratis HUT RI', count: 2140 },
  { rank: 2, topic: 'Review Tempat Wisata Baru', count: 1688 },
  { rank: 3, topic: 'Tips Liburan Hemat 2025', count: 1320 },
  { rank: 4, topic: '10 Destinasi Terbaik Jabar', count: 998 },
  { rank: 5, topic: 'Parade Seni Akhir Tahun', count: 740 },
];

const TICKET_DATA = [
  { wisata: 'Pantai Anyer', tiket: 320, color: '#4072af' },
  { wisata: 'Taman Safari', tiket: 280, color: '#22c55e' },
  { wisata: 'Candi Borobudur', tiket: 240, color: '#f59e0b' },
  { wisata: 'Kebun Raya', tiket: 190, color: '#3b82f6' },
  { wisata: 'Bromo Tour', tiket: 160, color: '#8b5cf6' },
  { wisata: 'Komodo Island', tiket: 130, color: '#ec4899' },
];

const TICKET_WEEKLY = [
  { hari: 'Sen', Anyer: 42, Safari: 38, Borobudur: 32, Kebun: 28 },
  { hari: 'Sel', Anyer: 55, Safari: 44, Borobudur: 36, Kebun: 22 },
  { hari: 'Rab', Anyer: 48, Safari: 41, Borobudur: 29, Kebun: 31 },
  { hari: 'Kam', Anyer: 62, Safari: 52, Borobudur: 44, Kebun: 38 },
  { hari: 'Jum', Anyer: 78, Safari: 60, Borobudur: 52, Kebun: 44 },
  { hari: 'Sab', Anyer: 94, Safari: 72, Borobudur: 64, Kebun: 56 },
  { hari: 'Min', Anyer: 88, Safari: 68, Borobudur: 58, Kebun: 48 },
];

const ALERTS_NADYA = [
  { type: 'danger', title: 'Transaksi Gagal', desc: 'Pembelian tiket Bromo #T4421 — Payment timeout', time: '6 mnt lalu' },
  { type: 'danger', title: 'CCTV Mati', desc: 'CAM-04 Parkiran Timur offline sejak 12:45', time: '18 mnt lalu' },
  { type: 'warning', title: 'Transaksi Gagal', desc: 'Tiket Anyer #T4398 — Limit kartu terlampaui', time: '25 mnt lalu' },
  { type: 'danger', title: 'Transaksi Gagal', desc: 'Tiket Safari #T4312 — Network error pada gateway', time: '38 mnt lalu' },
  { type: 'warning', title: 'Pengunjung Melebihi Kapasitas', desc: 'Zona Wisata A — 105% dari kapasitas normal', time: '52 mnt lalu' },
];

/* ── CCTV Cam Component ─────────────────────────────────── */
function CctvCam({ cam }) {
  const isActive = cam.status === 'aktif';
  return (
    <div className="cctv-card">
      <div className="cctv-screen">
        {isActive ? (
          <>
            {/* Simulated camera view */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5">
              <path d="M23 7 16 12 23 17V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono', letterSpacing: 1 }}>STREAMING</div>
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5">
              <line x1="2" y1="2" x2="22" y2="22"/><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L23 7v10"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10z"/>
            </svg>
            <div style={{ fontSize: 10, color: 'rgba(239,68,68,0.7)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>OFFLINE</div>
          </>
        )}
      </div>
      <div className="cctv-overlay" />
      <div className="cctv-label">{cam.id} — {cam.name}</div>
      <div className="cctv-status">
        {isActive ? (
          <div className="cctv-rec"><span className="cctv-rec-dot" />REC</div>
        ) : (
          <span className="badge badge-danger" style={{ fontSize: 9, padding: '2px 6px' }}>MATI</span>
        )}
      </div>
      {isActive && cam.viewers > 0 && (
        <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {cam.viewers}
        </div>
      )}
    </div>
  );
}

function AlertIcon({ type }) {
  if (type === 'danger')
    return <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  return <svg width="14" height="14" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

export default function Nadya() {
  const totalVisitorToday = 2870;
  const cctvAktif = CCTV_LIST.filter(c => c.status === 'aktif').length;
  const totalViewers = CCTV_LIST.reduce((a, c) => a + c.viewers, 0);
  const totalTicket = TICKET_DATA.reduce((a, b) => a + b.tiket, 0);

  return (
    <>
      <Topbar title="Nadya — Pengunjung & Tiket" subtitle="Monitoring pengunjung, CCTV, trending, dan penjualan tiket" />
      <div className="page-content section-gap">

        {/* ── Row 1: Top Stats ──────────────────────────────── */}
        <div className="grid-4">
          {[
            { label: 'Pengunjung Hari Ini', value: totalVisitorToday.toLocaleString(), change: '+18%', up: true, color: '#4072af', bg: 'var(--accent-light)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { label: 'CCTV Aktif', value: `${cctvAktif}/${CCTV_LIST.length}`, change: '1 offline', up: false, color: cctvAktif < CCTV_LIST.length ? '#ef4444' : '#22c55e', bg: cctvAktif < CCTV_LIST.length ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7 16 12 23 17V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
            { label: 'Akses CCTV Sekarang', value: totalViewers, change: 'user online', up: true, color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
            { label: 'Total Tiket Terjual', value: totalTicket.toLocaleString(), change: '+9%', up: true, color: '#22c55e', bg: 'rgba(34,197,94,.1)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-fade-up" style={{ '--stat-color': s.color, '--stat-bg': s.bg, animationDelay: `${i * 0.08}s` }}>
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Visitor Chart + CCTV ───────────────────── */}
        <div className="grid-2-1">
          <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Grafik Pengunjung — 7 Hari Terakhir</div>
                <div className="card-subtitle">Tren kunjungan harian</div>
              </div>
              <span className="badge badge-neutral">Minggu Ini</span>
            </div>
            <div style={{ height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VISITOR_WEEK} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4072af" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4072af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />
                  <XAxis dataKey="hari" tick={{ fontSize: 12, fill: '#6b8aaa' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b8aaa' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} />
                  <Area type="monotone" dataKey="pengunjung" name="Pengunjung" stroke="#4072af" fill="url(#visitGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#4072af', strokeWidth: 2, stroke: 'white' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CCTV Monitor */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.28s' }}>
            <div className="card-header">
              <div className="card-title">Monitor CCTV</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-success"><span className="badge-dot" />{cctvAktif} aktif</span>
                {CCTV_LIST.some(c => c.status === 'mati') && <span className="badge badge-danger"><span className="badge-dot" />1 mati</span>}
              </div>
            </div>
            <div className="cctv-grid">
              {CCTV_LIST.map((cam) => <CctvCam key={cam.id} cam={cam} />)}
            </div>
          </div>
        </div>

        {/* ── Row 3: Trending ───────────────────────────────── */}
        <div className="grid-3">
          {/* Trending by Search */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <div className="card-title">Trending Topik (Pencarian)</div>
              <span className="badge badge-info">Search</span>
            </div>
            {TRENDING_SEARCH.map((t) => (
              <div key={t.rank} className="trending-item">
                <div className={`trending-rank ${t.rank <= 3 ? 'top' : ''}`}>{t.rank}</div>
                <div className="trending-text">{t.topic}</div>
                <div className="trending-count">{t.count.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Trending News by Search */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="card-header">
              <div className="card-title">Trending Berita (Search)</div>
              <span className="badge badge-neutral">By Search</span>
            </div>
            {TRENDING_NEWS_SEARCH.map((t) => (
              <div key={t.rank} className="trending-item">
                <div className={`trending-rank ${t.rank <= 3 ? 'top' : ''}`}>{t.rank}</div>
                <div className="trending-text">{t.topic}</div>
                <div className="trending-count">{t.count.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Trending News by Click */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.42s' }}>
            <div className="card-header">
              <div className="card-title">Trending Berita (Klik)</div>
              <span className="badge badge-warning">By Click</span>
            </div>
            {TRENDING_NEWS_CLICK.map((t) => (
              <div key={t.rank} className="trending-item">
                <div className={`trending-rank ${t.rank <= 3 ? 'top' : ''}`}>{t.rank}</div>
                <div className="trending-text">{t.topic}</div>
                <div className="trending-count">{t.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 4: Ticket Stats + Chart + Alerts ─────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr', gap: 16 }}>

          {/* Ticket summary */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.44s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Pembelian Tiket</div>
                <div className="card-subtitle">Per destinasi wisata</div>
              </div>
            </div>
            {TICKET_DATA.map((t, i) => (
              <div key={i} className="progress-wrap">
                <div className="progress-header">
                  <span className="progress-label" style={{ fontSize: 12 }}>{t.wisata}</span>
                  <span className="progress-value" style={{ color: t.color, fontSize: 12 }}>{t.tiket}</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${(t.tiket / 320) * 100}%`, background: t.color }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total terjual</span>
              <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}>{totalTicket.toLocaleString()}</span>
            </div>
          </div>

          {/* Ticket Weekly Chart */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Grafik Tiket Per Wisata — 7 Hari</div>
                <div className="card-subtitle">Top 4 destinasi populer</div>
              </div>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TICKET_WEEKLY} barSize={10} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" vertical={false} />
                  <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#6b8aaa' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b8aaa' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Anyer" name="Pantai Anyer" fill="#4072af" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Safari" name="Taman Safari" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Borobudur" name="Borobudur" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Kebun" name="Kebun Raya" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.56s' }}>
            <div className="card-header">
              <div className="card-title">Alerts Aktif</div>
              <span className="badge badge-danger"><span className="badge-dot" />{ALERTS_NADYA.length}</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {ALERTS_NADYA.map((a, i) => (
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