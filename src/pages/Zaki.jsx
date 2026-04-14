import { useState, useEffect, useRef } from 'react';
import Topbar from '../components/Topbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

/* ── Generate realtime-ish history ─────────────────────── */
const genHistory = (base, variance, count = 20) =>
  Array.from({ length: count }, (_, i) => ({
    t: `T-${count - i}`,
    val: Math.min(100, Math.max(0, base + (Math.random() - 0.5) * variance)),
  }));

const CPU_INIT = genHistory(42, 28);
const RAM_INIT = genHistory(67, 18);
const DISK_INIT = genHistory(55, 8);

/* ── Ring SVG ────────────────────────────────────────────── */
function RingGauge({ pct, label, color, size = 160, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const status = pct > 85 ? 'danger' : pct > 65 ? 'warning' : 'ok';
  const statusColor = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : color;
  const statusLabel = status === 'danger' ? 'KRITIS' : status === 'warning' ? 'TINGGI' : 'NORMAL';

  return (
    <div className="server-ring-wrap">
      <div className="server-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent-light)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div className="ring-center">
          <div className="ring-pct" style={{ color: statusColor }}>{pct.toFixed(0)}%</div>
          <div className="ring-unit">{label}</div>
        </div>
      </div>
      <span className={`badge badge-${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'success'}`}>
        <span className="badge-dot" />{statusLabel}
      </span>
    </div>
  );
}

/* ── Mini Sparkline ──────────────────────────────────────── */
function Sparkline({ data, color }) {
  return (
    <div style={{ height: 60, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="val" stroke={color} fill={`url(#spark-${color})`} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Process Table ───────────────────────────────────────── */
const PROCESSES = [
  { name: 'nginx', pid: 1024, cpu: 8.2, mem: 2.1, status: 'running' },
  { name: 'node (API)', pid: 2048, cpu: 22.4, mem: 18.7, status: 'running' },
  { name: 'postgres', pid: 3072, cpu: 12.8, mem: 31.2, status: 'running' },
  { name: 'redis-server', pid: 4096, cpu: 3.1, mem: 6.4, status: 'running' },
  { name: 'python (ML)', pid: 5120, cpu: 44.7, mem: 28.9, status: 'high' },
  { name: 'ffmpeg (CCTV)', pid: 6144, cpu: 18.3, mem: 12.1, status: 'running' },
  { name: 'cron scheduler', pid: 7168, cpu: 0.4, mem: 0.8, status: 'running' },
];

/* ── Server Nodes ────────────────────────────────────────── */
const SERVERS = [
  { name: 'Server Utama', ip: '10.0.0.1', cpu: 42, ram: 67, disk: 55, net: '120 Mbps', os: 'Ubuntu 22.04 LTS', uptime: '142 hari' },
  { name: 'Server Backup', ip: '10.0.0.2', cpu: 18, ram: 34, disk: 72, net: '45 Mbps', os: 'Ubuntu 22.04 LTS', uptime: '89 hari' },
  { name: 'DB Server', ip: '10.0.0.3', cpu: 63, ram: 81, disk: 48, net: '88 Mbps', os: 'Debian 11', uptime: '201 hari' },
];

/* ── Network History ─────────────────────────────────────── */
const NET_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  t: `T-${20 - i}`,
  in: Math.random() * 80 + 20,
  out: Math.random() * 50 + 10,
}));

export default function Zaki() {
  const [cpu, setCpu] = useState(42);
  const [ram, setRam] = useState(67);
  const [disk, setDisk] = useState(55);
  const [cpuHist, setCpuHist] = useState(CPU_INIT);
  const [ramHist, setRamHist] = useState(RAM_INIT);
  const [netHist, setNetHist] = useState(NET_HISTORY);
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);

      // Simulate fluctuation
      setCpu(prev => Math.min(100, Math.max(5, prev + (Math.random() - 0.5) * 8)));
      setRam(prev => Math.min(100, Math.max(30, prev + (Math.random() - 0.48) * 3)));
      setDisk(prev => Math.min(100, Math.max(40, prev + Math.random() * 0.05)));

      setCpuHist(prev => [...prev.slice(1), { t: `T-0`, val: cpu + (Math.random() - 0.5) * 8 }]);
      setRamHist(prev => [...prev.slice(1), { t: `T-0`, val: ram + (Math.random() - 0.5) * 3 }]);
      setNetHist(prev => [...prev.slice(1), { t: `T-0`, in: Math.random() * 80 + 20, out: Math.random() * 50 + 10 }]);
    }, 2000);
    return () => clearInterval(interval);
  }, [cpu, ram]);

  const cpuStatus = cpu > 85 ? 'danger' : cpu > 65 ? 'warning' : 'ok';
  const ramStatus = ram > 85 ? 'danger' : ram > 65 ? 'warning' : 'ok';
  const diskStatus = disk > 85 ? 'danger' : disk > 65 ? 'warning' : 'ok';

  const getStatusBadge = (pct) => {
    if (pct > 85) return <span className="badge badge-danger"><span className="badge-dot" />Kritis</span>;
    if (pct > 65) return <span className="badge badge-warning"><span className="badge-dot" />Tinggi</span>;
    return <span className="badge badge-success"><span className="badge-dot" />Normal</span>;
  };

  return (
    <>
      <Topbar title="Zaki — Server Monitoring" subtitle="Pantau kondisi CPU, RAM, dan Disk server secara real-time" />
      <div className="page-content section-gap">

        {/* ── Banner Alert if Critical ───────────────────── */}
        {(cpuStatus === 'danger' || ramStatus === 'danger' || diskStatus === 'danger') && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>⚠ Peringatan Sistem</span>
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>Salah satu atau lebih resource server melampaui batas kritis. Segera periksa!</span>
          </div>
        )}

        {/* ── Row 1: 3 Gauge Cards ──────────────────────── */}
        <div className="grid-3">

          {/* CPU */}
          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">CPU Usage</div>
                <div className="card-subtitle">Intel Xeon E5-2680 v4 — 14 Core</div>
              </div>
              {getStatusBadge(cpu)}
            </div>
            <RingGauge pct={cpu} label="CPU" color="#4072af" />
            <Sparkline data={cpuHist} color={cpuStatus === 'danger' ? '#ef4444' : cpuStatus === 'warning' ? '#f59e0b' : '#4072af'} />
            <div className="server-details">
              {[
                { label: 'Core Aktif', value: '14/14' },
                { label: 'Clock Speed', value: '3.2 GHz' },
                { label: 'Temperature', value: `${(45 + cpu * 0.3).toFixed(0)}°C` },
                { label: 'Proses Berjalan', value: `${PROCESSES.length}` },
                { label: 'Load Average', value: `${(cpu / 14).toFixed(2)} ${(cpu / 14 * 0.9).toFixed(2)} ${(cpu / 14 * 0.8).toFixed(2)}` },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value" style={{ color: r.label === 'Temperature' && parseFloat(r.value) > 70 ? '#ef4444' : 'var(--foreground)' }}>{r.value}</span>
                </div>
              ))}
            </div>
            {cpu > 65 && (
              <div className="alert-item warning" style={{ marginTop: 12, marginBottom: 0 }}>
                <svg width="13" height="13" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div className="alert-text">
                  <strong>CPU {cpu > 85 ? 'sangat tinggi' : 'tinggi'}</strong>
                  <span>Pertimbangkan untuk {cpu > 85 ? 'segera menghentikan proses berat' : 'memantau proses berjalan'}</span>
                </div>
              </div>
            )}
          </div>

          {/* RAM */}
          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.16s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">RAM Usage</div>
                <div className="card-subtitle">DDR4 ECC — Total 64 GB</div>
              </div>
              {getStatusBadge(ram)}
            </div>
            <RingGauge pct={ram} label="RAM" color="#22c55e" />
            <Sparkline data={ramHist} color={ramStatus === 'danger' ? '#ef4444' : ramStatus === 'warning' ? '#f59e0b' : '#22c55e'} />
            <div className="server-details">
              {[
                { label: 'Terpakai', value: `${(ram / 100 * 64).toFixed(1)} GB` },
                { label: 'Tersedia', value: `${((100 - ram) / 100 * 64).toFixed(1)} GB` },
                { label: 'Total', value: '64 GB' },
                { label: 'Swap Used', value: '1.2 GB / 8 GB' },
                { label: 'Cache', value: `${(ram * 0.08).toFixed(1)} GB` },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
            {ram > 65 && (
              <div className={`alert-item ${ram > 85 ? 'danger' : 'warning'}`} style={{ marginTop: 12, marginBottom: 0 }}>
                <svg width="13" height="13" fill="none" stroke={ram > 85 ? '#ef4444' : '#f59e0b'} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div className="alert-text">
                  <strong>RAM {ram > 85 ? 'hampir penuh!' : 'penggunaan tinggi'}</strong>
                  <span>{ram > 85 ? 'Segera bebaskan memory atau tambah kapasitas' : 'Pantau aplikasi yang mengonsumsi banyak memory'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Disk */}
          <div className="server-metric animate-fade-up" style={{ animationDelay: '0.24s' }}>
            <div className="card-header" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">Disk Usage</div>
                <div className="card-subtitle">SSD NVMe — Total 2 TB</div>
              </div>
              {getStatusBadge(disk)}
            </div>
            <RingGauge pct={disk} label="Disk" color="#f59e0b" />
            <Sparkline data={DISK_INIT} color={diskStatus === 'danger' ? '#ef4444' : diskStatus === 'warning' ? '#f59e0b' : '#f59e0b'} />
            <div className="server-details">
              {[
                { label: 'Terpakai', value: `${(disk / 100 * 2).toFixed(2)} TB` },
                { label: 'Tersedia', value: `${((100 - disk) / 100 * 2).toFixed(2)} TB` },
                { label: 'Total', value: '2.00 TB' },
                { label: 'I/O Read', value: '420 MB/s' },
                { label: 'I/O Write', value: '280 MB/s' },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
            {disk > 65 && (
              <div className={`alert-item ${disk > 85 ? 'danger' : 'warning'}`} style={{ marginTop: 12, marginBottom: 0 }}>
                <svg width="13" height="13" fill="none" stroke={disk > 85 ? '#ef4444' : '#f59e0b'} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div className="alert-text">
                  <strong>Disk {disk > 85 ? 'hampir habis!' : 'penggunaan tinggi'}</strong>
                  <span>{disk > 85 ? 'Segera hapus file tidak perlu atau ekspansi storage' : 'Pantau pertumbuhan data secara berkala'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Network + Processes ────────────────── */}
        <div className="grid-2">
          {/* Network */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Network I/O</div>
                <div className="card-subtitle">Bandwidth masuk dan keluar (Mbps)</div>
              </div>
              <span className="badge badge-info">Real-time</span>
            </div>
            <div style={{ height: 200 }}>
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
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} formatter={(v) => `${v.toFixed(1)} Mbps`} />
                  <Area type="monotone" dataKey="in" name="In" stroke="#4072af" fill="url(#netIn)" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="out" name="Out" stroke="#22c55e" fill="url(#netOut)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Process Table */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="card-header">
              <div className="card-title">Top Processes</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Update tiap 2 detik</span>
            </div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Proses</th>
                  <th>PID</th>
                  <th>CPU%</th>
                  <th>MEM%</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSES.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{p.pid}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: p.cpu > 30 ? '#ef4444' : p.cpu > 15 ? '#f59e0b' : 'var(--foreground)' }}>
                        {p.cpu.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{p.mem.toFixed(1)}%</td>
                    <td>
                      <span className={`badge badge-${p.status === 'high' ? 'warning' : 'success'}`} style={{ fontSize: 10 }}>
                        {p.status === 'high' ? 'Tinggi' : 'Running'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Row 3: Multi-Server Status ─────────────────── */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.42s' }}>
          <div className="card-header">
            <div className="card-title">Status Semua Server Node</div>
            <span className="badge badge-success"><span className="badge-dot" /> {SERVERS.length} server online</span>
          </div>
          <div className="grid-3">
            {SERVERS.map((s, i) => (
              <div key={i} style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>{s.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.ip}</div>
                  </div>
                  <span className="badge badge-success"><span className="badge-dot" />Online</span>
                </div>
                {[
                  { label: 'CPU', val: s.cpu, color: s.cpu > 85 ? '#ef4444' : s.cpu > 65 ? '#f59e0b' : '#4072af' },
                  { label: 'RAM', val: s.ram, color: s.ram > 85 ? '#ef4444' : s.ram > 65 ? '#f59e0b' : '#22c55e' },
                  { label: 'Disk', val: s.disk, color: s.disk > 85 ? '#ef4444' : s.disk > 65 ? '#f59e0b' : '#f59e0b' },
                ].map((r, j) => (
                  <div key={j} className="progress-wrap" style={{ marginBottom: 10 }}>
                    <div className="progress-header" style={{ marginBottom: 5 }}>
                      <span className="progress-label" style={{ fontSize: 12 }}>{r.label}</span>
                      <span className="progress-value" style={{ color: r.color, fontSize: 12 }}>{r.val}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${r.val}%`, background: r.color }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--card-border)', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>🕒 Uptime: <b style={{ color: 'var(--foreground)' }}>{s.uptime}</b></span>
                  <span>🌐 <b style={{ color: 'var(--foreground)' }}>{s.net}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}