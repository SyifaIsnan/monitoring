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

/* ── DATA DUMMY ──────────────────────────────────────────── */
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
      { name: "nginx-proxy",  image: "nginx:alpine",       status: "Up 14 days", cpu: 2.4  },
      { name: "backend-api",  image: "node:18",            status: "Up 2 days",  cpu: 45.1 },
      { name: "db-postgres",  image: "postgres:15",        status: "Up 14 days", cpu: 12.5 },
      { name: "redis-cache",  image: "redis:6",            status: "Up 14 days", cpu: 0.8  },
      { name: "worker-queue", image: "python:3.9",         status: "Up 5 hours", cpu: 28.3 },
      { name: "grafana",      image: "grafana/grafana",    status: "Up 14 days", cpu: 1.2  },
    ]
  }
};

const DUMMY_PROCESSES = [
  { pid: 1452, name: "node",         cmd: "node server.js",           cpu: "45.1", memory: 524288000,  status: "Running", user: "appuser"  },
  { pid: 890,  name: "postgres",     cmd: "postgres -D /var/lib/...", cpu: "12.5", memory: 1048576000, status: "Running", user: "postgres" },
  { pid: 2311, name: "python",       cmd: "python celery_worker.py", cpu: "28.3", memory: 256000000,  status: "Running", user: "appuser"  },
  { pid: 654,  name: "nginx",        cmd: "nginx -g daemon off;",    cpu: "2.4",  memory: 45000000,   status: "Running", user: "root"     },
  { pid: 722,  name: "redis-server", cmd: "redis-server *:6379",     cpu: "0.8",  memory: 128000000,  status: "Running", user: "redis"    },
];

// Interface jaringan sesuai respons /network yang sesungguhnya
const DUMMY_NETWORK = [
  { iface: "eth0",    address: "192.168.1.10", mac: "02:42:ac:11:00:02", family: "IPv4", internal: false },
  { iface: "eth1",    address: "10.0.0.5",     mac: "02:42:ac:12:00:05", family: "IPv4", internal: false },
  { iface: "lo",      address: "127.0.0.1",    mac: "00:00:00:00:00:00", family: "IPv4", internal: true  },
  { iface: "docker0", address: "172.17.0.1",   mac: "02:42:e8:fc:a2:11", family: "IPv4", internal: false },
];

/* ── Ring Gauge ──────────────────────────────────────────── */
function RingGauge({ pct, label, color, size = 160, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const st = pct > 85 ? 'danger' : pct > 65 ? 'warning' : 'ok';
  const sc = st === 'danger' ? '#ef4444' : st === 'warning' ? '#f59e0b' : color;
  return (
    <div className="server-ring-wrap">
      <div className="server-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--accent-light)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={sc} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }} />
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
  const id = `sg-${color.replace('#', '')}`;
  return (
    <div style={{ height: 60, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="val" stroke={color} fill={`url(#${id})`} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const StatusBadge = ({ pct }) => {
  if (pct > 85) return <span className="badge badge-danger"><span className="badge-dot" />Kritis</span>;
  if (pct > 65) return <span className="badge badge-warning"><span className="badge-dot" />Tinggi</span>;
  return <span className="badge badge-success"><span className="badge-dot" />Normal</span>;
};

const HealthDot = ({ status }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: status === 'ok' ? '#22c55e' : '#ef4444' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'ok' ? '#22c55e' : '#ef4444', animation: 'blink 1.5s infinite', boxShadow: `0 0 6px ${status === 'ok' ? '#22c55e' : '#ef4444'}` }} />
    {status === 'ok' ? 'ONLINE' : 'OFFLINE'}
  </span>
);

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Zaki() {
  const [sysData,   setSysData]   = useState(DUMMY_SYSTEM_DATA);
  const [health,    setHealth]    = useState({ status: 'ok', uptime: 1239720 });
  const [processes, setProcesses] = useState(DUMMY_PROCESSES);
  const [network]                 = useState(DUMMY_NETWORK); // static dari /network
  const [apiError,  setApiError]  = useState(false);
  const [lastFetch, setLastFetch] = useState(new Date().toLocaleTimeString('id-ID'));

  /* ── Chart History — masing-masing punya state sendiri ── */
  const mkHist = (base, n = 20) =>
    Array.from({ length: n }, (_, i) => ({ t: `T-${n - i}`, val: clamp(base + (Math.random() - 0.5) * 10, 0, 100) }));

  const [cpuHist,  setCpuHist]  = useState(() => mkHist(42));
  const [ramHist,  setRamHist]  = useState(() => mkHist(68));
  const [diskHist, setDiskHist] = useState(() => mkHist(78)); // ✅ bukan flat line lagi

  /* ── Simulasi update (replace dengan fetch API nyata) ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      setSysData(prev => {
        const newCpu  = clamp(parseFloat(prev.cpu.usage.percentUsed)  + (Math.random() * 16 - 8),  10, 95);
        const newRam  = clamp(parseFloat(prev.memory.percentUsed)      + (Math.random() * 4  - 2),  40, 85);
        const newDisk = clamp(parseFloat(prev.disk.percentUsed)        + (Math.random() * 0.1),     70, 90);
        const usedRam  = (newRam  / 100) * prev.memory.total;
        const usedDisk = (newDisk / 100) * prev.disk.total;

        setCpuHist(h  => [...h.slice(1),  { t: 'T-0', val: newCpu  }]);
        setRamHist(h  => [...h.slice(1),  { t: 'T-0', val: newRam  }]);
        setDiskHist(h => [...h.slice(1),  { t: 'T-0', val: newDisk }]); // ✅ update nyata

        return {
          ...prev,
          cpu:    { ...prev.cpu,    usage:  { percentUsed: newCpu  } },
          memory: { ...prev.memory, percentUsed: newRam,  used: usedRam,  human: { ...prev.memory.human, used: fmtBytes(usedRam)  } },
          disk:   { ...prev.disk,   percentUsed: newDisk, used: usedDisk, human: { ...prev.disk.human,   used: fmtBytes(usedDisk) } },
        };
      });

      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: clamp(parseFloat(p.cpu) + (Math.random() * 10 - 5), 0, 95).toFixed(1),
      })));

      setLastFetch(new Date().toLocaleTimeString('id-ID'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ── Derived ─────────────────────────────────────────── */
  const cpu  = parseFloat(sysData?.cpu?.usage?.percentUsed || 0);
  const ram  = parseFloat(sysData?.memory?.percentUsed     || 0);
  const disk = parseFloat(sysData?.disk?.percentUsed       || 0);

  const cpuColor  = cpu  > 85 ? '#ef4444' : cpu  > 65 ? '#f59e0b' : '#4072af';
  const ramColor  = ram  > 85 ? '#ef4444' : ram  > 65 ? '#f59e0b' : '#22c55e';
  const diskColor = disk > 85 ? '#ef4444' : disk > 65 ? '#f59e0b' : '#f59e0b';

  const isCritical = cpu > 85 || ram > 85 || disk > 85;
  const uptime  = sysData?.system?.uptime?.formatted ?? '—';
  const loadAvg = sysData?.system?.loadAverage;

  return (
    <>
      <Topbar title="Zaki — Server Monitoring" subtitle="Pantau kondisi CPU, RAM, Network, dan Container secara real-time" />
      <div className="page-content section-gap" style={{ maxWidth: '100%' }}>

        {/* Banner API Error */}
        {apiError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>Koneksi API Gagal</span>
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>Tidak dapat terhubung ke server. Menampilkan data dummy.</span>
          </div>
        )}

        {/* Banner Kritis */}
        {isCritical && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>⚠ Peringatan Sistem</span>
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>Salah satu resource melebihi batas kritis. Segera periksa!</span>
          </div>
        )}

        {/* ══ ROW 0: System Info + Health Check ══ */}
        <div className="grid-2" style={{ marginBottom: 20, alignItems: 'stretch' }}>

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
                { label: 'Hostname',  value: sysData?.system?.hostname ?? '—' },
                { label: 'Platform',  value: sysData?.system?.platform ?? '—' },
                { label: 'Arch',      value: sysData?.system?.arch     ?? '—' },
                { label: 'CPU Cores', value: sysData?.system?.cpus     ?? '—' },
                { label: 'Uptime',    value: uptime },
                { label: 'CPU Model', value: sysData?.cpu?.model       ?? '—' },
                { label: 'Load 1m',   value: loadAvg?.['1min']         ?? '—' },
                { label: 'Load 5m',   value: loadAvg?.['5min']         ?? '—' },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Update terakhir: {lastFetch}
            </div>
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.06s' }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-title">Health Check</div>
                <div className="card-subtitle">Status layanan dari endpoint /health</div>
              </div>
              <span className={`badge ${health?.status === 'ok' ? 'badge-success' : 'badge-danger'}`}>
                <span className="badge-dot" />{health?.status?.toUpperCase() ?? 'LOADING'}
              </span>
            </div>
            <div style={{ textAlign: 'center', padding: '18px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px', background: health?.status === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `2px solid ${health?.status === 'ok' ? '#22c55e' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {health?.status === 'ok'
                  ? <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="36" height="36" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: health?.status === 'ok' ? '#22c55e' : '#ef4444' }}>
                {health?.status === 'ok' ? 'Server Online' : 'Server Error'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {health?.uptime ? `Uptime: ${Math.floor(health.uptime / 3600)}j ${Math.floor((health.uptime % 3600) / 60)}m` : ''}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'CPU Check',  ok: cpu  < 90, val: fmtPct(cpu)  },
                { label: 'RAM Check',  ok: ram  < 90, val: fmtPct(ram)  },
                { label: 'Disk Check', ok: disk < 90, val: fmtPct(disk) },
                { label: 'Docker',     ok: sysData?.docker?.running > 0, val: `${sysData?.docker?.running ?? 0}/${sysData?.docker?.total ?? 0}` },
              ].map((item, i) => (
                <div key={i} style={{ background: item.ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${item.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.ok ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ROW 1: CPU / RAM / Disk Gauges ══ */}
        <div className="grid-3">

          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">CPU Usage</div>
                <div className="card-subtitle">{sysData?.cpu?.model ?? '—'} — {sysData?.cpu?.cores ?? '—'} Core</div>
              </div>
              <StatusBadge pct={cpu} />
            </div>
            <RingGauge pct={cpu} label="CPU" color="#4072af" />
            <Sparkline data={cpuHist} color={cpuColor} />
            <div className="server-details">
              {[
                { label: 'Cores',       value: sysData?.cpu?.cores ?? '—' },
                { label: 'Clock Speed', value: `${sysData?.cpu?.speed ?? '—'} MHz` },
                { label: 'Load 1m',     value: loadAvg?.['1min'] ?? '—' },
                { label: 'Load 5m',     value: loadAvg?.['5min'] ?? '—' },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

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
                { label: 'Terpakai',   value: sysData?.memory?.human?.used  ?? '—' },
                { label: 'Total',      value: sysData?.memory?.human?.total  ?? '—' },
                { label: 'Used Bytes', value: fmtBytes(sysData?.memory?.used) },
                { label: 'Free Bytes', value: fmtBytes((sysData?.memory?.total ?? 0) - (sysData?.memory?.used ?? 0)) },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.24s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">Disk Usage</div>
                <div className="card-subtitle">Total {sysData?.disk?.human?.total ?? '—'}</div>
              </div>
              <StatusBadge pct={disk} />
            </div>
            <RingGauge pct={disk} label="Disk" color="#f59e0b" />
            {/* ✅ Sparkline disk kini punya history tersendiri */}
            <Sparkline data={diskHist} color={diskColor} />
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

        {/* ══ ROW 2: Network Interfaces (✅ bukan chart palsu) + Docker ══ */}
        <div className="grid-2" style={{ marginTop: 20 }}>

          <div className="card animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Network Interfaces</div>
                <div className="card-subtitle">Interface aktif dari endpoint /network</div>
              </div>
              <span className="badge badge-info">{network.filter(n => !n.internal).length} External</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['INTERFACE', 'IP ADDRESS', 'MAC', 'TIPE'].map(h => (
                      <th key={h} style={{ padding: '8px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {network.map((n, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: n.internal ? 'var(--text-muted)' : '#3b82f6' }}>{n.iface}</span>
                      </td>
                      <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{n.address}</td>
                      <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{n.mac}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: n.internal ? 'rgba(100,116,139,0.1)' : 'rgba(34,197,94,0.1)', color: n.internal ? '#64748b' : '#22c55e' }}>
                          {n.internal ? 'Loopback' : 'External'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Docker Containers</div>
                <div className="card-subtitle">Status container dari endpoint /docker</div>
              </div>
              <span className="badge badge-success">
                <span className="badge-dot" /> {sysData?.docker?.running ?? 0} Running
              </span>
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['CONTAINER', 'IMAGE', 'STATUS', 'CPU%'].map(h => (
                      <th key={h} style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', position: 'sticky', top: 0, background: 'var(--card-bg,#fff)', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(sysData?.docker?.containers ?? []).map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 4px' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>{c.name}</div>
                      </td>
                      <td style={{ padding: '10px 4px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{c.image}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{ fontSize: 11, color: (c.status ?? '').toLowerCase().includes('up') ? '#22c55e' : '#ef4444' }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '10px 4px', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: parseFloat(c.cpu ?? 0) > 10 ? '#f59e0b' : 'var(--foreground)' }}>
                        {c.cpu != null ? `${parseFloat(c.cpu).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══ ROW 3: Top Processes ══ */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.40s', marginTop: 20 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Top Processes</div>
              <div className="card-subtitle">Proses teratas dari endpoint /processes</div>
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
                {processes.map((p, i) => {
                  const cpuPct = parseFloat(p.cpu ?? 0);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(64,114,175,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{p.pid}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{p.name}</span>
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
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{fmtBytes(p.memory ?? 0)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: (p.status ?? '').toLowerCase() === 'running' ? '#22c55e' : 'var(--text-muted)' }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.user}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}