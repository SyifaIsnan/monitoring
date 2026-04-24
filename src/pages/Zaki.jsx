import { useState, useEffect, useRef, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ── Helpers ─────────────────────────────────────────────── */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const fmtBytes = (b) => {
  if (!b) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};
const fmtPct = (v) => `${parseFloat(v || 0).toFixed(1)}%`;

/* ── Ring Gauge ──────────────────────────────────────────── */
function RingGauge({ pct, label, color, size = 160, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const st = pct > 85 ? 'danger' : pct > 65 ? 'warning' : 'ok';
  const sc = st === 'danger' ? '#ef4444' : st === 'warning' ? '#f59e0b' : color;

  return (
    <div className="server-ring-wrap">
      <div className="server-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent-light)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={sc} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div className="ring-center">
          <div className="ring-pct" style={{ color: sc }}>{pct.toFixed(0)}%</div>
          <div className="ring-unit">{label}</div>
        </div>
      </div>
      <span className={`badge badge-${st === 'danger' ? 'danger' : st === 'warning' ? 'warning' : 'success'}`}>
        <span className="badge-dot" />
        {st === 'danger' ? 'KRITIS' : st === 'warning' ? 'TINGGI' : 'NORMAL'}
      </span>
    </div>
  );
}

/* ── Sparkline ───────────────────────────────────────────── */
function Sparkline({ data, color }) {
  return (
    <div style={{ height: 60, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="val" stroke={color} fill={`url(#sg-${color.replace('#', '')})`} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Status Badge Helper ─────────────────────────────────── */
const StatusBadge = ({ pct }) => {
  if (pct > 85) return <span className="badge badge-danger"><span className="badge-dot" />Kritis</span>;
  if (pct > 65) return <span className="badge badge-warning"><span className="badge-dot" />Tinggi</span>;
  return <span className="badge badge-success"><span className="badge-dot" />Normal</span>;
};

/* ── Health Status Dot ───────────────────────────────────── */
const HealthDot = ({ status }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 600,
    color: status === 'ok' ? '#22c55e' : '#ef4444',
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: status === 'ok' ? '#22c55e' : '#ef4444',
      animation: 'blink 1.5s infinite',
      boxShadow: `0 0 6px ${status === 'ok' ? '#22c55e' : '#ef4444'}`,
    }} />
    {status === 'ok' ? 'ONLINE' : 'OFFLINE'}
  </span>
);

/* ── DATA DUMMY AWAL ─────────────────────────────────────── */
const DUMMY_SYSTEM_DATA = {
  system: {
    hostname: "svr-production-01",
    platform: "linux",
    arch: "x64",
    cpus: 16,
    uptime: { formatted: "14d 8h 22m" },
    loadAverage: { "1min": 1.25, "5min": 0.85 }
  },
  cpu: {
    model: "AMD EPYC 7571",
    cores: 16,
    speed: 2200,
    usage: { percentUsed: 42.5 }
  },
  memory: {
    percentUsed: 68.2,
    used: 23514087424,
    total: 34474921984,
    human: { used: "21.9 GB", total: "32.1 GB" }
  },
  disk: {
    percentUsed: 78.4,
    used: 392000000000,
    total: 500000000000,
    human: { used: "392 GB", total: "500 GB" }
  },
  docker: {
    running: 6,
    total: 8,
    containers: [
      { name: "nginx-proxy", image: "nginx:alpine", status: "Up 14 days", cpu: 2.4 },
      { name: "backend-api", image: "node:18", status: "Up 2 days", cpu: 45.1 },
      { name: "db-postgres", image: "postgres:15", status: "Up 14 days", cpu: 12.5 },
      { name: "redis-cache", image: "redis:6", status: "Up 14 days", cpu: 0.8 },
      { name: "worker-queue", image: "python:3.9", status: "Up 5 hours", cpu: 28.3 },
      { name: "grafana", image: "grafana/grafana", status: "Up 14 days", cpu: 1.2 },
    ]
  }
};

const DUMMY_PROCESSES = [
  { pid: 1452, name: "node", cmd: "node server.js", cpu: "45.1", memory: 524288000, status: "Running", user: "appuser" },
  { pid: 890, name: "postgres", cmd: "postgres -D /var/lib/...", cpu: "12.5", memory: 1048576000, status: "Running", user: "postgres" },
  { pid: 2311, name: "python", cmd: "python celery_worker.py", cpu: "28.3", memory: 256000000, status: "Running", user: "appuser" },
  { pid: 654, name: "nginx", cmd: "nginx -g daemon off;", cpu: "2.4", memory: 45000000, status: "Running", user: "root" },
  { pid: 722, name: "redis-server", cmd: "redis-server *:6379", cpu: "0.8", memory: 128000000, status: "Running", user: "redis" },
];

const DUMMY_LOGS = [
  "CRON: /usr/sbin/logrotate dijalankan",
  "Accepted connection from 103.145.22.8",
  "⚠ Peringatan: Penggunaan memory API Node mendekati limit",
  "Worker thread 4 berhasil memproses 120 antrean",
  "Docker container 'backend-api' melaporkan status sehat",
  "Auth Service: 5 percobaan login gagal dari IP 114.12.x.x"
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Zaki() {
  /* ── State menggunakan Dummy Data ──────────────────────── */
  const [sysData,   setSysData]   = useState(DUMMY_SYSTEM_DATA);
  const [health,    setHealth]    = useState({ status: 'ok', uptime: 1239720 });
  const [processes, setProcesses] = useState(DUMMY_PROCESSES);
  const [apiError,  setApiError]  = useState(false); // Dibuat false agar banner error hilang
  const [lastFetch, setLastFetch] = useState(new Date().toLocaleTimeString('id-ID'));

  /* ── Chart History ─────────────────────────────────────── */
  const mkHist = (n = 20) => Array.from({ length: n }, (_, i) => ({ t: `T-${n - i}`, val: Math.random() * 20 + 30 }));
  const [cpuHist, setCpuHist] = useState(mkHist());
  const [ramHist, setRamHist] = useState(mkHist());
  const [netHist, setNetHist] = useState(
    Array.from({ length: 20 }, (_, i) => ({ t: `T-${20 - i}`, in: Math.random() * 80 + 20, out: Math.random() * 50 + 10 }))
  );

  /* ── Live Log ──────────────────────────────────────────── */
  const [sysLogs, setSysLogs] = useState([
    { time: new Date().toLocaleTimeString('id-ID'), msg: 'Memulai Simulasi Dashboard (Mode Dummy)...' },
    { time: new Date().toLocaleTimeString('id-ID'), msg: 'Koneksi ke API dinonaktifkan.' },
  ]);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sysLogs]);

  const pushLog = useCallback((msg) => {
    setSysLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString('id-ID'), msg },
    ].slice(-20));
  }, []);

  /* ── Simulasi Update Data Dinamis (Pengganti Fetch API) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Acak angka CPU dan RAM
      const newCpu = clamp(parseFloat(sysData.cpu.usage.percentUsed) + (Math.random() * 16 - 8), 10, 95);
      const newRam = clamp(parseFloat(sysData.memory.percentUsed) + (Math.random() * 4 - 2), 40, 85);
      const usedBytes = (newRam / 100) * sysData.memory.total;

      // 2. Update System Data
      setSysData(prev => ({
        ...prev,
        cpu: { ...prev.cpu, usage: { percentUsed: newCpu } },
        memory: {
          ...prev.memory,
          percentUsed: newRam,
          used: usedBytes,
          human: { ...prev.memory.human, used: fmtBytes(usedBytes) }
        }
      }));

      // 3. Update Chart History
      setCpuHist(prev => [...prev.slice(1), { t: 'T-0', val: newCpu }]);
      setRamHist(prev => [...prev.slice(1), { t: 'T-0', val: newRam }]);
      setNetHist(prev => [...prev.slice(1), { t: 'T-0', in: Math.random() * 80 + 20, out: Math.random() * 50 + 10 }]);

      // 4. Update Proses (CPU nya fluktuatif)
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: clamp(parseFloat(p.cpu) + (Math.random() * 10 - 5), 0, 95).toFixed(1)
      })));

      setLastFetch(new Date().toLocaleTimeString('id-ID'));

      // 5. Acak memunculkan log
      if (Math.random() > 0.7) {
        const randomLog = DUMMY_LOGS[Math.floor(Math.random() * DUMMY_LOGS.length)];
        pushLog(randomLog);
      }
    }, 3000); // Diupdate setiap 3 detik agar terlihat interaktif

    return () => clearInterval(interval);
  }, [sysData.cpu.usage.percentUsed, sysData.memory.percentUsed, sysData.memory.total, pushLog]);


  /* ── Derived values ────────────────────────────────────── */
  const cpu  = parseFloat(sysData?.cpu?.usage?.percentUsed   || 0);
  const ram  = parseFloat(sysData?.memory?.percentUsed       || 0);
  const disk = parseFloat(sysData?.disk?.percentUsed         || 0);

  const cpuColor  = cpu  > 85 ? '#ef4444' : cpu  > 65 ? '#f59e0b' : '#4072af';
  const ramColor  = ram  > 85 ? '#ef4444' : ram  > 65 ? '#f59e0b' : '#22c55e';
  const diskColor = disk > 85 ? '#ef4444' : disk > 65 ? '#f59e0b' : '#f59e0b';

  const isCritical = cpu > 85 || ram > 85 || disk > 85;

  const uptime = sysData?.system?.uptime?.formatted ?? '—';
  const loadAvg = sysData?.system?.loadAverage;

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <Topbar title="Zaki — Server Monitoring" subtitle="Pantau kondisi CPU, RAM, Network, dan Container secara real-time" />
      <div className="page-content section-gap" style={{ maxWidth: '100%' }}>

        {/* ── 0. Banner API Error ──────────────────────── */}
        {apiError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>Koneksi API Gagal</span>
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>Tidak dapat terhubung ke server asli. Menampilkan data Dummy.</span>
          </div>
        )}

        {/* ── Banner Alert Critical ────────────────────── */}
        {isCritical && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>⚠ Peringatan Sistem</span>
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>Salah satu resource melebihi batas kritis. Segera periksa!</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            ROW 0: SYSTEM INFO + HEALTH CHECK 
        ════════════════════════════════════════════════ */}
        <div className="grid-2" style={{ marginBottom: 20, alignItems: 'stretch' }}>

          {/* System Info Card */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.02s' }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-title">System Information</div>
                <div className="card-subtitle">Info dasar server yang dimonitor</div>
              </div>
              <HealthDot status={health?.status === 'ok' ? 'ok' : 'error'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              {[
                { label: 'Hostname',  value: sysData?.system?.hostname  ?? '—' },
                { label: 'Platform',  value: sysData?.system?.platform  ?? '—' },
                { label: 'Arch',      value: sysData?.system?.arch      ?? '—' },
                { label: 'CPU Cores', value: sysData?.system?.cpus      ?? '—' },
                { label: 'Uptime',    value: uptime },
                { label: 'CPU Model', value: sysData?.cpu?.model        ?? '—' },
                { label: 'Load 1m',   value: loadAvg?.['1min']          ?? '—' },
                { label: 'Load 5m',   value: loadAvg?.['5min']          ?? '—' },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{r.value}</span>
                </div>
              ))}
            </div>
            {lastFetch && (
              <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Update terakhir: {lastFetch} (Dummy Mode)
              </div>
            )}
          </div>

          {/* Health Check Card */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.06s' }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-title">Health Check</div>
                <div className="card-subtitle">Status layanan dari simulasi internal</div>
              </div>
              <span className={`badge ${health?.status === 'ok' ? 'badge-success' : 'badge-danger'}`}>
                <span className="badge-dot" />
                {health?.status?.toUpperCase() ?? 'LOADING'}
              </span>
            </div>

            {/* Big status display */}
            <div style={{ textAlign: 'center', padding: '18px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                background: health?.status === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `2px solid ${health?.status === 'ok' ? '#22c55e' : '#ef4444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {health?.status === 'ok'
                  ? <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="36" height="36" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                }
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: health?.status === 'ok' ? '#22c55e' : '#ef4444' }}>
                {health?.status === 'ok' ? 'Server Online' : health ? 'Server Error' : 'Menghubungkan...'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {health?.uptime ? `Uptime: ${Math.floor(health.uptime / 3600)}j ${Math.floor((health.uptime % 3600) / 60)}m` : ''}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              {[
                { label: 'CPU Check',   ok: cpu  < 90, val: fmtPct(cpu)  },
                { label: 'RAM Check',   ok: ram  < 90, val: fmtPct(ram)  },
                { label: 'Disk Check',   ok: disk < 90, val: fmtPct(disk) },
                { label: 'Docker',       ok: (sysData?.docker?.running > 0), val: `${sysData?.docker?.running ?? 0}/${sysData?.docker?.total ?? 0}` },
              ].map((item, i) => (
                <div key={i} style={{ background: item.ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${item.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.ok ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            ROW 1: CPU / RAM / DISK Gauges
        ════════════════════════════════════════════════ */}
        <div className="grid-3">
          {/* CPU */}
          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">CPU Usage</div>
                <div className="card-subtitle">{sysData?.cpu?.model ?? 'Loading...'} — {sysData?.cpu?.cores ?? '—'} Core</div>
              </div>
              <StatusBadge pct={cpu} />
            </div>
            <RingGauge pct={cpu} label="CPU" color="#4072af" />
            <Sparkline data={cpuHist} color={cpuColor} />
            <div className="server-details">
              {[
                { label: 'Cores',        value: `${sysData?.cpu?.cores ?? '—'}` },
                { label: 'Clock Speed',  value: `${sysData?.cpu?.speed ?? '—'} MHz` },
                { label: 'Load 1m',      value: loadAvg?.['1min']  ?? '—' },
                { label: 'Load 5m',      value: loadAvg?.['5min']  ?? '—' },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RAM */}
          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.16s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">RAM Usage</div>
                <div className="card-subtitle">Total {sysData?.memory?.human?.total ?? '—'}</div>
              </div>
              <StatusBadge pct={ram} />
            </div>
            <RingGauge pct={ram} label="RAM" color="#22c55e" />
            <Sparkline data={ramHist} color={ramColor} />
            <div className="server-details">
              {[
                { label: 'Terpakai',  value: sysData?.memory?.human?.used  ?? '—' },
                { label: 'Total',     value: sysData?.memory?.human?.total  ?? '—' },
                { label: 'Used Bytes',value: fmtBytes(sysData?.memory?.used) },
                { label: 'Free Bytes',value: fmtBytes((sysData?.memory?.total ?? 0) - (sysData?.memory?.used ?? 0)) },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disk */}
          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.24s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">Disk Usage</div>
                <div className="card-subtitle">Total {sysData?.disk?.human?.total ?? '—'}</div>
              </div>
              <StatusBadge pct={disk} />
            </div>
            <RingGauge pct={disk} label="Disk" color="#f59e0b" />
            <Sparkline data={cpuHist.map(h => ({ ...h, val: disk }))} color={diskColor} />
            <div className="server-details">
              {[
                { label: 'Terpakai', value: sysData?.disk?.human?.used  ?? '—' },
                { label: 'Total',    value: sysData?.disk?.human?.total  ?? '—' },
                { label: 'Used',     value: fmtBytes(sysData?.disk?.used)  },
                { label: 'Free',     value: fmtBytes((sysData?.disk?.total ?? 0) - (sysData?.disk?.used ?? 0)) },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            ROW 2: Network + Docker
        ════════════════════════════════════════════════ */}
        <div className="grid-2" style={{ marginTop: 20 }}>
          {/* Network Chart */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Network I/O</div>
                <div className="card-subtitle">Bandwidth masuk & keluar (Mbps)</div>
              </div>
              <span className="badge badge-info">Real-time</span>
            </div>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netHist} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="netIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4072af" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4072af" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#6b8aaa' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b8aaa' }} unit=" M" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} formatter={v => `${v.toFixed(1)} Mbps`} />
                  <Area type="monotone" dataKey="in"  name="In"  stroke="#4072af" fill="url(#netIn)"  strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="out" name="Out" stroke="#22c55e" fill="url(#netOut)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Docker Containers */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Docker Containers Health</div>
                <div className="card-subtitle">Menampilkan container yang berjalan</div>
              </div>
              <span className="badge badge-success">
                <span className="badge-dot" /> {sysData?.docker?.running ?? 0} Running
              </span>
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 10, paddingRight: 4 }}>
              {(sysData?.docker?.containers ?? []).length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['CONTAINER', 'IMAGE', 'STATUS', 'CPU%'].map(h => (
                        <th key={h} style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', position: 'sticky', top: 0, background: 'var(--card-bg,#fff)', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sysData.docker.containers).map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 4px' }}>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>{c.name ?? c.Names?.[0]?.replace('/', '')}</div>
                        </td>
                        <td style={{ padding: '10px 4px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{c.image ?? c.Image}</td>
                        <td style={{ padding: '10px 4px' }}>
                          <span style={{ fontSize: 11, color: (c.status ?? c.Status ?? '').toLowerCase().includes('up') ? '#22c55e' : '#ef4444' }}>
                            {c.status ?? c.Status ?? '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 4px', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: parseFloat(c.cpu ?? 0) > 10 ? '#f59e0b' : 'var(--foreground)' }}>
                          {c.cpu != null ? `${parseFloat(c.cpu).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  Tidak ada container aktif
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            ROW 3: TOP PROCESSES 
        ════════════════════════════════════════════════ */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.40s', marginTop: 20 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Top Processes</div>
              <div className="card-subtitle">10 proses teratas berdasarkan CPU & Memory</div>
            </div>
            <span className="badge badge-info">{processes.length} proses</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['PID', 'NAMA', 'CPU %', 'MEMORY', 'STATUS', 'USER'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--card-border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processes.length > 0 ? processes.map((p, i) => {
                  const cpuPct = parseFloat(p.cpu ?? p.pcpu ?? 0);
                  const memVal = p.memory ?? p.rss ?? p.mem ?? 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(64,114,175,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{p.pid ?? '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>{p.name ?? p.comm ?? '—'}</span>
                        {p.cmd && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cmd}</div>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 2, minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${clamp(cpuPct, 0, 100)}%`, background: cpuPct > 50 ? '#ef4444' : cpuPct > 20 ? '#f59e0b' : '#4072af', borderRadius: 2, transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: cpuPct > 50 ? '#ef4444' : cpuPct > 20 ? '#f59e0b' : 'var(--foreground)', minWidth: 40 }}>{cpuPct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{typeof memVal === 'number' ? fmtBytes(memVal) : memVal}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: (p.status ?? '').toLowerCase() === 'running' ? '#22c55e' : 'var(--text-muted)' }}>
                          {p.status ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.user ?? p.username ?? '—'}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      Memuat data proses...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            ROW 4: Live System Log
        ════════════════════════════════════════════════ */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.48s', marginTop: 20, padding: 0, overflow: 'hidden', background: '#0f172a', border: '1px solid #334155' }}>
          <div className="card-header" style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              <div className="card-title" style={{ color: '#f8fafc', fontSize: 14 }}>Live System Audit (/var/log/syslog)</div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
          </div>
          <div style={{ padding: '16px 20px', height: 200, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6 }}>
            {sysLogs.map((log, i) => {
              let c = '#e2e8f0';
              if (log.msg.includes('Gagal') || log.msg.includes('failed') || log.msg.includes('Blocked')) c = '#ef4444';
              if (log.msg.includes('terhubung') || log.msg.includes('success') || log.msg.includes('Accepted') || log.msg.includes('sehat')) c = '#22c55e';
              if (log.msg.includes('CRON') || log.msg.includes('⚠') || log.msg.includes('Peringatan')) c = '#f59e0b';
              return (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#64748b', marginRight: 12 }}>{log.time}</span>
                  <span style={{ color: c }}>{log.msg}</span>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>
    </>
  );
}