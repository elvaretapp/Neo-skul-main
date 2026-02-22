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

            // --- 1. FETCH COURSES (KURSUS SAYA) ---
            if(userId) {
                console.log("DEBUG: Memulai fetch ke API my_courses.php...");
                
                // Pastikan URL benar: /neo-skul/api/...
                fetch(`http://localhost/neo-skul/api/my_courses.php?user_id=${userId}`)
                    .then(res => {
                        // Cek apakah response OK (status 200)
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.text(); // Ambil text dulu untuk jaga-jaga bukan JSON
                    })
                    .then(text => {
                        console.log("DEBUG: Response Mentah dari Server:", text);
                        try {
                            const data = JSON.parse(text); // Baru parse ke JSON
                            console.log("DEBUG: Data JSON Berhasil Diparse:", data);
                            
                            if (Array.isArray(data)) {
                                setMyCourses(data);
                            } else {
                                console.warn("DEBUG: Data bukan array!", data);
                                setMyCourses([]);
                            }
                        } catch (e) {
                            console.error("DEBUG: Error Parse JSON:", e);
                        }
                        setLoadingCourses(false);
                    })
                    .catch(err => {
                        console.error("DEBUG: Gagal Fetch Kursus:", err);
                        setLoadingCourses(false);
                    })
            } else {
                console.error("DEBUG: User ID Kosong, tidak bisa fetch courses.");
                setLoadingCourses(false);
            }

            // --- 2. CEK STATUS MENTOR (OPTIONAL) ---
            // Saya bungkus try-catch agar tidak mematikan halaman jika error
            if (userId) {
                fetch(`http://localhost/neo-skul/api/mentor_applications.php?user_id=${userId}`)
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
            const response = await fetch('http://localhost/neo-skul/api/mentor_applications.php', {
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
                                        <div key={course.id} className="course-card-dashboard" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                            
                                            {/* --- GAMBAR KURSUS --- */}
                                            <img 
                                                /* Menggunakan path dari database + path server */
                                                src={`http://localhost/neo-skul${course.image}`} 
                                                alt={course.title} 
                                                style={{
                                                    width: '100%', 
                                                    height: '150px', 
                                                    objectFit: 'cover'
                                                }} 
                                                onError={(e) => {
                                                    // Fallback jika gambar rusak/tidak ketemu
                                                    console.log("Gambar error, pakai default.");
                                                    e.target.src = '/assets/images/products/Tamplateedukasi.jpeg';
                                                }}
                                            />
                                            
                                            {/* --- INFO KURSUS --- */}
                                            <div className="course-info" style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{course.title}</h3>
                                                
                                                <span className="course-type" style={{ 
                                                    fontSize: '12px', 
                                                    background: '#e0f2fe', 
                                                    color: '#0284c7', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    width: 'fit-content',
                                                    marginBottom: '10px'
                                                }}>
                                                    {course.type}
                                                </span>

                                                <p style={{
                                                    fontSize: '14px',
                                                    color: '#666',
                                                    margin: '0 0 15px 0',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {course.description || "Tidak ada deskripsi."}
                                                </p>

                                                <button className="btn-start" style={{ marginTop: 'auto', width: '100%', padding: '10px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Mulai Belajar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="dashboard-section">
                            <div className="section-header"><h2>Mentor Saya</h2></div>
                            <div className="mentors-list">
                                {mentors.map((mentor) => (
                                    <div key={mentor.id} className="mentor-item">
                                        <img src={mentor.image} alt={mentor.name} onError={(e) => e.target.src='https://via.placeholder.com/50'} />
                                        <div className="mentor-info">
                                            <h4>{mentor.name}</h4>
                                            <p>{mentor.title}</p>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleChatClick(mentor)}>Chat</button>
                                        </div>
                                    </div>
                                ))}
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