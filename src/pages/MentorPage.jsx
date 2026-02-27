import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/MentorPage.css'

function MentorPage() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [mentors, setMentors] = useState([])
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [loadingMentors, setLoadingMentors] = useState(true)
    const [filterCategory, setFilterCategory] = useState('all')
    const [categories, setCategories] = useState([])
    const [detailCourse, setDetailCourse] = useState(null)

    // Fetch kursus mentor (type = 'course')
    useEffect(() => {
        fetch('/api/courses.php')
            .then(res => res.json())
            .then(data => {
                const mentorCourses = data.filter(c => c.type === 'course')
                setCourses(mentorCourses)
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingCourses(false))
    }, [])

    // Fetch list mentor
    useEffect(() => {
        fetch('/api/mentors.php')
            .then(res => res.json())
            .then(data => {
                setMentors(data)
                // Ambil kategori unik dari mentor
                const cats = [...new Set(data.map(m => m.category).filter(Boolean))]
                setCategories(cats)
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingMentors(false))
    }, [])

    const handleBuyCourse = async (course) => {
        const userId = localStorage.getItem('user_id')
        if (!userId) {
            alert('Silakan login terlebih dahulu!')
            navigate('/login')
            return
        }
        try {
            const response = await fetch('/api/cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, course_id: course.id })
            })
            const result = await response.json()
            if (response.ok) {
                alert('Berhasil masuk keranjang!')
                navigate('/cart')
            } else {
                alert('Gagal: ' + result.message)
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi.')
        }
    }

    const filteredMentors = filterCategory === 'all'
        ? mentors
        : mentors.filter(m => m.category === filterCategory)

    return (
        <div className="mentor-page">

            {/* HERO */}
            <div className="mentor-page-hero">
                <div className="container">
                    <h1>Kursus & Mentor</h1>
                    <p>Belajar langsung bersama mentor profesional pilihan kami</p>
                </div>
            </div>

            {/* SECTION 1: KURSUS DARI MENTOR */}
            <section className="mentor-courses-section container">
                <div className="section-title-row">
                    <h2><i className="fas fa-chalkboard-teacher"></i> Kursus Tersedia</h2>
                    <p>Daftar kursus/jadwal yang ditawarkan oleh mentor kami</p>
                </div>

                {loadingCourses ? (
                    <p className="loading-text">Memuat kursus...</p>
                ) : courses.length === 0 ? (
                    <p className="empty-text">Belum ada kursus tersedia.</p>
                ) : (
                    <div className="mentor-courses-grid">
                        {courses.map(course => (
                            <div key={course.id} className="mentor-course-card">
                                <div className="mentor-course-img-wrap">
                                    <img
                                        src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${course.image}`}
                                        alt={course.title}
                                        onError={e => e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'}
                                    />
                                    <span className="course-badge">KURSUS MENTOR</span>
                                </div>
                                <div className="mentor-course-body">
                                    <h3>{course.title}</h3>
                                    <p className="course-mentor-name">
                                        <i className="fas fa-user-tie"></i> {course.mentor_name || 'Mentor'}
                                    </p>
                                    <p className="course-desc">{course.description || '-'}</p>
                                    <div className="course-footer">
                                        <span className="course-price">Rp {parseInt(course.price).toLocaleString('id-ID')}</span>
                                        <div style={{display:'flex', gap:'8px'}}>
                                            <button className="btn-detail-course" onClick={() => setDetailCourse(course)}>
                                                Detail
                                            </button>
                                            <button className="btn-beli" onClick={() => handleBuyCourse(course)}>
                                                <i className="fas fa-shopping-cart"></i> Beli
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* SECTION 2: LIST MENTOR SLIDER */}
            <section className="mentor-list-section">
                <div className="container">
                    <div className="section-title-row">
                        <h2><i className="fas fa-users"></i> Mentor Profesional Kami</h2>
                        <p>Kenali para mentor yang siap membimbing Anda</p>
                    </div>

                    {/* Filter Kategori */}
                    <div className="mentor-filter-tabs">
                        <button
                            className={`filter-tab ${filterCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('all')}
                        >Semua</button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-tab ${filterCategory === cat ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >{cat}</button>
                        ))}
                    </div>

                    {loadingMentors ? (
                        <p className="loading-text">Memuat mentor...</p>
                    ) : (
                        <div className="mentor-slider-wrapper">
                            <div className="mentor-slider">
                                {filteredMentors.map((mentor, idx) => (
                                    <div key={idx} className="mentor-slide-card">
                                        <div className="mentor-slide-avatar">
                                            <img
                                                src={mentor.avatar
                                                    ? `http://localhost:8080/Neo-skul-main/Neo-skul-main${mentor.avatar}`
                                                    : 'https://via.placeholder.com/100'}
                                                alt={mentor.username}
                                                onError={e => e.target.src = 'https://via.placeholder.com/100'}
                                            />
                                        </div>
                                        <div className="mentor-slide-info">
                                            <h4>{mentor.username}</h4>
                                            <p className="mentor-slide-spec">{mentor.specialization || 'Mentor'}</p>
                                            <p className="mentor-slide-bio">{mentor.bio || '-'}</p>
                                            {mentor.phone && (
                                                <a
                                                    href={`https://wa.me/${mentor.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-wa-mentor"
                                                >
                                                    <i className="fab fa-whatsapp"></i> Hubungi
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* MODAL DETAIL KURSUS */}
            {detailCourse && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}
                     onClick={() => setDetailCourse(null)}>
                    <div style={{background:'#fff', borderRadius:'16px', maxWidth:'480px', width:'100%', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}
                         onClick={e => e.stopPropagation()}>
                        <img
                            src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${detailCourse.image}`}
                            alt={detailCourse.title}
                            style={{width:'100%', height:'200px', objectFit:'cover'}}
                            onError={e => e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'}
                        />
                        <div style={{padding:'24px'}}>
                            <span style={{fontSize:'0.75rem', background:'#dbeafe', color:'#1d4ed8', padding:'3px 10px', borderRadius:'20px', fontWeight:'700'}}>KURSUS MENTOR</span>
                            <h2 style={{margin:'12px 0 4px', fontSize:'1.25rem', color:'#1e293b'}}>{detailCourse.title}</h2>
                            <p style={{color:'#2563eb', fontSize:'0.85rem', fontWeight:'600', margin:'0 0 10px', display:'flex', alignItems:'center', gap:'5px'}}>
                                <i className="fas fa-user-tie"></i> {detailCourse.mentor_name || 'Mentor'}
                            </p>
                            <p style={{color:'#64748b', fontSize:'0.92rem', lineHeight:'1.6', margin:'0 0 12px'}}>{detailCourse.description}</p>

                            {/* INFO JADWAL */}
                            {detailCourse.schedule_days && (() => {
                                let sched = {}
                                try { sched = JSON.parse(detailCourse.schedule_days) } catch(e) {}
                                const days = Object.entries(sched)
                                if (days.length === 0) return null
                                return (
                                    <div style={{background:'#f0f9ff', border:'1.5px solid #bae6fd', borderRadius:'10px', padding:'12px 14px', marginBottom:'16px'}}>
                                        <p style={{fontWeight:'700', color:'#0369a1', fontSize:'0.88rem', margin:'0 0 10px', display:'flex', alignItems:'center', gap:'6px'}}>
                                            <i className="fas fa-calendar-check"></i> Jadwal Pertemuan
                                        </p>
                                        {days.map(([hari, jam]) => (
                                            <div key={hari} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px dashed #bae6fd', fontSize:'0.85rem'}}>
                                                <span style={{fontWeight:'700', color:'#0c4a6e', display:'flex', alignItems:'center', gap:'6px'}}>
                                                    <i className="fas fa-calendar-day" style={{color:'#0284c7', fontSize:'0.75rem'}}></i>
                                                    {hari}
                                                </span>
                                                <span style={{color:'#0369a1', fontWeight:'600', background:'white', padding:'3px 10px', borderRadius:'20px', border:'1px solid #bae6fd'}}>
                                                    {jam.mulai} – {jam.selesai}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}

                            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                <span style={{fontSize:'1.25rem', fontWeight:'700', color:'#2563eb'}}>
                                    Rp {parseInt(detailCourse.price).toLocaleString('id-ID')}
                                </span>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button onClick={() => setDetailCourse(null)}
                                        style={{padding:'9px 18px', border:'1.5px solid #e2e8f0', borderRadius:'8px', background:'white', color:'#64748b', cursor:'pointer', fontWeight:'600'}}>
                                        Tutup
                                    </button>
                                    <button onClick={() => { setDetailCourse(null); handleBuyCourse(detailCourse); }}
                                        style={{padding:'9px 22px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>
                                        <i className="fas fa-shopping-cart" style={{marginRight:'6px'}}></i>Beli
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MentorPage
