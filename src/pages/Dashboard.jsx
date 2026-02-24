import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatModal from '../components/ChatModal'
import '../styles/Dashboard.css'

function Dashboard({ setIsLoggedIn }) {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showChatModal, setShowChatModal] = useState(false)
    const [selectedMentor, setSelectedMentor] = useState(null)
    
    // State Data
    const [myCourses, setMyCourses] = useState([]) 
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [applicationStatus, setApplicationStatus] = useState('none')
    const [myMentors, setMyMentors] = useState([]) 

    const mentors = [
        { id: 1, name: 'Debbi Angelia Saputri', title: 'Tutor Bahasa Arab', image: '/images/mentors/debbi.jpeg' },
        { id: 2, name: 'Jawad At-Taqy', title: 'Tutor Manajemen', image: '/images/mentors/jawad.jpeg' }
    ]

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

            // --- 1. FETCH COURSES & MENTOR SAYA ---
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

            // --- 2. CEK STATUS MENTOR (OPTIONAL) ---
          
            if (userId) {
                fetch(`/api/mentor_applications.php?user_id=${userId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.status) {
                            setApplicationStatus(data.status);
                        }
                    })
                    .catch(err => console.warn("Info: Fitur mentor belum siap/error (Abaikan jika fokus ke courses)", err));
            }
        }
    }, [navigate])

    const handleApplyMentor = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return alert("User ID tidak ditemukan. Silakan login ulang.");
        
        if (!confirm("Apakah Anda yakin ingin mengajukan diri sebagai mentor?")) return;

        try {
            const response = await fetch('/api/mentor_applications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert("Pengajuan berhasil dikirim! Mohon tunggu persetujuan Admin.");
                setApplicationStatus('pending');
            } else {
                alert(result.message || "Gagal mengirim pengajuan.");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi.");
        }
    };

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
                                    <button className="btn btn-primary" onClick={handleApplyMentor}>
                                        Ajukan Jadi Mentor
                                    </button>
                                )}
                                {applicationStatus === 'pending' && (
                                    <button className="btn" style={{backgroundColor: '#ecc94b', color: '#fff', cursor: 'default'}}>
                                        <i className="fas fa-clock"></i> Menunggu Persetujuan Admin
                                    </button>
                                )}
                                {applicationStatus === 'approved' && (
                                    <div className="alert alert-success">
                                        Selamat! Anda sudah menjadi Mentor. Silakan login ulang.
                                    </div>
                                )}
                                {applicationStatus === 'rejected' && (
                                    <div>
                                        <div className="alert alert-danger" style={{marginBottom: '10px'}}>
                                            Pengajuan ditolak.
                                        </div>
                                        <button className="btn btn-primary" onClick={handleApplyMentor}>
                                            Ajukan Kembali
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-book-open"></i></div>
                            <div className="stat-info"><h3>{myCourses.length}</h3><p>Kursus Aktif</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-certificate"></i></div>
                            <div className="stat-info"><h3>0</h3><p>Sertifikat</p></div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        
                        {/* --- BAGIAN KURSUS SAYA --- */}
                        <div id="my-courses" className="dashboard-section">
                            <div className="section-header"><h2>Kursus Saya</h2></div>
                            
                            {loadingCourses ? (
                                <p>Memuat kursus...</p>
                            ) : myCourses.length === 0 ? (
                                <div className="empty-state">
                                    <p>Kamu belum memiliki kursus.</p>
                                    <button onClick={() => navigate('/products')} className="btn-browse" style={{marginTop:'10px', padding:'10px', cursor:'pointer'}}>
                                        Cari Kursus Sekarang
                                    </button>
                                </div>
                            ) : (
                                <div className="courses-grid">
                                    {myCourses.map(course => (
                                        <div key={course.id} className="course-card-dashboard" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                            
                                            <img 
                                                src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${course.image}`}
                                                alt={course.title} 
                                                style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                                                onError={(e) => { e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'; }}
                                            />
                                            
                                            <div className="course-info" style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{course.title}</h3>
                                                
                                                <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px', width: 'fit-content', marginBottom: '10px' }}>
                                                    {course.type}
                                                </span>

                                                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 15px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                                    {course.description || "Tidak ada deskripsi."}
                                                </p>

                                                {/* --- LINK AKSES MATERI --- */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                                                    {course.drive_link ? (
                                                        <a href={course.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', background: '#4285f4', color: 'white', borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                                                            <i className="fab fa-google-drive"></i> Akses Materi
                                                        </a>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Materi belum tersedia</span>
                                                    )}
                                                    {course.wa_group && (
                                                        <a href={course.wa_group} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', background: '#25d366', color: 'white', borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                                                            <i className="fab fa-whatsapp"></i> Grup WhatsApp
                                                        </a>
                                                    )}
                                                    {course.wa_mentor && (
                                                        <a href={course.wa_mentor} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', background: '#128c7e', color: 'white', borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
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

                        <div className="dashboard-section">
                            <div className="section-header"><h2>Mentor Saya</h2></div>
                            <div className="mentors-list">
                                {myMentors.length === 0 ? (
                                    <p style={{color:'#94a3b8', fontStyle:'italic', padding:'10px 0'}}>
                                        Belum ada mentor. Beli kursus terlebih dahulu.
                                    </p>
                                ) : (
                                    myMentors.map((mentor) => (
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
                                                    <a
                                                        href={`https://wa.me/${mentor.phone}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm"
                                                        style={{textDecoration:'none', background:'#25d366', color:'white', display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 12px', borderRadius:'6px', fontSize:'0.82rem', fontWeight:'600'}}
                                                    >
                                                        <i className="fab fa-whatsapp"></i> Chat
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} mentor={selectedMentor} />
        </div>
    )
}

export default Dashboard