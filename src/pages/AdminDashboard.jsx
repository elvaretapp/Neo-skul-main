import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CRUDModal from '../components/CRUDModal'
import ReportsModal from '../components/ReportsModal'
import '../styles/AdminDashboard.css'

function AdminDashboard({ setIsLoggedIn }) {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard')

    // CRUD Modal States
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [modalType, setModalType] = useState('user')
    const [modalSubType, setModalSubType] = useState('product')
    const [selectedData, setSelectedData] = useState(null)

    // Reports Modal State
    const [showReportsModal, setShowReportsModal] = useState(false)

    // Data States
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [mentorApplications, setMentorApplications] = useState([])
    const [rejectReasonMap, setRejectReasonMap] = useState({})
    const [transactions, setTransactions] = useState([])

    const totalUsers = users.length
    const activeMentors = users.filter(u => u.role === 'mentor').length
    const pendingMentors = mentorApplications.length
    const totalRevenue = transactions
        .filter(t => t.status === 'approved' || t.status === 'success')
        .reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
    const totalEstKursus = courses.reduce((sum, c) => sum + parseFloat(c.price || 0), 0)

    const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/admin_transactions.php')
            const data = await res.json()
            setTransactions(data)
        } catch (error) { console.error("Gagal load transaksi", error) }
    }

    const handleUpdateStatus = async (id, newStatus) => {
        if (!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return
        try {
            const res = await fetch('/api/admin_transactions.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction_id: id, status: newStatus })
            })
            const result = await res.json()
            if (result.success) { alert("Status diperbarui!"); fetchTransactions() }
        } catch (error) { console.error(error) }
    }

    useEffect(() => {
        fetchTransactions()
        const fetchData = async () => {
            setIsLoading(true)
            const safeFetch = async (url) => {
                try {
                    const res = await fetch(url)
                    if (!res.ok) return []
                    const text = await res.text()
                    try {
                        const json = JSON.parse(text)
                        if (json.message && !Array.isArray(json)) return []
                        return Array.isArray(json) ? json : []
                    } catch (e) { return [] }
                } catch (error) { return [] }
            }
            const [usersData, coursesData, appsData] = await Promise.all([
                safeFetch(`/api/users.php?t=${Date.now()}`),
                safeFetch(`/api/courses.php?t=${Date.now()}`),
                safeFetch(`/api/mentor_applications.php?t=${Date.now()}`)
            ])
            setUsers(usersData)
            setCourses(coursesData)
            setMentorApplications(appsData)
            const stored = localStorage.getItem('username') || localStorage.getItem('userName') || 'Admin'
            setUsername(stored)
            setIsLoading(false)
        }
        fetchData()
    }, [])

    // Handlers
    const handleCreateUser = () => { setModalMode('create'); setModalType('user'); setModalSubType('user'); setSelectedData(null); setShowModal(true) }
    const handleEditUser = (user) => { setModalMode('edit'); setModalType('user'); setModalSubType('user'); setSelectedData(user); setShowModal(true) }
    const handleDeleteUser = (user) => { setModalMode('delete'); setModalType('user'); setModalSubType('user'); setSelectedData(user); setShowModal(true) }
    const handleCreateProduct = () => { setModalMode('create'); setModalType('course'); setModalSubType('product'); setSelectedData(null); setShowModal(true) }
    const handleEditProduct = (item) => { setModalMode('edit'); setModalType('course'); setModalSubType('product'); setSelectedData(item); setShowModal(true) }
    const handleDeleteProduct = (item) => { setModalMode('delete'); setModalType('course'); setModalSubType('product'); setSelectedData(item); setShowModal(true) }
    const handleDeleteCourse = (course) => { setModalMode('delete'); setModalType('course'); setModalSubType('course'); setSelectedData(course); setShowModal(true) }

    const handleApplicationStatus = async (id, status) => {
        const actionText = status === 'approved' ? 'menyetujui' : 'menolak'
        if (status === 'rejected' && !rejectReasonMap[id]?.trim()) {
            alert('Harap isi alasan penolakan terlebih dahulu!')
            return
        }
        if (!confirm(`Yakin ingin ${actionText} aplikasi ini?`)) return
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('status', status)
            if (status === 'rejected') formData.append('reject_reason', rejectReasonMap[id])
            const res = await fetch('/api/mentor_applications.php', { method: 'POST', body: formData })
            const result = await res.json()
            if (result.success || result.message) {
                alert(status === 'approved' ? 'Mentor berhasil disetujui!' : 'Aplikasi ditolak.')
                const appsData = await fetch(`/api/mentor_applications.php?t=${Date.now()}`).then(r => r.json()).catch(() => [])
                setMentorApplications(Array.isArray(appsData) ? appsData : [])
            }
        } catch (error) { alert('Terjadi kesalahan koneksi.') }
    }

    const handleSave = async (data) => {
        try {
            let endpoint = modalType === 'user' ? 'users' : 'courses'
            let url = `/api/${endpoint}.php`
            let options = {}
            if (modalType === 'course') {
                if (modalMode === 'delete') {
                    url += `?id=${data.id}`
                    options = { method: 'DELETE' }
                } else {
                    const formData = new FormData()
                    if (data.id) formData.append('id', data.id)
                    formData.append('title', data.title || '')
                    formData.append('description', data.description || '')
                    formData.append('price', data.price || 0)
                    formData.append('type', data.type || 'ebook')
                    formData.append('drive_link', data.drive_link || '')
                    formData.append('wa_group', data.wa_group || '')
                    formData.append('wa_mentor', data.wa_mentor || '')
                    formData.append('mentor_id', '')
                    if (data.image instanceof File) formData.append('image', data.image)
                    options = { method: 'POST', body: formData }
                }
            } else {
                if (modalMode === 'delete') {
                    url += `?id=${data.id}`
                    options = { method: 'DELETE' }
                } else {
                    options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
                }
            }
            const response = await fetch(url, options)
            const responseText = await response.text()
            let result
            try { result = JSON.parse(responseText) } catch (e) { result = { message: responseText } }
            if (response.ok) {
                alert(result.message || 'Berhasil!')
                const [usersData, coursesData] = await Promise.all([
                    fetch(`/api/users.php?t=${Date.now()}`).then(r => r.json()).catch(() => []),
                    fetch(`/api/courses.php?t=${Date.now()}`).then(r => r.json()).catch(() => [])
                ])
                setUsers(Array.isArray(usersData) ? usersData : [])
                setCourses(Array.isArray(coursesData) ? coursesData : [])
            } else {
                alert('Gagal: ' + (result.message || 'Unknown error'))
            }
        } catch (error) { alert('Terjadi kesalahan koneksi server.') }
    }

    const handleLogout = () => {
        localStorage.clear()
        if (setIsLoggedIn) setIsLoggedIn(false)
        navigate('/login')
    }

    if (isLoading) return (
        <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px',background:'#f4f6fb'}}>
            <div className="spinner"></div>
            <p style={{color:'#718096',fontFamily:'sans-serif'}}>Memuat Dashboard...</p>
        </div>
    )

    const navItems = [
        { id: 'dashboard', icon: 'fa-home', label: 'Dashboard' },
        { id: 'transactions', icon: 'fa-money-check-alt', label: 'Transaksi', badge: transactions.filter(t=>t.status==='pending').length },
        { id: 'users', icon: 'fa-users', label: 'Manajemen User' },
        { id: 'applications', icon: 'fa-envelope-open-text', label: 'Aplikasi Mentor', badge: pendingMentors },
        { id: 'products', icon: 'fa-box-open', label: 'Produk Pembelajaran' },
        { id: 'courses', icon: 'fa-chalkboard-teacher', label: 'Kursus Mentor' },
    ]

    return (
        <div className="admin-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        <span className="logo-neo">Neo</span><span className="logo-scholar"> Scholar</span>
                    </div>
                    <span className="badge-admin-role">ADMIN</span>
                </div>

                <div className="admin-sidebar-profile">
                    <div className="admin-avatar-circle">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <div>
                        <p className="admin-name">{username}</p>
                        <p className="admin-role-label">Administrator</p>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                        </button>
                    ))}
                    
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                {/* Top bar */}
                <div className="admin-topbar">
                    <div>
                        <h1 className="admin-page-title">
                            {navItems.find(n=>n.id===activeTab)?.label || 'Dashboard'}
                        </h1>
                        <p className="admin-page-sub">NeoScholar Admin Panel</p>
                    </div>
                    <div className="admin-topbar-right">
                        <div className="admin-stats-mini">
                            <span><i className="fas fa-users"></i> {totalUsers} Users</span>
                            <span><i className="fas fa-chalkboard-teacher"></i> {activeMentors} Mentor</span>
                        </div>
                    </div>
                </div>

                {/* ===== DASHBOARD ===== */}
                {activeTab === 'dashboard' && (
                    <div className="admin-tab-content">
                        <div className="admin-stats-grid">
                            {[
                                { icon:'fa-users', val: totalUsers, label:'Total Users', color:'blue' },
                                { icon:'fa-chalkboard-teacher', val: activeMentors, label:'Active Mentors', color:'green' },
                                { icon:'fa-file-signature', val: pendingMentors, label:'Pending Mentors', color:'amber' },
                                { icon:'fa-dollar-sign', val: formatRupiah(totalRevenue), label:'Total Revenue', color:'violet' },
                                { icon:'fa-book', val: formatRupiah(totalEstKursus), label:'Est. Nilai Kursus', color:'blue' },
                            ].map((s,i) => (
                                <div key={i} className={`admin-stat-card ${s.color}`}>
                                    <div className="admin-stat-icon"><i className={`fas ${s.icon}`}></i></div>
                                    <div className="admin-stat-info">
                                        <h3>{s.val}</h3>
                                        <p>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="admin-quick-actions">
                            <h2 className="admin-section-title">Quick Actions</h2>
                            <div className="quick-grid">
                                {[
                                    { icon:'fa-user-plus', label:'Tambah User', desc:'Buat akun baru', action: handleCreateUser },
                                    { icon:'fa-box-open', label:'Tambah Produk', desc:'Produk pembelajaran baru', action: handleCreateProduct },
                                    { icon:'fa-envelope-open-text', label:'Aplikasi Mentor', desc:`${pendingMentors} menunggu review`, action: () => setActiveTab('applications') },
                                   
                                ].map((q,i) => (
                                    <div key={i} className="quick-card" onClick={q.action}>
                                        <div className="quick-icon"><i className={`fas ${q.icon}`}></i></div>
                                        <h4>{q.label}</h4>
                                        <p>{q.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-two-col">
                            <div className="admin-card">
                                <div className="admin-card-head">
                                    <h3><i className="fas fa-clock"></i> Transaksi Terbaru</h3>
                                    <button className="btn-link" onClick={() => setActiveTab('transactions')}>Lihat Semua →</button>
                                </div>
                                {transactions.slice(0,4).map(trx => (
                                    <div key={trx.id} className="mini-row">
                                        <div>
                                            <p className="mini-title">{trx.username}</p>
                                            <p className="mini-sub">{trx.course_names || 'Pembelian'}</p>
                                        </div>
                                        <div style={{textAlign:'right'}}>
                                            <p className="mini-price">Rp {parseFloat(trx.total_amount).toLocaleString('id-ID')}</p>
                                            <span className={`status-badge ${trx.status}`}>{trx.status}</span>
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && <p className="empty-msg">Belum ada transaksi.</p>}
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-head">
                                    <h3><i className="fas fa-envelope-open-text"></i> Aplikasi Terbaru</h3>
                                    <button className="btn-link" onClick={() => setActiveTab('applications')}>Lihat Semua →</button>
                                </div>
                                {mentorApplications.slice(0,4).map(app => (
                                    <div key={app.id} className="mini-row">
                                        <div>
                                            <p className="mini-title">{app.name}</p>
                                            <p className="mini-sub">{app.expertise}</p>
                                        </div>
                                        <span className="status-badge pending">pending</span>
                                    </div>
                                ))}
                                {mentorApplications.length === 0 && <p className="empty-msg">Tidak ada aplikasi baru.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== TRANSAKSI ===== */}
                {activeTab === 'transactions' && (
                    <div className="admin-tab-content">
                        <div className="admin-card">
                            <div className="admin-card-head">
                                <h3><i className="fas fa-money-check-alt"></i> Konfirmasi Pembayaran</h3>
                                <span className="count-badge">{transactions.length} transaksi</span>
                            </div>
                            {transactions.length === 0 ? (
                                <p className="empty-msg">Belum ada transaksi.</p>
                            ) : (
                                <div className="table-wrap">
                                    <table className="data-table applications-table">
                                        <thead>
                                            <tr><th>User</th><th>Item</th><th>Total</th><th>Bukti</th><th>Status</th><th>Aksi</th></tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(trx => (
                                                <tr key={trx.id}>
                                                    <td><strong>{trx.username}</strong><br/><small>{trx.email}</small></td>
                                                    <td><div style={{maxWidth:'200px',fontSize:'0.9rem'}}>{trx.course_names || 'Pembelian Paket'}</div></td>
                                                    <td style={{fontWeight:'700',color:'#1a237e'}}>Rp {parseFloat(trx.total_amount).toLocaleString('id-ID')}</td>
                                                    <td>
                                                        {trx.proof_image ? (
                                                            <a href={trx.proof_image} target="_blank" rel="noreferrer">
                                                                <img src={trx.proof_image} alt="Bukti" className="proof-thumb"/>
                                                            </a>
                                                        ) : <span style={{color:'#94a3b8',fontSize:'0.82rem'}}>Tidak ada</span>}
                                                    </td>
                                                    <td><span className={`status-badge ${trx.status}`}>{trx.status}</span></td>
                                                    <td>
                                                        {trx.status === 'pending' && (
                                                            <div className="action-buttons">
                                                                <button className="btn-action btn-approve" onClick={() => handleUpdateStatus(trx.id,'approved')}><i className="fas fa-check"></i> Approve</button>
                                                                <button className="btn-action btn-reject" onClick={() => handleUpdateStatus(trx.id,'rejected')}><i className="fas fa-times"></i> Tolak</button>
                                                            </div>
                                                        )}
                                                        {trx.status !== 'pending' && <span style={{color:'#94a3b8',fontSize:'0.85rem'}}>Selesai</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== USERS ===== */}
                {activeTab === 'users' && (
                    <div className="admin-tab-content">
                        <div className="admin-card">
                            <div className="admin-card-head">
                                <h3><i className="fas fa-users"></i> Manajemen User</h3>
                                <button className="btn-sm btn-success" onClick={handleCreateUser}><i className="fas fa-plus"></i> Tambah User</button>
                            </div>
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td><strong>{user.username || user.name}</strong></td>
                                                <td>{user.email}</td>
                                                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                                                <td><span className={user.status === 'active' ? 'status-active' : 'status-inactive'}>{user.status || 'active'}</span></td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-sm" onClick={() => handleEditUser(user)}>Edit</button>
                                                        <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(user)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== APLIKASI MENTOR ===== */}
                {activeTab === 'applications' && (
                    <div className="admin-tab-content">
                        <div className="admin-card">
                            <div className="admin-card-head">
                                <h3><i className="fas fa-envelope-open-text"></i> Aplikasi Mentor</h3>
                                <span className="count-badge">{mentorApplications.length} pending</span>
                            </div>
                            {mentorApplications.length === 0 ? (
                                <p className="empty-msg">Tidak ada pengajuan mentor baru.</p>
                            ) : (
                                <div className="table-wrap">
                                    <table className="data-table applications-table">
                                        <thead>
                                            <tr><th>Pemohon</th><th>Keahlian</th><th>Pengalaman</th><th>Sosmed & CV</th><th>Alasan</th><th>Tanggal</th><th>Aksi</th></tr>
                                        </thead>
                                        <tbody>
                                            {mentorApplications.map(app => (
                                                <tr key={app.id}>
                                                    <td><strong>{app.name}</strong><br/><small>{app.email}</small><br/><small>📱 {app.phone}</small></td>
                                                    <td>{app.expertise}</td>
                                                    <td style={{textAlign:'center'}}>{app.experience == 0 ? 'Belum ada' : `${app.experience} thn`}</td>
                                                    <td>
                                                        <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                                                            {app.cv_link && <a href={app.cv_link} target="_blank" rel="noreferrer" style={{fontSize:'0.82rem',color:'#2563eb'}}><i className="fab fa-google-drive"></i> Lihat CV</a>}
                                                            {app.instagram && <span style={{fontSize:'0.82rem',color:'#64748b'}}><i className="fab fa-instagram"></i> {app.instagram}</span>}
                                                            {app.linkedin && <a href={app.linkedin} target="_blank" rel="noreferrer" style={{fontSize:'0.82rem',color:'#0077b5'}}><i className="fab fa-linkedin"></i> LinkedIn</a>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div title={app.reason} style={{
                                                            fontSize:'0.83rem', color:'#374151',
                                                            display:'-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient:'vertical',
                                                            overflow:'hidden',
                                                            lineHeight:'1.5',
                                                            cursor:'help'
                                                        }}>
                                                            {app.reason}
                                                        </div>
                                                    </td>
                                                    <td style={{whiteSpace:'nowrap'}}>{new Date(app.created_at).toLocaleDateString('id-ID')}</td>
                                                    <td>
                                                        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                                                            <button className="btn-sm btn-success" onClick={() => handleApplicationStatus(app.id,'approved')}><i className="fas fa-check"></i> Approve</button>
                                                            <textarea
                                                                placeholder="Alasan penolakan..."
                                                                value={rejectReasonMap[app.id] || ''}
                                                                onChange={(e) => setRejectReasonMap(prev => ({...prev,[app.id]:e.target.value}))}
                                                                rows="2"
                                                                style={{fontSize:'0.76rem',padding:'5px 8px',borderRadius:'6px',border:'1px solid #e2e8f0',resize:'none',fontFamily:'inherit',width:'100%',boxSizing:'border-box'}}
                                                            />
                                                            <button className="btn-sm btn-danger" onClick={() => handleApplicationStatus(app.id,'rejected')}><i className="fas fa-times"></i> Reject</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== PRODUK PEMBELAJARAN ===== */}
                {activeTab === 'products' && (
                    <div className="admin-tab-content">
                        <div className="admin-card">
                            <div className="admin-card-head">
                                <h3><i className="fas fa-box-open"></i> Produk Pembelajaran</h3>
                                <button className="btn-sm btn-success" onClick={handleCreateProduct}><i className="fas fa-plus"></i> Tambah Produk</button>
                            </div>
                            <div className="courses-list">
                                {courses.filter(c => c.type !== 'course').length === 0 ? (
                                    <p className="empty-msg">Belum ada produk.</p>
                                ) : courses.filter(c => c.type !== 'course').map(item => (
                                    <div key={item.id} className="course-item">
                                        <img
                                            src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${item.image}`}
                                            alt={item.title}
                                            onError={e => { e.target.onerror=null; e.target.src='https://via.placeholder.com/80?text=No+Img' }}
                                            style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'10px',border:'1px solid #e2e8f0',flexShrink:0}}
                                        />
                                        <div className="course-info" style={{flex:1}}>
                                            <h3>{item.title}</h3>
                                            <p className="course-stats">
                                                <strong>{formatRupiah(item.price)}</strong>
                                                <span style={{fontSize:'0.78rem',color:'#6d28d9',background:'#ede9fe',padding:'2px 8px',borderRadius:'10px',textTransform:'uppercase',fontWeight:'700'}}>{item.type}</span>
                                            </p>
                                            {item.drive_link && (
                                                <a href={item.drive_link} target="_blank" rel="noreferrer" style={{fontSize:'0.78rem',color:'#4285f4',display:'inline-flex',alignItems:'center',gap:'4px'}}>
                                                    <i className="fab fa-google-drive"></i> Lihat Drive
                                                </a>
                                            )}
                                            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                                                <button className="btn-sm" onClick={() => handleEditProduct(item)}>Edit</button>
                                                <button className="btn-sm btn-danger" onClick={() => handleDeleteProduct(item)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== KURSUS MENTOR ===== */}
                {activeTab === 'courses' && (
                    <div className="admin-tab-content">
                        <div className="admin-card">
                            <div className="admin-card-head">
                                <h3><i className="fas fa-chalkboard-teacher"></i> Kursus Mentor</h3>
                                <span className="count-badge">{courses.filter(c=>c.type==='course').length} kursus</span>
                            </div>
                            <div className="courses-list">
                                {courses.filter(c => c.type === 'course').length === 0 ? (
                                    <p className="empty-msg">Belum ada kursus dari mentor.</p>
                                ) : courses.filter(c => c.type === 'course').map(course => (
                                    <div key={course.id} className="course-item">
                                        <img
                                            src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${course.image}`}
                                            alt={course.title}
                                            onError={e => { e.target.onerror=null; e.target.src='https://via.placeholder.com/80?text=No+Img' }}
                                            style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'10px',border:'1px solid #e2e8f0',flexShrink:0}}
                                        />
                                        <div className="course-info" style={{flex:1}}>
                                            <h3>{course.title}</h3>
                                            <p style={{fontSize:'0.82rem',color:'#2563eb',margin:'2px 0',display:'flex',alignItems:'center',gap:'5px'}}>
                                                <i className="fas fa-user-tie"></i> {course.mentor_name || 'Mentor'}
                                            </p>
                                            <p className="course-stats">
                                                <strong>{formatRupiah(course.price)}</strong>
                                                <span style={{fontSize:'0.78rem',color:'#1d4ed8',background:'#dbeafe',padding:'2px 8px',borderRadius:'10px',fontWeight:'700'}}>KURSUS</span>
                                            </p>
                                            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                                                <button className="btn-sm btn-danger" onClick={() => handleDeleteCourse(course)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <CRUDModal isOpen={showModal} onClose={() => setShowModal(false)} mode={modalMode} type={modalType} subType={modalSubType} data={selectedData} onSave={handleSave} />
            <ReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} />
        </div>
    )
}

export default AdminDashboard
