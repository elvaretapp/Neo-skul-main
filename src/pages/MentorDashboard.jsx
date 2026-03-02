import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CRUDModal from '../components/CRUDModal'
import '../styles/MentorDashboard.css'

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

function MentorDashboard() {
    const navigate = useNavigate()
    const [mentorName, setMentorName] = useState('')
    const [mentorId, setMentorId] = useState(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isLoading, setIsLoading] = useState(true)

    // Data State
    const [stats, setStats] = useState({ total_courses: 0, total_students: 0, total_revenue: 0 })
    const [courses, setCourses] = useState([])
    const [profileData, setProfileData] = useState({
        id: '', username: '', email: '', specialization: '', bio: '',
        avatar: '', rating: 0, created_at: '', category: '',
        is_active: 1, schedule: {}, price_per_session: 0,
        cv_link: '', phone: ''
    })

    // Upload State
    const [avatarFile, setAvatarFile] = useState(null)
    const [previewAvatar, setPreviewAvatar] = useState(null)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [selectedCourse, setSelectedCourse] = useState(null)

    useEffect(() => {
        const checkSession = async () => {
            const userLoggedIn = localStorage.getItem('userLoggedIn')
            const userRole = localStorage.getItem('userRole')
            const storedId = localStorage.getItem('user_id')
            if (!userLoggedIn) {
                navigate('/login')
            } else if (userRole !== 'mentor') {
                alert('Akses Ditolak. Halaman ini khusus Mentor.')
                navigate('/dashboard')
            } else {
                setMentorId(storedId)
                await fetchData(storedId)
            }
        }
        checkSession()
    }, [navigate])

    const fetchData = async (id) => {
        try {
            setIsLoading(true)

            const statsRes = await fetch(`/api/mentor_stats.php?mentor_id=${id}&t=${Date.now()}`)
            const statsData = await statsRes.json()
            if (statsRes.ok) setStats(statsData)

            const userRes = await fetch(`/api/users.php?id=${id}&t=${Date.now()}`)
            const userData = await userRes.json()
            if (userData) {
                setMentorName(userData.username)
                let parsedSchedule = {}
                try {
                    parsedSchedule = userData.schedule ? JSON.parse(userData.schedule) : {}
                } catch (e) { parsedSchedule = {} }

                setProfileData({
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    specialization: userData.specialization || '',
                    bio: userData.bio || '',
                    avatar: userData.avatar || '',
                    rating: userData.rating || 0,
                    created_at: userData.created_at,
                    category: userData.category || '',
                    is_active: userData.is_active !== undefined ? parseInt(userData.is_active) : 1,
                    schedule: parsedSchedule,
                    price_per_session: userData.price_per_session || 0,
                    cv_link: userData.cv_link || '',
                    phone: userData.phone || ''
                })
            }

            const coursesRes = await fetch(`/api/courses.php?mentor_id=${id}&t=${Date.now()}`)
            const coursesData = await coursesRes.json()
            setCourses(Array.isArray(coursesData) ? coursesData : [])

        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number)
    }

    const handleProfileChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'avatar') {
            const file = files[0]
            setAvatarFile(file)
            setPreviewAvatar(URL.createObjectURL(file))
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }))
        }
    }

    // Toggle hari di jadwal
    const handleScheduleToggle = (hari) => {
        setProfileData(prev => {
            const newSchedule = { ...prev.schedule }
            if (newSchedule[hari]) {
                delete newSchedule[hari]
            } else {
                newSchedule[hari] = { mulai: '08:00', selesai: '10:00' }
            }
            return { ...prev, schedule: newSchedule }
        })
    }

    // Update jam pada hari tertentu
    const handleScheduleTime = (hari, field, value) => {
        setProfileData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [hari]: { ...prev.schedule[hari], [field]: value }
            }
        }))
    }

    // Toggle status aktif/nonaktif
    const handleToggleActive = async () => {
        const newStatus = profileData.is_active === 1 ? 0 : 1
        try {
            const formData = new FormData()
            formData.append('action', 'toggle_active')
            formData.append('id', mentorId)
            formData.append('is_active', newStatus)
            const res = await fetch('/api/users.php', { method: 'POST', body: formData })
            if (res.ok) {
                setProfileData(prev => ({ ...prev, is_active: newStatus }))
                alert(newStatus === 1 ? 'Status: Aktif - Anda sekarang menerima murid!' : 'Status: Nonaktif - Anda tidak menerima murid sementara.')
            }
        } catch (error) {
            alert('Gagal mengubah status')
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        try {
            const idToUse = profileData.id || mentorId || localStorage.getItem('user_id')
            if (!idToUse) {
                alert("Gagal: ID user tidak ditemukan. Coba logout dan login ulang.")
                return
            }

            const formData = new FormData()
            formData.append('action', 'update_profile')
            formData.append('id', idToUse)
            formData.append('username', profileData.username || '')
            formData.append('email', profileData.email || '')
            formData.append('specialization', profileData.specialization || '')
            formData.append('bio', profileData.bio || '')
            formData.append('category', profileData.category || '')
            formData.append('cv_link', profileData.cv_link || '')
            formData.append('phone', profileData.phone || '')
            if (avatarFile) formData.append('avatar', avatarFile)

            const res = await fetch('/api/users.php', { method: 'POST', body: formData })
            const text = await res.text()

            let result
            try { result = JSON.parse(text) } catch (e) { result = { message: text } }

            if (res.ok && !result.message?.toLowerCase().includes('error')) {
                alert("Profil berhasil diperbarui!")
                setAvatarFile(null)
                fetchData(idToUse)
            } else {
                alert("Gagal update profil: " + (result.message || 'Unknown error'))
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi: " + error.message)
        }
    }

    const handleCreate = () => { setModalMode('create'); setSelectedCourse(null); setShowModal(true) }
    const handleEdit = (course) => { setModalMode('edit'); setSelectedCourse(course); setShowModal(true) }
    const handleDelete = (course) => { setModalMode('delete'); setSelectedCourse(course); setShowModal(true) }

    const handleSaveCourse = async (data) => {
        try {
            const formData = new FormData()
            if (data.id) formData.append('id', data.id)
            formData.append('title', data.title)
            formData.append('description', data.description)
            formData.append('price', data.price)
            formData.append('type', 'course')
            formData.append('mentor_id', mentorId)
            formData.append('wa_group', data.wa_group || '')
            formData.append('wa_mentor', data.wa_mentor || '')
            // schedule_days menyimpan JSON jadwal per hari
            formData.append('schedule_days', data.schedule_days || '{}')
            if (data.image instanceof File) formData.append('image', data.image)

            if (modalMode === 'delete') {
                await fetch(`/api/courses.php?id=${data.id}`, { method: 'DELETE' })
            } else {
                await fetch('/api/courses.php', { method: 'POST', body: formData })
            }
            setShowModal(false)
            fetchData(mentorId)
        } catch (error) { alert("Gagal menyimpan data course.") }
    }

    const handleLogout = () => { localStorage.clear(); navigate('/login') }

    if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>

    return (
        <div className="mentor-layout">
            {/* SIDEBAR */}
            <aside className="mentor-sidebar">
                <div className="sidebar-header">
                    <h2>NeoScholar</h2>
                    <span className="badge-mentor">MENTOR</span>
                </div>

                {/* Status Toggle di Sidebar */}
                <div className="sidebar-status">
                    <span className="status-label">Status Anda</span>
                    <button
                        className={`status-toggle ${profileData.is_active === 1 ? 'active' : 'inactive'}`}
                        onClick={handleToggleActive}
                    >
                        <span className="status-dot"></span>
                        {profileData.is_active === 1 ? 'Aktif' : 'Nonaktif'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <i className="fas fa-home"></i> Dashboard
                    </button>
                    <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
                        <i className="fas fa-book-open"></i> Kelola Kursus
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <i className="fas fa-user-circle"></i> Edit Profil
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout"><i className="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="mentor-content">
                <header className="content-header" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="welcome-text">
                        <h1>Selamat Datang, {mentorName}! 👋</h1>
                        <p>Pantau performa dan kelola kelas Anda.</p>
                    </div>
                    <div className="header-avatar">
                        <img src={profileData.avatar ? `${profileData.avatar}?t=${Date.now()}` : 'https://via.placeholder.com/40'} alt="Avatar" />
                    </div>
                </header>

                {/* --- TAB: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                    <div className="tab-section">
                        <div className="dashboard-stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-icon"><i className="fas fa-book"></i></div>
                                <div className="stat-info"><h3>{stats.total_courses}</h3><p>Total Kursus</p></div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon"><i className="fas fa-users"></i></div>
                                <div className="stat-info"><h3>{stats.total_students}</h3><p>Total Siswa</p></div>
                            </div>
                            <div className="stat-card orange">
                                <div className="stat-icon"><i className="fas fa-wallet"></i></div>
                                <div className="stat-info"><h3>{formatRupiah(stats.total_revenue)}</h3><p>Total Pendapatan</p></div>
                            </div>
                        </div>

                      

                        <div className="section-title" style={{ marginTop: '30px' }}>
                            <h2>Kursus Terbaru Anda</h2>
                            <button className="btn-text" onClick={() => setActiveTab('courses')}>Lihat Semua →</button>
                        </div>
                        <div className="courses-grid">
                            {courses.slice(0, 3).map(course => (
                                <div key={course.id} className="course-card">
                                    <div className="card-img"><img src={course.image} alt={course.title} /></div>
                                    <div className="card-body">
                                        <h3>{course.title}</h3>
                                        <p className="price">{formatRupiah(course.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: COURSES --- */}
                {activeTab === 'courses' && (
                    <div className="tab-section">
                        <div className="section-title">
                            <h2>Daftar Kursus Saya</h2>
                            <button className="btn-primary" onClick={handleCreate}><i className="fas fa-plus"></i> Tambah Kursus</button>
                        </div>
                        <div className="courses-grid">
                            {courses.map(course => (
                                <div key={course.id} className="course-card">
                                    <div className="card-img">
                                        <img src={course.image} alt={course.title} />
                                        <span className="course-type">{course.type}</span>
                                    </div>
                                    <div className="card-body">
                                        <h3>{course.title}</h3>
                                        <p className="price">{formatRupiah(course.price)}</p>
                                        
                                        {/* Jadwal per hari */}
                                        {course.schedule_days && (() => {
                                            let sched = {}
                                            try { sched = JSON.parse(course.schedule_days) } catch(e) {}
                                            const days = Object.entries(sched)
                                            if (days.length === 0) return null
                                            return (
                                                <div style={{margin:'6px 0', background:'#dbeafe', borderRadius:'8px', padding:'7px 10px'}}>
                                                    <p style={{fontSize:'0.75rem', fontWeight:'700', color:'#1e40af', margin:'0 0 5px', display:'flex', alignItems:'center', gap:'5px'}}>
                                                        <i className="fas fa-calendar-check"></i> Jadwal
                                                    </p>
                                                    {days.map(([hari, jam]) => (
                                                        <div key={hari} style={{fontSize:'0.78rem', color:'#1e3a8a', display:'flex', justifyContent:'space-between', padding:'2px 0', borderBottom:'1px dashed #bfdbfe'}}>
                                                            <span style={{fontWeight:'600'}}>{hari}</span>
                                                            <span>{jam.mulai} – {jam.selesai}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        })()}

                                        <div className="course-links-status">
                                            <span className={`link-badge ${course.wa_group ? 'has-link' : 'no-link'}`}>
                                                <i className="fab fa-whatsapp"></i> Grup
                                            </span>
                                            <span className={`link-badge ${course.wa_mentor ? 'has-link' : 'no-link'}`}>
                                                <i className="fab fa-whatsapp"></i> Mentor
                                            </span>
                                        </div>
                                        <div className="card-actions">
                                            <button className="btn-icon edit" onClick={() => handleEdit(course)}><i className="fas fa-edit"></i></button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(course)}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: PROFILE --- */}
                {activeTab === 'profile' && (
                    <div className="tab-section">
                        <div className="section-title"><h2>Edit Profil Profesional</h2></div>
                        <form className="profile-form-container" onSubmit={handleSaveProfile}>
                            <div className="profile-left">
                                <div className="avatar-upload">
                                    <img src={previewAvatar || (profileData.avatar ? `${profileData.avatar}?t=${Date.now()}` : 'https://via.placeholder.com/150')} alt="Profile" />
                                    <label htmlFor="avatarInput" className="btn-upload-avatar"><i className="fas fa-camera"></i> Ganti Foto</label>
                                    <input id="avatarInput" type="file" name="avatar" onChange={handleProfileChange} accept="image/*" hidden />
                                </div>
                                <div className="mentor-stats">
                                    <div className="stat-item"><span className="stat-label">Rating</span><span className="stat-value">⭐ {profileData.rating}</span></div>
                                    <div className="stat-item" style={{ marginTop: '10px' }}>
                                        <span className="stat-label">Status</span>
                                        <span className={`stat-value ${profileData.is_active === 1 ? 'text-green' : 'text-red'}`}>
                                            {profileData.is_active === 1 ? '🟢 Aktif' : '🔴 Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-right">
                                <div className="form-group"><label>Nama Lengkap</label><input type="text" name="username" value={profileData.username} onChange={handleProfileChange} required /></div>
                                <div className="form-group"><label>Email</label><input type="email" name="email" value={profileData.email} onChange={handleProfileChange} required /></div>
                                <div className="form-group"><label>Bidang Keahlian</label><input type="text" name="specialization" value={profileData.specialization} onChange={handleProfileChange} /></div>
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <select name="category" value={profileData.category} onChange={handleProfileChange}>
                                        <option value="">-- Pilih Kategori --</option>
                                        <option value="kepelatihan">Kepelatihan</option>
                                        <option value="keagamaan">Keagamaan</option>
                                        <option value="mathematics">Matematika</option>
                                        <option value="language">Bahasa</option>
                                        <option value="manajemen">Manajemen</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Bio</label><textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows="5"></textarea></div>
                                <div className="form-group">
                                    <label><i className="fab fa-whatsapp" style={{marginRight:'6px', color:'#25d366'}}></i>Nomor WhatsApp</label>
                                    <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="Contoh: 6281234567890" />
                                    <small style={{color:'#94a3b8', fontSize:'0.78rem'}}>Format: 62xxx (tanpa + dan spasi)</small>
                                </div>
                                <div className="form-group">
                                    <label><i className="fas fa-file-pdf" style={{marginRight:'6px', color:'#ef4444'}}></i>Link CV (Google Drive)</label>
                                    <input type="url" name="cv_link" value={profileData.cv_link} onChange={handleProfileChange} placeholder="https://drive.google.com/..." />
                                    <small style={{color:'#94a3b8', fontSize:'0.78rem'}}>Upload CV ke Google Drive, lalu paste linknya di sini</small>
                                </div>
                                <div className="form-actions"><button type="submit" className="btn-save-profile">Simpan Perubahan</button></div>
                            </div>
                        </form>
                    </div>
                )}
            </main>
            <CRUDModal isOpen={showModal} onClose={() => setShowModal(false)} mode={modalMode} type="course" subType="course" data={selectedCourse} onSave={handleSaveCourse} />
        </div>
    )
}

export default MentorDashboard
