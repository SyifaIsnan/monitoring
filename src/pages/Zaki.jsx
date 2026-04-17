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

/* ── Data Statis Baru (Containers & Logs) ──────────────── */
const CONTAINERS = [
  { name: 'smartcity-api-go', image: 'golang:1.21-alpine', status: 'Up 4 days', cpu: 12.4, ram: '145MB' },
  { name: 'laravel-backend', image: 'php:8.2-fpm', status: 'Up 4 days', cpu: 8.2, ram: '210MB' },
  { name: 'prometheus', image: 'prom/prometheus', status: 'Up 14 days', cpu: 4.1, ram: '512MB' },
  { name: 'grafana', image: 'grafana/grafana', status: 'Up 14 days', cpu: 1.2, ram: '120MB' },
  { name: 'redis-cache', image: 'redis:alpine', status: 'Up 14 days', cpu: 0.8, ram: '64MB' },
  { name: 'prometheus', image: 'prom/prometheus', status: 'Up 14 days', cpu: 4.1, ram: '512MB' },
  { name: 'grafana', image: 'grafana/grafana', status: 'Up 14 days', cpu: 1.2, ram: '120MB' },
  { name: 'redis-cache', image: 'redis:alpine', status: 'Up 14 days', cpu: 0.8, ram: '64MB' },
];

const LOG_MESSAGES = [
  "systemd[1]: Started Laravel Schedule Queue.",
  "sshd[412]: Accepted publickey for root from 192.168.1.44 port 51221 ssh2",
  "kernel: [1245.12] Firewall: Blocked incoming connection on port 22",
  "dockerd[899]: Container smartcity-api-go restarted successfully",
  "nginx[1024]: 192.168.1.10 - - [GET /api/v1/metrics HTTP/1.1] 200",
  "CRON[2011]: (root) CMD ( /usr/local/bin/backup.sh )",
  "prometheus[503]: Scrape failed for target 10.0.0.5:9100",
];

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
  
  // State Log Terminal
  const [sysLogs, setSysLogs] = useState([
    { time: new Date().toLocaleTimeString('id-ID'), msg: "System boot completed. Initializing services..." }
  ]);
  
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);
  const logEndRef = useRef(null);

  // Auto-scroll ke bawah saat log baru masuk
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sysLogs]);

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

      // Simulasi penambahan log terminal secara acak (chance 40% tiap 2 detik)
      if (Math.random() > 0.6) {
        const randomMsg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
        const newLog = { time: new Date().toLocaleTimeString('id-ID'), msg: randomMsg };
        setSysLogs(prev => [...prev, newLog].slice(-15)); // Simpan 15 log terakhir
      }

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
      <Topbar title="Zaki — Server Monitoring" subtitle="Pantau kondisi CPU, RAM, Network, dan Container secara real-time" />
      <div className="page-content section-gap">

        {/* ── Banner Alert if Critical ───────────────────── */}
        {(cpuStatus === 'danger' || ramStatus === 'danger' || diskStatus === 'danger') && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
                { label: 'Load Average', value: `${(cpu / 14).toFixed(2)} ${(cpu / 14 * 0.9).toFixed(2)} ${(cpu / 14 * 0.8).toFixed(2)}` },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value" style={{ color: r.label === 'Temperature' && parseFloat(r.value) > 70 ? '#ef4444' : 'var(--foreground)' }}>{r.value}</span>
                </div>
              ))}
            </div>
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
                { label: 'Swap Used', value: '1.2 GB / 8 GB' },
                { label: 'Cache', value: `${(ram * 0.08).toFixed(1)} GB` },
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
                { label: 'I/O Read', value: '420 MB/s' },
                { label: 'I/O Write', value: '280 MB/s' },
              ].map((r, i) => (
                <div key={i} className="server-detail-row">
                  <span className="server-detail-label">{r.label}</span>
                  <span className="server-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Network + Docker Containers ── */}
        <div className="grid-2" style={{ marginTop: 20 }}>
          {/* Network */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Network I/O</div>
                <div className="card-subtitle">Bandwidth masuk dan keluar (Mbps)</div>
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
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', fontSize: 12 }} formatter={(v) => `${v.toFixed(1)} Mbps`} />
                  <Area type="monotone" dataKey="in" name="In" stroke="#4072af" fill="url(#netIn)" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="out" name="Out" stroke="#22c55e" fill="url(#netOut)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Docker Container Status */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Docker Containers Health</div>
                <div className="card-subtitle">Microservices & monitoring tools</div>
              </div>
              <span className="badge badge-success"><span className="badge-dot" /> {CONTAINERS.length} Running</span>
            </div>
            
            {/* Wrapper Scroll (Membatasi Tinggi Tabel) */}
            <div style={{ maxHeight: 220, overflowY: 'auto', overflowX: 'auto', marginTop: 10, paddingRight: 4 }}>
              <table className="mini-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, position: 'sticky', top: 0, background: 'var(--card-bg, #fff)', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>CONTAINER</th>
                    <th style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, position: 'sticky', top: 0, background: 'var(--card-bg, #fff)', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>IMAGE</th>
                    <th style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, position: 'sticky', top: 0, background: 'var(--card-bg, #fff)', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>CPU %</th>
                    <th style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, position: 'sticky', top: 0, background: 'var(--card-bg, #fff)', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>MEM USAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTAINERS.map((c, i) => (
                    <tr key={i} style={{ borderBottom: i < CONTAINERS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '10px 4px' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2 }}>{c.status}</div>
                      </td>
                      <td style={{ padding: '10px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{c.image}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: c.cpu > 10 ? '#f59e0b' : 'var(--foreground)' }}>
                          {c.cpu.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{c.ram}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

        {/* ── Row 3: System Terminal Logs (FITUR BARU 2) ───── */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.42s', marginTop: 20, padding: 0, overflow: 'hidden', background: '#0f172a', border: '1px solid #334155' }}>
          <div className="card-header" style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              <div className="card-title" style={{ color: '#f8fafc', fontSize: 14 }}>Live System Audit (/var/log/syslog)</div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
          </div>
          
          <div style={{ padding: '16px 20px', height: 200, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#38bdf8', lineHeight: 1.6 }}>
            {sysLogs.map((log, index) => {
              // Pewarnaan log sederhana berdasarkan kata kunci
              let logColor = '#e2e8f0'; // default text
              if (log.msg.includes('Blocked') || log.msg.includes('failed')) logColor = '#ef4444'; // merah
              if (log.msg.includes('Accepted') || log.msg.includes('successfully')) logColor = '#22c55e'; // hijau
              if (log.msg.includes('CRON')) logColor = '#f59e0b'; // kuning
              
              return (
                <div key={index} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#64748b', marginRight: 12 }}>{log.time}</span>
                  <span style={{ color: logColor }}>{log.msg}</span>
                </div>
              );
            })}
            {/* Element dummy untuk target auto-scroll */}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>
    </>
  );
}