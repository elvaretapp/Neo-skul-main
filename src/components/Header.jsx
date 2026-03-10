import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../hooks/useAuth'
import '../styles/Header.css'

function Header({ isLoggedIn, setIsLoggedIn }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen)

    const handleLogout = async () => {
        await logout() // hapus token dari server + localStorage
        if (setIsLoggedIn) setIsLoggedIn(false)
        setMobileMenuOpen(false)
        setProfileDropdownOpen(false)
        navigate('/')
    }

    const getDashboardPath = () => {
        const userRole = localStorage.getItem('userRole')
        if (userRole === 'admin') return '/admin/dashboard'
        if (userRole === 'mentor') return '/mentor/dashboard'
        return '/dashboard'
    }

    const handleDashboardClick = () => { setProfileDropdownOpen(false); navigate(getDashboardPath()) }
    const handleCartClick = () => { setProfileDropdownOpen(false); navigate('/Cart') }
    const getUsername = () => localStorage.getItem('username') || 'User'
    const getUserRole = () => {
        const role = localStorage.getItem('userRole') || 'client'
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
    const getProfileIcon = () => {
        const role = localStorage.getItem('userRole')
        if (role === 'admin') return 'fa-user-shield'
        if (role === 'mentor') return 'fa-chalkboard-teacher'
        return 'fa-user-circle'
    }

    const scrollToSection = (sectionId) => {
        setMobileMenuOpen(false)
        if (location.pathname === '/') {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
            navigate('/')
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownOpen && !event.target.closest('.nav-profile-dropdown')) {
                setProfileDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [profileDropdownOpen])

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
                        <img src="/images/logo/Logo NS.png" alt="NeoScholar Logo" />
                        Neo<span>Scholar</span>
                    </Link>
                    <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Produk</Link></li>
                        <li><Link to="/mentor" className={`nav-link ${location.pathname === '/mentor' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Mentor</Link></li>
                        <li><a href="#categories" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('categories') }}>Kategori</a></li>
                        <li><Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Tentang</Link></li>
                        <li><Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Kontak</Link></li>
                        <li>
                            {!isLoggedIn ? (
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                                        style={{padding:'7px 16px', borderRadius:'20px', border:'1.5px solid #1a237e', color:'#1a237e', fontWeight:'600', fontSize:'0.88rem', textDecoration:'none', transition:'all 0.2s'}}
                                        onMouseOver={e => { e.target.style.background='#1a237e'; e.target.style.color='white' }}
                                        onMouseOut={e => { e.target.style.background='transparent'; e.target.style.color='#1a237e' }}
                                    >
                                        Login
                                    </Link>
                                    
                                </div>
                            ) : (
                                <div className="nav-profile-dropdown">
                                    <button className="nav-profile-btn" onClick={toggleProfileDropdown} title={getUsername()}
                                        style={{width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', border:'2px solid #1a237e', padding:0, cursor:'pointer', background:'#e8eaf6'}}>
                                        {localStorage.getItem('userAvatar')
                                            ? <img src={localStorage.getItem('userAvatar')} alt={getUsername()}
                                                style={{width:'100%', height:'100%', objectFit:'cover'}}
                                                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                                            : null
                                        }
                                        <span style={{width:'100%', height:'100%', display: localStorage.getItem('userAvatar') ? 'none' : 'flex', alignItems:'center', justifyContent:'center', color:'#1a237e', fontSize:'1.2rem'}}>
                                            <i className={`fas ${getProfileIcon()}`}></i>
                                        </span>
                                    </button>
                                    {profileDropdownOpen && (
                                        <div className="profile-dropdown-menu nav-dropdown">
                                            <div className="profile-dropdown-header">
                                                <div className="profile-avatar">
                                                    <i className={`fas ${getProfileIcon()}`}></i>
                                                </div>
                                                <div className="profile-info">
                                                    <div className="profile-name">{getUsername()}</div>
                                                    <div className="profile-role">{getUserRole()}</div>
                                                </div>
                                            </div>
                                            <div className="profile-dropdown-divider"></div>
                                            <button className="profile-dropdown-item" onClick={handleDashboardClick}>
                                                <i className="fas fa-th-large"></i> Dashboard
                                            </button>
                                            {localStorage.getItem('userRole') === 'client' && (
                                                <button className="profile-dropdown-item" onClick={handleCartClick}>
                                                    <i className="fas fa-shopping-cart"></i> Keranjang
                                                </button>
                                            )}
                                            <div className="profile-dropdown-divider"></div>
                                            <button className="profile-dropdown-item logout" onClick={handleLogout}>
                                                <i className="fas fa-sign-out-alt"></i> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    </ul>
                    <div className="mobile-menu" onClick={toggleMobileMenu}>
                        <i className="fas fa-bars"></i>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header
