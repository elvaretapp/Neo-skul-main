import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatModal from '../components/ChatModal'
import MentorApplicationForm from '../components/MentorApplicationForm'
import '../styles/Dashboard.css'
import '../styles/MentorApplicationForm.css'

function Dashboard({ setIsLoggedIn }) {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showChatModal, setShowChatModal] = useState(false)
    const [selectedMentor, setSelectedMentor] = useState(null)
    
    // State Data
    const [myCourses, setMyCourses] = useState([]) 
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [myMentors, setMyMentors] = useState([])

    // Mentor Application States
    const [applicationStatus, setApplicationStatus] = useState('none')
    const [applicationData, setApplicationData] = useState(null)
    const [showAppForm, setShowAppForm] = useState(false)
    const [showStatusPopup, setShowStatusPopup] = useState(false)

    const handleChatClick = (mentor) => {
        setSelectedMentor(mentor)
        setShowChatModal(true)
    }

    useEffect(() => {
        console.log("DEBUG: Dashboard Component Loaded"); // Cek apakah halaman dimuat

        const userLoggedIn = localStorage.getItem('userLoggedIn')
        const storedUsername = localStorage.getItem('username')
        const userId = localStorage.getItem('user_id')

        console.log("DEBUG: User ID dari LocalStorage:", userId);

        if (!userLoggedIn || userLoggedIn !== 'true') {
            navigate('/login')
        } else {
            setUsername(storedUsername || 'Pengguna')
            setIsLoading(false)

            // --- 1. FETCH COURSES (KURSUS SAYA) ---
            if(userId) {
                fetch(`/api/my_courses.php?user_id=${userId}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        if (Array.isArray(data)) {
                            setMyCourses(data);

                            // Build mentor unik dari data kursus
                            const mentorMap = {}
                            data.forEach(course => {
                                if (course.mentor_id) {
                                    if (!mentorMap[course.mentor_id]) {
                                        mentorMap[course.mentor_id] = {
                                            id: course.mentor_id,
                                            name: course.mentor_name || 'Mentor',
                                            title: course.mentor_specialization || 'Mentor',
                                            image: course.mentor_avatar || '',
                                            phone: course.mentor_phone || '',
                                            courses: [course.title]
                                        }
                                    } else {
                                        if (!mentorMap[course.mentor_id].courses.includes(course.title)) {
                                            mentorMap[course.mentor_id].courses.push(course.title)
                                        }
                                    }
                                }
                            })
                            setMyMentors(Object.values(mentorMap))
                        } else {
                            setMyCourses([])
                        }
                        setLoadingCourses(false);
                    })
                    .catch(err => {
                        console.error("Gagal Fetch Kursus:", err);
                        setLoadingCourses(false);
                    })
            } else {
                setLoadingCourses(false);
            }

            // --- 2. CEK STATUS LAMARAN MENTOR ---
            if (userId) {
                fetch(`/api/mentor_applications.php?user_id=${userId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.status) {
                            setApplicationStatus(data.status)
                            setApplicationData(data)
                            // Tampilkan popup jika approved atau rejected
                            if (data.status === 'approved' || data.status === 'rejected') {
                                setShowStatusPopup(true)
                            }
                        }
                    })
                    .catch(err => console.warn("Cek status mentor:", err))
            }
        }
    }, [navigate])

    const handleApplicationSuccess = () => {
        setShowAppForm(false)
        setApplicationStatus('pending')
    }

    const handleLogoutAndRelogin = () => {
        localStorage.clear()
        navigate('/login')
    }

    if (isLoading) return <div className="dashboard-loading"><div className="spinner"></div></div>;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="container">
                    <div className="dashboard-welcome">
                        <h1>Selamat Datang, {username}! 👋</h1>
                        <p>Kelola pembelajaran dan progres Anda di sini</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="container">
                    {/* --- FITUR MENTOR --- */}
                    <div className="dashboard-section full-width">
                        <div className="section-header">
                            <h2>Menjadi Mentor</h2>
                        </div>
                        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <p>Bagikan keahlianmu dan bantu siswa lain belajar dengan menjadi mentor di NeoScholar.</p>
                            <div style={{ marginTop: '15px' }}>
                                {applicationStatus === 'none' && (
                                    <button className="btn btn-primary" onClick={() => setShowAppForm(true)}>
                                        <i className="fas fa-paper-plane"></i> Ajukan Jadi Mentor
                                    </button>
                                )}
                                {applicationStatus === 'pending' && (
                                    <button className="btn" style={{backgroundColor: '#ecc94b', color: '#fff', cursor: 'default'}}>
                                        <i className="fas fa-clock"></i> Lamaran Sedang Diproses
                                    </button>
                                )}
                                {applicationStatus === 'approved' && (
                                    <button className="btn btn-primary" onClick={handleLogoutAndRelogin}>
                                        <i className="fas fa-sign-in-alt"></i> Login Ulang Sebagai Mentor
                                    </button>
                                )}
                                {applicationStatus === 'rejected' && (
                                    <div>
                                        <div style={{color:'#ef4444', marginBottom:'10px', fontSize:'0.9rem'}}>
                                            <i className="fas fa-times-circle"></i> Lamaran ditolak. Kamu bisa mengajukan kembali.
                                        </div>
                                        <button className="btn btn-primary" onClick={() => setShowAppForm(true)}>
                                            <i className="fas fa-redo"></i> Ajukan Kembali
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                            <div className="stat-info">
                                <h3>{myCourses.filter(c => c.type === 'course').length}</h3>
                                <p>Kursus Aktif</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-box-open"></i></div>
                            <div className="stat-info">
                                <h3>{myCourses.filter(c => c.type !== 'course').length}</h3>
                                <p>Produk Dimiliki</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-certificate"></i></div>
                            <div className="stat-info"><h3>0</h3><p>Sertifikat</p></div>
                        </div>
                    </div>

                    <div className="dashboard-grid">

                        {/* --- KURSUS SAYA (type = course) --- */}
                        <div id="my-courses" className="dashboard-section">
                            <div className="section-header">
                                <h2><i className="fas fa-chalkboard-teacher" style={{marginRight:'8px', color:'#2563eb'}}></i>Kursus Saya</h2>
                            </div>
                            {loadingCourses ? (
                                <p>Memuat...</p>
                            ) : myCourses.filter(c => c.type === 'course').length === 0 ? (
                                <div className="empty-state">
                                    <p>Belum ada kursus mentor.</p>
                                    <button onClick={() => navigate('/products')} style={{marginTop:'10px', padding:'8px 16px', cursor:'pointer', background:'#2563eb', color:'white', border:'none', borderRadius:'6px'}}>
                                        Cari Kursus
                                    </button>
                                </div>
                            ) : (
                                <div className="courses-grid">
                                    {myCourses.filter(c => c.type === 'course').map(course => (
                                        <div key={course.id} className="course-card-dashboard" style={{ display:'flex', flexDirection:'column', background:'#fff', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                                            <img
                                                src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${course.image}`}
                                                alt={course.title}
                                                style={{ width:'100%', height:'140px', objectFit:'cover' }}
                                                onError={(e) => { e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'; }}
                                            />
                                            <div style={{ padding:'14px', display:'flex', flexDirection:'column', flexGrow:1 }}>
                                                <span style={{ fontSize:'11px', background:'#dbeafe', color:'#1d4ed8', padding:'2px 8px', borderRadius:'20px', width:'fit-content', marginBottom:'6px', fontWeight:'600' }}>
                                                    KURSUS MENTOR
                                                </span>
                                                <h3 style={{ margin:'0 0 6px 0', fontSize:'15px' }}>{course.title}</h3>
                                                <p style={{ fontSize:'12px', color:'#666', margin:'0 0 12px 0', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                                    {course.description || '-'}
                                                </p>
                                                <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'auto' }}>
                                                    {course.wa_group ? (
                                                        <a href={course.wa_group} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 12px', background:'#25d366', color:'white', borderRadius:'7px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}>
                                                            <i className="fab fa-whatsapp"></i> Grup WhatsApp
                                                        </a>
                                                    ) : <span style={{fontSize:'12px', color:'#aaa', fontStyle:'italic'}}>WA Grup belum tersedia</span>}
                                                    {course.wa_mentor && (
                                                        <a href={course.wa_mentor} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 12px', background:'#128c7e', color:'white', borderRadius:'7px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}>
                                                            <i className="fab fa-whatsapp"></i> Chat Mentor
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- PRODUK SAYA (type = ebook/vr/game) --- */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2><i className="fas fa-box-open" style={{marginRight:'8px', color:'#7c3aed'}}></i>Produk Saya</h2>
                            </div>
                            {loadingCourses ? (
                                <p>Memuat...</p>
                            ) : myCourses.filter(c => c.type !== 'course').length === 0 ? (
                                <div className="empty-state">
                                    <p>Belum ada produk pembelajaran.</p>
                                    <button onClick={() => navigate('/products')} style={{marginTop:'10px', padding:'8px 16px', cursor:'pointer', background:'#7c3aed', color:'white', border:'none', borderRadius:'6px'}}>
                                        Cari Produk
                                    </button>
                                </div>
                            ) : (
                                <div className="courses-grid">
                                    {myCourses.filter(c => c.type !== 'course').map(course => (
                                        <div key={course.id} className="course-card-dashboard" style={{ display:'flex', flexDirection:'column', background:'#fff', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                                            <img
                                                src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${course.image}`}
                                                alt={course.title}
                                                style={{ width:'100%', height:'140px', objectFit:'cover' }}
                                                onError={(e) => { e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'; }}
                                            />
                                            <div style={{ padding:'14px', display:'flex', flexDirection:'column', flexGrow:1 }}>
                                                <span style={{ fontSize:'11px', background:'#ede9fe', color:'#6d28d9', padding:'2px 8px', borderRadius:'20px', width:'fit-content', marginBottom:'6px', fontWeight:'600', textTransform:'uppercase' }}>
                                                    {course.type || 'produk'}
                                                </span>
                                                <h3 style={{ margin:'0 0 6px 0', fontSize:'15px' }}>{course.title}</h3>
                                                <p style={{ fontSize:'12px', color:'#666', margin:'0 0 12px 0', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                                    {course.description || '-'}
                                                </p>
                                                <div style={{ marginTop:'auto' }}>
                                                    {course.drive_link ? (
                                                        <a href={course.drive_link} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 12px', background:'#4285f4', color:'white', borderRadius:'7px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}>
                                                            <i className="fab fa-google-drive"></i> Akses Materi
                                                        </a>
                                                    ) : <span style={{fontSize:'12px', color:'#aaa', fontStyle:'italic'}}>Materi belum tersedia</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- MENTOR SAYA --- */}
                        <div className="dashboard-section">
                            <div className="section-header"><h2>Mentor Saya</h2></div>
                            <div className="mentors-list">
                                {myMentors.length === 0 ? (
                                    <p style={{color:'#94a3b8', fontStyle:'italic', padding:'10px 0'}}>Belum ada mentor.</p>
                                ) : myMentors.map((mentor) => (
                                    <div key={mentor.id} className="mentor-item">
                                        <img
                                            src={mentor.image ? `http://localhost:8080/Neo-skul-main/Neo-skul-main${mentor.image}` : 'https://via.placeholder.com/50'}
                                            alt={mentor.name}
                                            onError={(e) => e.target.src='https://via.placeholder.com/50'}
                                        />
                                        <div className="mentor-info">
                                            <h4>{mentor.name}</h4>
                                            <p style={{margin:'2px 0', color:'#64748b', fontSize:'0.85rem'}}>{mentor.title}</p>
                                            <p style={{margin:'2px 0 6px 0', color:'#2563eb', fontSize:'0.78rem', fontWeight:'600'}}>
                                                📚 {mentor.courses?.join(', ')}
                                            </p>
                                            {mentor.phone && (
                                                <a href={`https://wa.me/${mentor.phone}`} target="_blank" rel="noopener noreferrer"
                                                   style={{textDecoration:'none', background:'#25d366', color:'white', display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 12px', borderRadius:'6px', fontSize:'0.82rem', fontWeight:'600'}}>
                                                    <i className="fab fa-whatsapp"></i> Chat
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} mentor={selectedMentor} />

            {/* Form Pendaftaran Mentor */}
            {showAppForm && (
                <MentorApplicationForm
                    onClose={() => setShowAppForm(false)}
                    onSuccess={handleApplicationSuccess}
                />
            )}

            {/* Popup Notifikasi Status Lamaran */}
            {showStatusPopup && applicationData && (
                <div className="app-status-popup">
                    <div className="app-status-box">
                        {applicationData.status === 'approved' ? (
                            <>
                                <div className="app-status-icon">🎉</div>
                                <h3 style={{color:'#16a34a'}}>Selamat! Lamaran Diterima!</h3>
                                <p>Anda telah resmi menjadi Mentor NeoScholar. Silakan login ulang untuk mengakses dashboard mentor Anda.</p>
                                <button className="btn-popup-primary" onClick={handleLogoutAndRelogin}>
                                    <i className="fas fa-sign-in-alt"></i> Login Ulang Sekarang
                                </button>
                                <button className="btn-popup-secondary" onClick={() => setShowStatusPopup(false)}>
                                    Nanti Saja
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="app-status-icon">😔</div>
                                <h3 style={{color:'#dc2626'}}>Lamaran Tidak Diterima</h3>
                                <p>Mohon maaf, lamaran Anda sebagai mentor belum dapat kami terima saat ini.</p>
                                {applicationData.reject_reason && (
                                    <div className="reject-reason-box">
                                        <strong>Alasan dari Admin:</strong><br/>
                                        {applicationData.reject_reason}
                                    </div>
                                )}
                                <p style={{fontSize:'0.85rem', color:'#94a3b8'}}>Anda dapat memperbaiki lamaran dan mengajukan kembali.</p>
                                <button className="btn-popup-primary" onClick={() => { setShowStatusPopup(false); setShowAppForm(true) }}>
                                    <i className="fas fa-redo"></i> Ajukan Kembali
                                </button>
                                <button className="btn-popup-secondary" onClick={() => setShowStatusPopup(false)}>
                                    Tutup
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard