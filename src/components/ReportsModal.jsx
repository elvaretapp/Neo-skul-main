import { useState, useEffect } from 'react'
import '../styles/ReportsModal.css'

function ReportsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isOpen) return
        setLoading(true)
        fetch(`/api/reports.php?t=${Date.now()}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [isOpen])

    if (!isOpen) return null

    const fmt = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n || 0))
    const fmtRp = (n) => {
        const num = n || 0
        if (num >= 1000000000) return `Rp ${(num/1000000000).toFixed(1)}M`
        if (num >= 1000000) return `Rp ${(num/1000000).toFixed(1)}Jt`
        if (num >= 1000) return `Rp ${(num/1000).toFixed(0)}K`
        return `Rp ${fmt(num)}`
    }
    const pctChange = (curr, prev) => {
        if (!prev || prev === 0) return null
        const pct = ((curr - prev) / prev * 100).toFixed(0)
        return pct > 0 ? `+${pct}%` : `${pct}%`
    }
    const maxRev = data?.monthly_revenue?.length
        ? Math.max(...data.monthly_revenue.map(m => parseFloat(m.revenue) || 0), 1)
        : 1

    return (
        <div className="reports-modal-overlay" onClick={onClose}>
            <div className="reports-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="reports-modal-header">
                    <div>
                        <h2><i className="fas fa-chart-line"></i> Analytics & Reports</h2>
                        <p>Data real-time dari platform NeoScholar</p>
                    </div>
                    <button className="reports-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>

                <div className="reports-tabs">
                    {[['overview','chart-pie','Overview'],['revenue','wallet','Revenue'],['users','users','Users'],['performance','trophy','Performance']].map(([tab,icon,label]) => (
                        <button key={tab} className={`reports-tab ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
                            <i className={`fas fa-${icon}`}></i> {label}
                        </button>
                    ))}
                </div>

                <div className="reports-modal-body">
                    {loading ? (
                        <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>
                            <i className="fas fa-spinner fa-spin" style={{fontSize:'2rem',marginBottom:'12px',display:'block'}}></i>
                            Memuat data...
                        </div>
                    ) : !data ? (
                        <p style={{textAlign:'center',color:'#ef4444',padding:'40px'}}>Gagal memuat data.</p>
                    ) : <>

                    {activeTab === 'overview' && (
                        <div className="reports-section">
                            <h3>Platform Overview</h3>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-icon blue"><i className="fas fa-users"></i></div>
                                    <div className="metric-info">
                                        <h4>Total Users</h4>
                                        <p className="metric-value">{fmt(data.total_users)}</p>
                                        <span className="metric-change positive">+{fmt(data.new_users_this_month)} bulan ini</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon green"><i className="fas fa-wallet"></i></div>
                                    <div className="metric-info">
                                        <h4>Total Revenue</h4>
                                        <p className="metric-value">{fmtRp(data.total_revenue)}</p>
                                        {pctChange(data.revenue_this_month, data.revenue_last_month) && (
                                            <span className={`metric-change ${data.revenue_this_month>=data.revenue_last_month?'positive':'negative'}`}>
                                                {pctChange(data.revenue_this_month, data.revenue_last_month)} vs bulan lalu
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon purple"><i className="fas fa-chalkboard-teacher"></i></div>
                                    <div className="metric-info">
                                        <h4>Kursus Mentor</h4>
                                        <p className="metric-value">{fmt(data.total_courses)}</p>
                                        <span className="metric-change positive">{fmt(data.total_products)} produk admin</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon orange"><i className="fas fa-check-circle"></i></div>
                                    <div className="metric-info">
                                        <h4>Transaksi Berhasil</h4>
                                        <p className="metric-value">{fmt(data.success_transactions)}</p>
                                        <span className="metric-change" style={{color:'#f59e0b'}}>{fmt(data.pending_transactions)} pending</span>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-container">
                                <h4>Revenue 6 Bulan Terakhir</h4>
                                {!data.monthly_revenue?.length ? (
                                    <p style={{color:'#94a3b8',textAlign:'center',padding:'20px',fontStyle:'italic'}}>Belum ada data transaksi.</p>
                                ) : (
                                    <div className="bar-chart">
                                        {data.monthly_revenue.map((m,i) => (
                                            <div key={i} className="bar-item">
                                                <div className="bar-wrapper">
                                                    <div className="bar" style={{height:`${(parseFloat(m.revenue)/maxRev)*100}%`}}>
                                                        <span className="bar-value">{fmtRp(m.revenue)}</span>
                                                    </div>
                                                </div>
                                                <span className="bar-label">{m.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="reports-section">
                            <h3>Revenue Analytics</h3>
                            <div className="revenue-summary">
                                <div className="revenue-card">
                                    <h4>Bulan Ini</h4>
                                    <p className="revenue-amount">{fmtRp(data.revenue_this_month)}</p>
                                    <span className={`revenue-trend ${data.revenue_this_month>=data.revenue_last_month?'up':'down'}`}>
                                        {data.revenue_this_month>=data.revenue_last_month?'↑':'↓'} {pctChange(data.revenue_this_month,data.revenue_last_month)||'—'} vs bulan lalu
                                    </span>
                                </div>
                                <div className="revenue-card">
                                    <h4>Total Keseluruhan</h4>
                                    <p className="revenue-amount">{fmtRp(data.total_revenue)}</p>
                                    <span className="revenue-trend up">Semua waktu</span>
                                </div>
                                <div className="revenue-card">
                                    <h4>Rata-rata / Transaksi</h4>
                                    <p className="revenue-amount">{data.success_transactions>0 ? fmtRp(data.total_revenue/data.success_transactions) : 'Rp 0'}</p>
                                    <span className="revenue-trend up">{fmt(data.success_transactions)} transaksi</span>
                                </div>
                            </div>
                            <div className="chart-container">
                                <h4>Tren Revenue Bulanan</h4>
                                {!data.monthly_revenue?.length ? (
                                    <p style={{color:'#94a3b8',textAlign:'center',padding:'20px',fontStyle:'italic'}}>Belum ada data.</p>
                                ) : (
                                    <div className="bar-chart">
                                        {data.monthly_revenue.map((m,i) => (
                                            <div key={i} className="bar-item">
                                                <div className="bar-wrapper">
                                                    <div className="bar" style={{height:`${(parseFloat(m.revenue)/maxRev)*100}%`,background:'linear-gradient(180deg,#10b981,#059669)'}}>
                                                        <span className="bar-value">{fmtRp(m.revenue)}</span>
                                                    </div>
                                                </div>
                                                <span className="bar-label">{m.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="reports-section">
                            <h3>User Analytics</h3>
                            <div className="user-stats">
                                {[
                                    {icon:'user-graduate',color:'#2563eb',label:'Siswa / Client',val:data.total_clients},
                                    {icon:'chalkboard-teacher',color:'#7c3aed',label:'Mentor',val:data.total_mentors},
                                    {icon:'user-shield',color:'#dc2626',label:'Admin',val:data.total_admins},
                                    {icon:'user-plus',color:'#059669',label:'Baru Bulan Ini',val:data.new_users_this_month},
                                ].map(({icon,color,label,val}) => (
                                    <div key={label} className="stat-item">
                                        <i className={`fas fa-${icon}`} style={{color}}></i>
                                        <div>
                                            <h4>{label}</h4>
                                            <p>{fmt(val)} <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>
                                                {label!=='Baru Bulan Ini' && data.total_users>0 ? `(${Math.round(val/data.total_users*100)}%)` : ''}
                                            </span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="top-list">
                                <h4>Top Mentor (by Siswa)</h4>
                                {!data.top_mentors?.length ? (
                                    <p style={{color:'#94a3b8',fontStyle:'italic',padding:'16px 0'}}>Belum ada data mentor aktif mengajar.</p>
                                ) : (
                                    <table className="reports-table">
                                        <thead><tr><th>#</th><th>Nama</th><th>Kursus</th><th>Siswa</th><th>Revenue</th></tr></thead>
                                        <tbody>
                                            {data.top_mentors.map((m,i) => (
                                                <tr key={i}>
                                                    <td><span style={{background:'#dbeafe',color:'#1d4ed8',borderRadius:'50%',width:'24px',height:'24px',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'0.8rem'}}>{i+1}</span></td>
                                                    <td><strong>{m.name}</strong></td>
                                                    <td>{m.courses}</td>
                                                    <td>{m.students}</td>
                                                    <td style={{color:'#059669',fontWeight:'600'}}>{fmtRp(m.revenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="reports-section">
                            <h3>Performance Metrics</h3>
                            <div className="top-list">
                                <h4>Top Kursus & Produk (by Pembeli)</h4>
                                {!data.top_courses?.length ? (
                                    <p style={{color:'#94a3b8',fontStyle:'italic',padding:'16px 0'}}>Belum ada transaksi berhasil.</p>
                                ) : (
                                    <table className="reports-table">
                                        <thead><tr><th>#</th><th>Judul</th><th>Tipe</th><th>Pembeli</th><th>Revenue</th></tr></thead>
                                        <tbody>
                                            {data.top_courses.map((c,i) => (
                                                <tr key={i}>
                                                    <td><span style={{background:'#fef9c3',color:'#92400e',borderRadius:'50%',width:'24px',height:'24px',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'0.8rem'}}>{i+1}</span></td>
                                                    <td><strong>{c.title}</strong></td>
                                                    <td><span style={{fontSize:'0.75rem',background:c.type==='course'?'#dbeafe':'#ede9fe',color:c.type==='course'?'#1d4ed8':'#6d28d9',padding:'2px 8px',borderRadius:'10px',textTransform:'uppercase',fontWeight:'600'}}>{c.type}</span></td>
                                                    <td>{c.students}</td>
                                                    <td style={{color:'#059669',fontWeight:'600'}}>{fmtRp(c.revenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="performance-indicators" style={{marginTop:'24px'}}>
                                <div className="indicator">
                                    <h4>Tingkat Keberhasilan Transaksi</h4>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{width:`${(data.success_transactions+data.pending_transactions)>0?Math.round(data.success_transactions/(data.success_transactions+data.pending_transactions)*100):0}%`}}>
                                            {(data.success_transactions+data.pending_transactions)>0?Math.round(data.success_transactions/(data.success_transactions+data.pending_transactions)*100):0}%
                                        </div>
                                    </div>
                                    <small style={{color:'#64748b'}}>{data.success_transactions} berhasil dari {data.success_transactions+data.pending_transactions} total</small>
                                </div>
                                <div className="indicator">
                                    <h4>Mentor Aktif Mengajar</h4>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{width:`${data.total_mentors>0?Math.min(Math.round((data.top_mentors?.length||0)/data.total_mentors*100),100):0}%`,background:'linear-gradient(90deg,#7c3aed,#a78bfa)'}}>
                                            {data.total_mentors>0?Math.min(Math.round((data.top_mentors?.length||0)/data.total_mentors*100),100):0}%
                                        </div>
                                    </div>
                                    <small style={{color:'#64748b'}}>{data.top_mentors?.length||0} dari {data.total_mentors} mentor</small>
                                </div>
                            </div>
                        </div>
                    )}
                    </>}
                </div>

                <div className="reports-modal-footer">
                    <button className="btn-close" onClick={onClose}>Tutup</button>
                </div>
            </div>
        </div>
    )
}

export default ReportsModal
