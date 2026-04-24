import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/* ── Data Statis & Initial State ────────────────────────── */

// 12 Daftar CCTV
const CCTV_LIST = [
  { id: 'CAM-01', name: 'Gerbang Utama', status: 'aktif' },
  { id: 'CAM-02', name: 'Area Tiket 1', status: 'aktif' },
  { id: 'CAM-03', name: 'Area Tiket 2', status: 'aktif' },
  { id: 'CAM-04', name: 'Lobby Informasi', status: 'aktif' },
  { id: 'CAM-05', name: 'Zona Wisata A', status: 'aktif' },
  { id: 'CAM-06', name: 'Zona Wisata B', status: 'mati' },
  { id: 'CAM-07', name: 'Zona Wisata C', status: 'aktif' },
  { id: 'CAM-08', name: 'Wahana Air 1', status: 'aktif' },
  { id: 'CAM-09', name: 'Parkiran Timur', status: 'mati' },
  { id: 'CAM-10', name: 'Parkiran Barat', status: 'aktif' },
  { id: 'CAM-11', name: 'Zona Kuliner 1', status: 'aktif' },
  { id: 'CAM-12', name: 'Zona Kuliner 2', status: 'aktif' },
];

const TRENDING_TOPIC = [
  { rank: 1, topic: 'Tiket Masuk Taman Safari', count: 1240 },
  { rank: 2, topic: 'Jadwal Event Weekend', count: 980 },
  { rank: 3, topic: 'Promo Liburan Lebaran', count: 754 },
  { rank: 4, topic: 'Cara Refund Tiket', count: 621 },
  { rank: 5, topic: 'Fasilitas Ramah Anak', count: 489 },
];

const TRENDING_LOCATION = [
  { rank: 1, topic: 'Pantai Anyer', count: 2140 },
  { rank: 2, topic: 'Candi Borobudur', count: 1688 },
  { rank: 3, topic: 'Taman Safari Bogor', count: 1320 },
  { rank: 4, topic: 'Gunung Bromo', count: 998 },
  { rank: 5, topic: 'Kebun Raya Cibodas', count: 740 },
];

const INITIAL_TICKET_SALES = [
  { wisata: 'Pantai Anyer', terjual: 1240 },
  { wisata: 'Taman Safari', terjual: 980 },
  { wisata: 'Borobudur', terjual: 850 },
  { wisata: 'Gunung Bromo', terjual: 620 },
  { wisata: 'Kebun Raya', terjual: 450 },
  { wisata: 'Pulau Komodo', terjual: 210 },
  { wisata: 'Pantai Cilacap', terjual: 11240 },
  { wisata: 'Taman Bunga', terjual: 9180 },
  { wisata: 'Bukit Tinggi', terjual: 8150 },
  { wisata: 'Gunung Slamet', terjual: 6210 },
  { wisata: 'Kebun Raya Bogor', terjual: 4510 },
  { wisata: 'Pulau Seribu', terjual: 2110 },
];

const INITIAL_PIE_DATA = [
  { name: 'Berhasil', value: 3840, color: '#22c55e' },
  { name: 'Pending', value: 450, color: '#f59e0b' },
  { name: 'Gagal', value: 85, color: '#ef4444' },
];

const DUMMY_EMAILS = ['rizky@gmail.com', 'siti_n@yahoo.com', 'joko.w@company.id', 'ayu.lestari@gmail.com', 'hendra99@hotmail.com', 'putri.a@gmail.com'];
const DUMMY_ERRORS = [
  { type: 'danger', title: 'Transaksi Gagal', desc: 'Timeout saat koneksi ke Payment Gateway' },
  { type: 'warning', title: 'Database Beban Tinggi', desc: 'Penggunaan CPU Database > 85%' },
  { type: 'danger', title: 'CCTV Glitch', desc: 'CAM-09 Parkiran Timur kehilangan sinyal' },
  { type: 'warning', title: 'Fraud Detected', desc: 'Percobaan login gagal 5x berturut-turut' },
];

/* ── Komponen CCTV ──────────────────────────────────────── */
function CctvCam({ cam }) {
  const isActive = cam.status === 'aktif';
  return (
    <div className="cctv-card" style={{ background: '#1e293b', borderRadius: 8, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive ? (
        <>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
            <path d="M23 7 16 12 23 17V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, color: 'rgba(255,255,255,0.9)', fontFamily: 'JetBrains Mono', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: 4 }}>
            {cam.id}
          </div>
          <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%', animation: 'blink 1.5s infinite' }} />
            <span style={{ fontSize: 8, color: '#ef4444', fontWeight: 700, letterSpacing: 0.5 }}>REC</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
              <line x1="2" y1="2" x2="22" y2="22"/><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L23 7v10"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10z"/>
            </svg>
            <div style={{ fontSize: 9, color: 'rgba(239,68,68,0.7)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>OFFLINE</div>
          </div>
          <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>
            {cam.id}
          </div>
        </>
      )}
      <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 9, color: 'rgba(255,255,255,0.7)', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2px 4px', borderRadius: 4 }}>
        {cam.name}
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ───────────────────────────── */
export default function Nadya() {
  const [totalRegisterToday, setTotalRegisterToday] = useState(312); 
  const cctvAktif = CCTV_LIST.filter(c => c.status === 'aktif').length;

  const [activeUsers, setActiveUsers] = useState(142);
  const [ticketSales, setTicketSales] = useState(INITIAL_TICKET_SALES);
  const [pieData, setPieData] = useState(INITIAL_PIE_DATA);
  const [liveTrx, setLiveTrx] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  
  const [sortMethod, setSortMethod] = useState('terbanyak');
  
  const totalTransaksi = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const maxSales = Math.max(...ticketSales.map(t => t.terjual));

  // FORMAT: Jam dan Menit Saja (HH:MM)
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  useEffect(() => {
    // Inisialisasi awal list
    setLiveTrx([
      { time: getCurrentTime(), email: 'dina_marlina@hotmail.com', status: 'berhasil' },
      { time: getCurrentTime(), email: 'alexander22@gmail.com', status: 'pending' },
      { time: getCurrentTime(), email: 'budi.antoro@yahoo.com', status: 'gagal' }
    ]);
    
    setLiveAlerts([
      { type: 'danger', title: 'CCTV Offline', desc: 'Koneksi ke CAM-06 terputus', time: getCurrentTime() },
      { type: 'warning', title: 'Payment Gateway', desc: 'Latensi Bank BRI > 500ms', time: getCurrentTime() }
    ]);

    // INTERVAL 1: Fluktuasi User & Registrasi (Per 1 Menit)
    const userInterval = setInterval(() => {
      // User aktif naik turun
      setActiveUsers(prev => Math.max(1, prev + (Math.floor(Math.random() * 21) - 10)));
      // Register bertambah
      setTotalRegisterToday(prev => prev + Math.floor(Math.random() * 5));
    }, 60000);

    // INTERVAL 2: Simulasi Transaksi Batch (Per 1 Menit)
    const trxInterval = setInterval(() => {
      // Dalam 1 menit, simulasi ada 5-15 transaksi masuk sekaligus
      const trxCount = Math.floor(Math.random() * 10) + 5; 
      
      let newBerhasil = 0;
      let newPending = 0;
      let newGagal = 0;
      const newLogs = [];

      for(let i=0; i<trxCount; i++) {
        const randStatus = Math.random();
        let statusTrx = 'berhasil';

        if (randStatus > 0.9) {
          statusTrx = 'gagal';
          newGagal++;
        } else if (randStatus > 0.75) {
          statusTrx = 'pending';
          newPending++;
        } else {
          newBerhasil++;
        }

        // Ambil beberapa transaksi untuk ditampilkan di tabel log (maks 5 agar tidak kepanjangan)
        if (newLogs.length < 5) {
          const email = DUMMY_EMAILS[Math.floor(Math.random() * DUMMY_EMAILS.length)];
          newLogs.push({ time: getCurrentTime(), email, status: statusTrx });
        }
      }

      // 1. Update Pie Chart secara kumulatif
      setPieData(prev => [
        { ...prev[0], value: prev[0].value + newBerhasil },
        { ...prev[1], value: prev[1].value + newPending },
        { ...prev[2], value: prev[2].value + newGagal },
      ]);

      // 2. Update Live List Table
      setLiveTrx(prev => [...newLogs, ...prev].slice(0, 8));

      // 3. Update Tabel Tiket Penjualan secara batch
      setTicketSales(prevSales => {
        const newSales = [...prevSales];
        // Sebarkan jumlah tiket berhasil ke random destinasi
        for(let i=0; i<newBerhasil; i++) {
            const randomIndex = Math.floor(Math.random() * newSales.length);
            // Tiap transaksi berhasil bisa berarti beli 1-4 tiket sekaligus
            const qty = Math.floor(Math.random() * 4) + 1; 
            newSales[randomIndex] = {
              ...newSales[randomIndex],
              terjual: newSales[randomIndex].terjual + qty
            };
        }
        return newSales; 
      });

    }, 60000); 

    // INTERVAL 3: Simulasi Alert Error (Per 1 Menit)
    const alertInterval = setInterval(() => {
      // Probabilitas munculnya error tiap menit diset ke 40%
      const hasNewError = Math.random() > 0.6; 
      if (hasNewError) {
        setLiveAlerts(prev => {
          const errIndex = Math.floor(Math.random() * DUMMY_ERRORS.length);
          const newAlert = { ...DUMMY_ERRORS[errIndex], time: getCurrentTime() };
          return [newAlert, ...prev].slice(0, 6); 
        });
      }
    }, 60000);

    return () => {
      clearInterval(userInterval);
      clearInterval(trxInterval);
      clearInterval(alertInterval);
    };
  }, []);

  // Memproses data untuk Tabel: Kalkulasi Rank & Pengurutan
  const getDisplayedTickets = () => {
    const rankedData = [...ticketSales]
      .sort((a, b) => b.terjual - a.terjual)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    if (sortMethod === 'az') {
      return rankedData.sort((a, b) => a.wisata.localeCompare(b.wisata));
    }
    return rankedData; // Default: Terbanyak
  };

  const displayedTickets = getDisplayedTickets();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'berhasil': return <span className="badge badge-success" style={{ minWidth: 65, textAlign: 'center' }}>Berhasil</span>;
      case 'pending': return <span className="badge badge-warning" style={{ minWidth: 65, textAlign: 'center' }}>Pending</span>;
      case 'gagal': return <span className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', minWidth: 65, textAlign: 'center' }}>Gagal</span>;
      default: return null;
    }
  };

  const getAlertBadge = (type) => {
    if (type === 'danger') {
      return <span className="badge" style={{ backgroundColor: '#ef4444', color: '#fff', minWidth: 65, textAlign: 'center' }}>Danger</span>;
    }
    return <span className="badge" style={{ backgroundColor: '#f59e0b', color: '#fff', minWidth: 65, textAlign: 'center' }}>Warning</span>;
  };

  return (
    <>
      <Topbar title="SmartCity Monitoring Center" subtitle="Monitoring user, transaksi, trending, dan CCTV real-time" />
      <div className="page-content section-gap">

        {/* ── 1. Top Stats Cards ────────────────────────────────── */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#f59e0b', '--stat-bg': 'rgba(245,158,11,.12)', animationDelay: '0s' }}>
            <div className="stat-info">
              <div className="stat-label">Register Hari Ini</div>
              <div className="stat-value">{totalRegisterToday}</div>
              <div className="stat-change up">+4% dari kemarin</div>
            </div>
          </div>
          
          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#22c55e', '--stat-bg': 'rgba(34,197,94,.12)', animationDelay: '0.08s' }}>
            <div className="stat-info">
              <div className="stat-label">User Aktif Real-time</div>
              <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeUsers}
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
              </div>
              <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Fluktuasi per menit</div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ '--stat-color': cctvAktif < CCTV_LIST.length ? '#ef4444' : '#3b82f6', '--stat-bg': cctvAktif < CCTV_LIST.length ? 'rgba(239,68,68,.12)' : 'rgba(59,130,246,.12)', animationDelay: '0.16s' }}>
            <div className="stat-info">
              <div className="stat-label">Kamera CCTV Aktif</div>
              <div className="stat-value">{cctvAktif} / {CCTV_LIST.length}</div>
              <div className={`stat-change ${cctvAktif < CCTV_LIST.length ? 'down' : 'up'}`}>
                {CCTV_LIST.length - cctvAktif} kamera offline
              </div>
            </div>
          </div>

          <div className="stat-card animate-fade-up" style={{ '--stat-color': '#4072af', '--stat-bg': '#dae2ef', animationDelay: '0.24s' }}>
            <div className="stat-info">
              <div className="stat-label">Total Transaksi</div>
              <div className="stat-value" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4072af' }}>
                {totalTransaksi.toLocaleString()}
              </div>
              <div className="stat-change up" style={{ color: '#4072af', fontWeight: 500 }}>Update per menit</div>
            </div>
          </div>
        </div>

        {/* ── 2. Live CCTV Monitoring (12 Kamera) ───────────────── */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.28s', marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Live Monitoring CCTV Keseluruhan</div>
              <div className="card-subtitle">Menampilkan {CCTV_LIST.length} titik pemantauan</div>
            </div>
            <span className="badge badge-success"><span className="badge-dot" /> Streaming</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {CCTV_LIST.map((cam, idx) => <CctvCam key={idx} cam={cam} />)}
          </div>
        </div>

        {/* ── 3. Live Logs: Transaksi & Alerts ──────────────────── */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          
          {/* List Transaksi User */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.32s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Aktivitas Transaksi</div>
                <div className="card-subtitle">Log aktivitas per menit</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4072af', display: 'inline-block', animation: 'pulse-ring 1s infinite' }} />
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 5 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Waktu</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>Log Aktivitas</th>
                    <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTrx.map((item, index) => (
                    <tr key={index} style={{ borderBottom: index < liveTrx.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '12px 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.time}</td>
                      <td style={{ padding: '12px 0', fontSize: 12, color: '#334155' }}>
                        <span style={{ fontWeight: 600 }}>{item.email}</span> melakukan transaksi
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* List Alert Error */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Alert Error</div>
                <div className="card-subtitle">Log anomali dan error per menit</div>
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
                       <td style={{ padding: '12px 0', fontSize: 12, color: a.type === 'danger' ? '#646464' : '#646464'}}>
                          <span style={{display: 'block', fontWeight: 'bold'}}>{a.title}</span>
                          <span style={{fontSize: 11}}>{a.desc}</span>
                       </td>
                       <td style={{ padding: '12px 0', textAlign: 'right' }}>{getAlertBadge(a.type)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 4. Visualisasi Data: Tabel Pembelian & Pie Chart ──── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20, marginBottom: 20 }}>
          
          {/* Tabel Pembelian Tiket */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="card-title">Pembelian Tiket per Wisata</div>
                <div className="card-subtitle">Penjualan bertambah per menit</div>
              </div>
              <select 
                value={sortMethod} 
                onChange={(e) => setSortMethod(e.target.value)}
                style={{ 
                  padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', 
                  fontSize: 12, outline: 'none', background: '#f8fafc', color: '#475569', cursor: 'pointer'
                }}
              >
                <option value="terbanyak">Terbanyak</option>
                <option value="az">A - Z</option>
              </select>
            </div>
            
            <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 10, paddingRight: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 600, position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>Rank</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600, position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>Destinasi Wisata</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600, position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>Terjual</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600, position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid var(--card-border)' }}>Indikator Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTickets.map((item) => (
                    <tr key={item.wisata} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 700, color: item.rank <= 3 ? '#4072af' : '#94a3b8' }}>
                        #{item.rank}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 500, color: '#334155' }}>
                        {item.wisata}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 600, color: '#4072af', fontFamily: 'monospace' }}>
                        {item.terjual.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', width: '35%' }}>
                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${(item.terjual / maxSales) * 100}%`, 
                              background: item.rank <= 3 ? '#4072af' : '#cbd5e1', 
                              borderRadius: 4, 
                              transition: 'width 0.4s ease' 
                            }} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card animate-fade-up" style={{ animationDelay: '0.44s' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Distribusi Transaksi</div>
              </div>
            </div>
            <div style={{ height: 280, marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="40%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" animationDuration={500}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ── 5. Trending Lists ─────────────────────────────────── */}
        <div className="grid-2">
          <div className="card animate-fade-up" style={{ animationDelay: '0.48s' }}>
            <div className="card-header">
              <div className="card-title">Trending Topik Utama</div>
              <span className="badge badge-neutral">By Search</span>
            </div>
            {TRENDING_TOPIC.map((t) => (
              <div key={t.rank} className="trending-item" style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: t.rank <= 3 ? '#4072af' : '#e2e8f0', color: t.rank <= 3 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', marginRight: 12 }}>
                  {t.rank}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.topic}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.count.toLocaleString()}x</div>
              </div>
            ))}
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.52s' }}>
            <div className="card-header">
              <div className="card-title">Trending Lokasi Destinasi</div>
              <span className="badge badge-info">By Search</span>
            </div>
            {TRENDING_LOCATION.map((t) => (
              <div key={t.rank} className="trending-item" style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: t.rank <= 3 ? '#22c55e' : '#e2e8f0', color: t.rank <= 3 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', marginRight: 12 }}>
                  {t.rank}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.topic}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.count.toLocaleString()}x</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}