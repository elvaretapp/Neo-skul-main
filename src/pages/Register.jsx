import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Login.css' // Gunakan style Login biar seragam

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            // Gunakan path relative berkat Proxy di vite.config.js
            const response = await fetch('/api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'client' })
            })
            
            const data = await response.json()
            
            if (response.ok) {
                alert('Registrasi berhasil! Silakan login.')
                navigate('/login')
            } else {
                setMessage(data.message || 'Registrasi gagal')
            }
        } catch (error) {
            setMessage('Error koneksi ke server')
        }
    }

    return (
        <section className="login-container">
            <div className="login-card">
                <h2 className="login-title">Daftar Akun Baru</h2>
                <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Nama Lengkap</label>
                        <input className="form-input" type="text" required 
                               value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" required 
                               value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" required 
                               value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    
                    {message && <p className="error-message" style={{color: 'red', marginBottom:'10px'}}>{message}</p>}
                    
                    <button type="submit" className="login-button">Daftar Sekarang</button>
                </form>
                <div className="register-link">
                    <p>Sudah punya akun? <Link to="/login">Login disini</Link></p>
                </div>
            </div>
        </section>
    )
}