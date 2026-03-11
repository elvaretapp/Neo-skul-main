import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authFetch } from '../hooks/useAuth'
import '../styles/App.css'

const Cart = () => {
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true'
    const token = localStorage.getItem('auth_token')
    const userId = localStorage.getItem('user_id')

    useEffect(() => {
        if (!isLoggedIn || !token) {
            setLoading(false)
            return
        }

        const fetchCart = async () => {
            try {
                const response = await authFetch(`/api/cart.php?user_id=${userId}`)
                const data = await response.json()
                setCartItems(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Gagal mengambil keranjang:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCart()
    }, [])

    const handleRemove = async (cartId) => {
        if (!confirm("Hapus item ini?")) return
        try {
            const response = await authFetch('/api/cart.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId })
            })
            if (response.ok) {
                setCartItems(cartItems.filter(item => item.cart_id !== cartId))
            }
        } catch (error) { console.error(error) }
    }

    if (loading) {
        return <div className="container section" style={{marginTop:'100px', textAlign:'center'}}>Memuat...</div>
    }

    if (!isLoggedIn || !token) {
        return (
            <div className="container section" style={{marginTop:'100px', textAlign:'center'}}>
                <p>Silakan login terlebih dahulu.</p>
                <button onClick={() => navigate('/login')}
                    style={{marginTop:'12px', padding:'10px 24px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>
                    Login
                </button>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="container section" style={{marginTop:'100px', textAlign:'center'}}>
                <h2>Keranjang Belanja</h2>
                <p>Keranjang Anda kosong.</p>
                <button onClick={() => navigate('/products')}
                    style={{marginTop:'10px', padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>
                    Belanja Sekarang
                </button>
            </div>
        )
    }

    const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.price || 0), 0)

    return (
        <div className="container section" style={{marginTop:'100px', minHeight:'60vh'}}>
            <h2>Keranjang Belanja</h2>
            <table style={{width:'100%', marginTop:'20px', borderCollapse:'collapse'}}>
                <thead>
                    <tr style={{borderBottom:'1px solid #ccc', textAlign:'left'}}>
                        <th style={{padding:'10px'}}>Produk</th>
                        <th style={{padding:'10px'}}>Harga</th>
                        <th style={{padding:'10px'}}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item, index) => (
                        <tr key={index} style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:'10px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                    <img src={item.image} alt={item.title}
                                        onError={e => e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'}
                                        style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'6px'}} />
                                    <strong>{item.title}</strong>
                                </div>
                            </td>
                            <td style={{padding:'10px'}}>Rp {parseFloat(item.price).toLocaleString('id-ID')}</td>
                            <td style={{padding:'10px'}}>
                                <button onClick={() => handleRemove(item.cart_id)}
                                    style={{background:'#ff4444', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{marginTop:'30px', textAlign:'right'}}>
                <h3>Total: Rp {totalPrice.toLocaleString('id-ID')}</h3>
                <button onClick={() => navigate('/checkout')}
                    style={{backgroundColor:'#28a745', color:'white', padding:'12px 30px', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer', marginTop:'15px'}}>
                    Bayar Sekarang
                </button>
            </div>
        </div>
    )
}

export default Cart
