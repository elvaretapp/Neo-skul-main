import { useState, useEffect } from 'react'
import Carousel from '../components/Carousel'
import SearchModal from '../components/SearchModal'

function Home({ isLoggedIn }) {
    const [activeTab, setActiveTab] = useState('general')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [aiQuery, setAiQuery] = useState('')
    const [showSearchModal, setShowSearchModal] = useState(false)
    const [modalSearchType, setModalSearchType] = useState('general')
    const [modalQuery, setModalQuery] = useState('')
    const [username, setUsername] = useState('')

    // State untuk produk dari database
    const [products, setProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(true)

    // State untuk mentor dari database
    const [mentors, setMentors] = useState([])
    const [loadingMentors, setLoadingMentors] = useState(true)

    // Get username if logged in
    useEffect(() => {
        if (isLoggedIn) {
            const storedUsername = localStorage.getItem('username')
            setUsername(storedUsername || 'Pengguna')
        }
    }, [isLoggedIn])

    // Fetch Data Produk dari Database
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/neo-scholar/api/courses.php')
                if (!response.ok) throw new Error('Network response was not ok')
                const data = await response.json()
                setProducts(data)
            } catch (error) {
                console.error("Gagal mengambil data produk:", error)
            } finally {
                setLoadingProducts(false)
            }
        }

        fetchProducts()
    }, [])

    // Fetch Data Mentor dari Database (role = 'mentor')
    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await fetch('/api/mentors.php')
                if (!response.ok) throw new Error('Network response was not ok')
                const data = await response.json()

                // Mapping data dari DB ke format yang digunakan komponen
                const mapped = data.map(m => ({
                    name: m.username,
                    title: m.specialization || 'Mentor',
                    bio: m.bio || '-',
                    image: m.avatar || '/images/mentors/default.jpg',
                    rating: 5.0,
                    reviews: 0,
                    category: m.category || 'all'
                }))

                setMentors(mapped)
            } catch (error) {
                console.error("Gagal mengambil data mentor:", error)
            } finally {
                setLoadingMentors(false)
            }
        }

        fetchMentors()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            setModalQuery(searchQuery)
            setModalSearchType('general')
            setShowSearchModal(true)
        }
    }

    const handleAISearch = (e) => {
        e.preventDefault()
        if (aiQuery.trim()) {
            setModalQuery(aiQuery)
            setModalSearchType('ai')
            setShowSearchModal(true)
        }
    }

    const filteredMentors = selectedCategory === 'all'
        ? mentors
        : mentors.filter(mentor => mentor.category === selectedCategory)

    return (
        <div className="home">
            {/* Search Modal */}
            <SearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                searchType={modalSearchType}
                query={modalQuery}
            />

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Your Gateway to Future Learning</h1>
                        <p className="hero-subtitle">
                            Temukan media pembelajaran terbaik, mentor profesional, dan teknologi edukasi inovatifmu dalam satu platform ini.
                        </p>
                        <a href="#product" className="btn btn-secondary">Explore Now</a>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="search-section">
                <div className="container">
                    <div className="search-tabs">
                        <div
                            className={`search-tab ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            Cari Materi
                        </div>
                        <div
                            className={`search-tab ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            Konsultasi AI
                        </div>
                    </div>

                    <div className="search-content">
                        <div className={`search-panel ${activeTab === 'general' ? 'active' : ''}`}>
                            <div className="search-container">
                                <form className="search-box" onSubmit={handleSearch}>
                                    <i className="fas fa-search search-icon"></i>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Cari materi pembelajaran, kursus, atau buku..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="search-button">Cari</button>
                                </form>
                            </div>
                        </div>

                        <div className={`search-panel ${activeTab === 'ai' ? 'active' : ''}`}>
                            <div className="search-container">
                                <form className="search-box" onSubmit={handleAISearch}>
                                    <i className="fas fa-robot search-icon"></i>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Tanyakan pada AI tentang pelajaran atau konsep yang sulit..."
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                    />
                                    <button type="submit" className="search-button ai-button">Konsultasi</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Seller Products */}
            <section className="bestseller section" id="product">
                <div className="container">
                    <h2 className="section-title">Produk Terbaru</h2>
                    {loadingProducts ? (
                        <p style={{ textAlign: 'center' }}>Memuat produk...</p>
                    ) : (
                        <Carousel items={products} />
                    )}
                </div>
            </section>

            {/* Mentors Section */}
            <section className="mentors section" id="mentor">
                <div className="container">
                    <h2 className="section-title">Mentor Profesional Kami</h2>

                    <div className="mentor-categories">
                        <div
                            className={`mentor-category ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            Semua
                        </div>
                        <div
                            className={`mentor-category ${selectedCategory === 'kepelatihan' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('kepelatihan')}
                        >
                            Kepelatihan
                        </div>
                        <div
                            className={`mentor-category ${selectedCategory === 'keagamaan' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('keagamaan')}
                        >
                            Keagamaan
                        </div>
                        <div
                            className={`mentor-category ${selectedCategory === 'mathematics' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('mathematics')}
                        >
                            Matematika
                        </div>
                        <div
                            className={`mentor-category ${selectedCategory === 'language' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('language')}
                        >
                            Bahasa
                        </div>
                        <div
                            className={`mentor-category ${selectedCategory === 'manajemen' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('manajemen')}
                        >
                            Manajemen
                        </div>
                    </div>

                    {loadingMentors ? (
                        <p style={{ textAlign: 'center' }}>Memuat mentor...</p>
                    ) : filteredMentors.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>Tidak ada mentor ditemukan.</p>
                    ) : (
                        <div className="mentors-grid">
                            {filteredMentors.map((mentor, index) => (
                                <div key={index} className="mentor-card">
                                    <div className="mentor-image">
                                        <img
                                            src={mentor.image}
                                            alt={mentor.name}
                                            onError={(e) => { e.target.src = '/images/mentors/default.jpg' }}
                                        />
                                    </div>
                                    <div className="mentor-info">
                                        <h3 className="mentor-name">{mentor.name}</h3>
                                        <p className="mentor-title">{mentor.title}</p>
                                        <p className="mentor-bio">{mentor.bio}</p>
                                        <div className="mentor-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`fas fa-star${i < Math.floor(mentor.rating) ? '' : '-half-alt'}`}></i>
                                            ))}
                                            <span>{mentor.rating} ({mentor.reviews} ulasan)</span>
                                        </div>
                                        <a href="#" className="btn btn-primary mentor-btn">Lihat Profil</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories section" id="categories">
                <div className="container">
                    <h2 className="section-title">Kategori Media Pembelajaran</h2>
                    <div className="categories-container">
                        <div className="category-card">
                            <div className="category-img-container">
                                <i className="fas fa-vr-cardboard category-icon"></i>
                            </div>
                            <div className="category-content">
                                <h3 className="category-title">AR/VR</h3>
                                <p>Pelajari materi dengan pengalaman imersif melalui teknologi augmented dan virtual reality.</p>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-img-container">
                                <i className="fas fa-robot category-icon"></i>
                            </div>
                            <div className="category-content">
                                <h3 className="category-title">Robot</h3>
                                <p>Kembangkan keterampilan coding dan engineering dengan kit robot interaktif.</p>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-img-container">
                                <i className="fas fa-book category-icon"></i>
                            </div>
                            <div className="category-content">
                                <h3 className="category-title">E-book</h3>
                                <p>Akses ribuan e-book premium dengan materi yang selalu diperbarui.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
