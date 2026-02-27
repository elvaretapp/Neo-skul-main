import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Contact from './pages/Contact'
import About from './pages/About'
import Categories from './pages/Categories'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import MentorDashboard from './pages/MentorDashboard'
import MentorPage from './pages/MentorPage'
import Register from './pages/Register'
import './styles/App.css'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'


// --- MODIFIKASI: ProtectedRoute dengan Alert & Redirection ---
function ProtectedRoute({ children, requiredRole }) {
    // Kita ambil langsung dari localStorage untuk memastikan data persisten saat refresh
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');

    // 1. Jika belum login, tendang ke halaman login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 2. Jika Role tidak sesuai dengan yang diminta halaman
    if (requiredRole && userRole !== requiredRole) {
        // Tampilkan Peringatan
        alert(`Akses Ditolak! Anda login sebagai "${userRole}", Anda tidak memiliki izin untuk mengakses halaman ${requiredRole}. Anda akan dikembalikan ke Dashboard Anda.`);
        
        // Redirect kembali ke dashboard yang BENAR sesuai role user
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'mentor') {
            return <Navigate to="/mentor/dashboard" replace />;
        } else {
            // Default untuk client/siswa
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 3. Jika lolos semua cek, tampilkan halaman
    return children;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const userLoggedIn = localStorage.getItem('userLoggedIn')
        if (userLoggedIn === 'true') {
            setIsLoggedIn(true)
        }
    }, [])

    return (
        <Router>
            <div className="app">
                <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                <Routes>
                    <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/mentor" element={<MentorPage />} />
                    <Route path="/cart" element={<Cart /> } />

                    <Route path="/checkout" element={
                        <ProtectedRoute requiredRole="client">
                         <Checkout />
                        </ProtectedRoute>
                        } />
                    <Route
                    
                        path="/login"
                        element={
                            isLoggedIn ? (
                                // Cek role untuk redirect ke dashboard yang tepat jika sudah login
                                localStorage.getItem('userRole') === 'admin' ? <Navigate to="/admin/dashboard" /> :
                                localStorage.getItem('userRole') === 'mentor' ? <Navigate to="/mentor/dashboard" /> :
                                <Navigate to="/dashboard" />
                            ) : (
                                <Login setIsLoggedIn={setIsLoggedIn} />
                            )
                        }
                    />
                    
                    <Route path="/register" element={<Register />} />
                    
                    {/* --- RUTE DASHBOARD CLIENT/SISWA --- */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute requiredRole="client">
                                <Dashboard setIsLoggedIn={setIsLoggedIn} />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- RUTE DASHBOARD ADMIN --- */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDashboard setIsLoggedIn={setIsLoggedIn} />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- RUTE DASHBOARD MENTOR --- */}
                    <Route
                        path="/mentor/dashboard"
                        element={
                            <ProtectedRoute requiredRole="mentor">
                                <MentorDashboard setIsLoggedIn={setIsLoggedIn} />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/contact" element={<Contact isLoggedIn={isLoggedIn} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/categories" element={<Categories isLoggedIn={isLoggedIn} />} />
                    
                </Routes>
                <Footer />
            </div>
        </Router>
    )
}

export default App

