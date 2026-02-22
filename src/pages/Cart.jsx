import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; // Pastikan CSS ini ada

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Ambil user_id. Pastikan key-nya 'user_id' sesuai Login.jsx
    const userId = localStorage.getItem('user_id'); 

    useEffect(() => {
        // Fungsi Fetch Data
        const fetchCart = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            console.log("Fetching cart for User ID:", userId); // DEBUG 1

            try {
                const response = await fetch(`/api/cart.php?user_id=${userId}`);
                const data = await response.json();
                
                console.log("Data dari API:", data); // DEBUG 2: Cek apakah data masuk?

                if (Array.isArray(data)) {
                    setCartItems(data);
                } else {
                    console.error("Format data salah, bukan array:", data);
                    setCartItems([]);
                }
            } catch (error) {
                console.error("Gagal mengambil keranjang:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [userId]); // Akan jalan ulang jika userId berubah

    // Fungsi Hapus Item
    const handleRemove = async (cartId) => {
        if(!confirm("Hapus item ini?")) return;
        try {
            const response = await fetch('/api/cart.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId })
            });
            if (response.ok) {
                // Refresh halaman manual atau filter state
                setCartItems(cartItems.filter(item => item.cart_id !== cartId));
            }
        } catch (error) { console.error(error); }
    };

    // --- RENDER ---
    if (!userId) {
        return <div className="container section" style={{marginTop:'100px', textAlign:'center'}}>Silakan Login Terlebih Dahulu.</div>;
    }

    if (loading) return <div className="container section" style={{marginTop:'100px', textAlign:'center'}}>Memuat keranjang...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="container section" style={{marginTop: '100px', textAlign: 'center'}}>
                <h2>Keranjang Belanja</h2>
                <p>Keranjang Anda kosong.</p>
                <button onClick={() => navigate('/products')} className="btn-buy" style={{marginTop:'10px', padding:'10px 20px'}}>Belanja Sekarang</button>
            </div>
        );
    }

    const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.price || 0), 0);

    return (
        <div className="container section" style={{marginTop: '100px', minHeight: '60vh'}}>
            <h2>Keranjang Belanja</h2>
            <table style={{width: '100%', marginTop: '20px', borderCollapse: 'collapse'}}>
                <thead>
                    <tr style={{borderBottom: '1px solid #ccc', textAlign: 'left'}}>
                        <th style={{padding: '10px'}}>Produk</th>
                        <th style={{padding: '10px'}}>Harga</th>
                        <th style={{padding: '10px'}}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item, index) => (
                        <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '10px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                    {/* Fallback Image jika gambar error/kosong */}
                                    <img 
                                        src={item.image} 
                                        alt={item.title}
                                        onError={(e) => {e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'}}
                                        style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'6px'}} 
                                    />
                                    <strong>{item.title}</strong>
                                </div>
                            </td>
                            <td style={{padding: '10px'}}>
                                Rp {parseFloat(item.price).toLocaleString('id-ID')}
                            </td>
                            <td style={{padding: '10px'}}>
                                <button 
                                    onClick={() => handleRemove(item.cart_id)}
                                    style={{background: '#ff4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer'}}
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div style={{marginTop: '30px', textAlign: 'right'}}>
                <h3>Total: Rp {totalPrice.toLocaleString('id-ID')}</h3>
                <button 
                    style={{
                        backgroundColor: '#28a745', color: 'white', padding: '12px 30px', 
                        border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginTop: '15px'
                    }}
                    onClick={() => navigate('/checkout')}
                >
                    Bayar Sekarang
                </button>
            </div>
        </div>
    );
};

export default Cart;