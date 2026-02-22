import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../../assets/images/logo/Logo NS.png' // Pastikan path logo sesuai
import '../styles/Footer.css'

function Footer() {
    const navigate = useNavigate()
    const location = useLocation()

    const scrollToSection = (e, sectionId) => {
        e.preventDefault()
        
        // Fungsi scroll yang digunakan kembali
        const doScroll = () => {
            const element = document.getElementById(sectionId)
            if (element) {
                const headerOffset = 80 // Sesuaikan dengan tinggi header Anda
                const elementPosition = element.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                })
            }
        }

        if (location.pathname === '/') {
            doScroll()
        } else {
            navigate('/')
            // Tunggu sebentar sampai navigasi selesai baru scroll
            setTimeout(doScroll, 100)
        }
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Kolom 1: Brand & Bio */}
                    <div className="footer-column brand-column">
                        <div className="footer-logo">
                            <img src={Logo} alt="NeoScholar Logo" />
                            <h3>NeoScholar</h3>
                        </div>
                        <p className="brand-desc">
                            Platform edukasi masa depan dengan pendekatan inovatif (AR/VR) 
                            untuk mempersiapkan generasi penerus bangsa yang kompeten.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon facebook"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social-icon twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-icon instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-icon youtube"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>

                    {/* Kolom 2: Navigasi Cepat */}
                    <div className="footer-column">
                        <h3>Akses Cepat</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Beranda</Link></li>
                            <li><Link to="/about">Tentang Kami</Link></li>
                            <li><a href="#product" onClick={(e) => scrollToSection(e, 'product')}>Produk Unggulan</a></li>
                            <li><Link to="/categories">Kategori Belajar</Link></li>
                            <li><a href="#mentor" onClick={(e) => scrollToSection(e, 'mentor')}>Daftar Mentor</a></li>
                        </ul>
                    </div>

                    {/* Kolom 3: Kategori & Kontak */}
                    <div className="footer-column">
                        <h3>Hubungi Kami</h3>
                        <ul className="contact-info">
                            <li>
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Jl. Pendidikan No. 123, Jakarta Selatan, Indonesia</span>
                            </li>
                            <li>
                                <i className="fas fa-phone-alt"></i>
                                <span>+62 812 3456 7890</span>
                            </li>
                            <li>
                                <i className="fas fa-envelope"></i>
                                <span>info@neoscholar.id</span>
                            </li>
                        </ul>
                    </div>

                    {/* Kolom 4: Newsletter (Fitur Baru) */}
                    <div className="footer-column">
                        <h3>Newsletter</h3>
                        <p className="newsletter-desc">Dapatkan info terbaru tentang kursus dan teknologi pendidikan.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Email Anda..." />
                            <button type="submit"><i className="fas fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} NeoScholar. All Rights Reserved.</p>
                    <div className="footer-legal">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer