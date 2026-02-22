import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css'; // Import CSS baru

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [proofFile, setProofFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');

    // Load data keranjang
    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        
        const fetchCart = async () => {
            try {
                // Pastikan URL API sesuai dengan nama folder di htdocs (neo-scholar atau neo-skul)
                const response = await fetch(`/api/cart.php?user_id=${userId}`);
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setCartItems(data);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error("Gagal load cart:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchCart();
    }, [userId, navigate]);

    // Hitung Total
    const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.price), 0);

    // Handle File Upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handle Submit Checkout
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            alert("Keranjang belanja Anda kosong.");
            return;
        }

        if (!proofFile) {
            alert("Harap upload bukti transfer terlebih dahulu!");
            return;
        }

        if(!confirm("Apakah Anda yakin data pembayaran sudah benar?")) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('total_amount', totalPrice);
        formData.append('proof', proofFile);
        
        // Mapping data agar sesuai struktur database (course_id & price)
        const itemsPayload = cartItems.map(item => ({
            course_id: item.course_id || item.product_id || item.id,
            price: item.price
        }));
        formData.append('items', JSON.stringify(itemsPayload));

        try {
            const response = await fetch('/api/checkout.php', {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert("Checkout Berhasil! Transaksi Anda sedang diverifikasi admin.");
                navigate('/dashboard');
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return <div className="checkout-page"><div className="checkout-container" style={{textAlign:'center'}}>Memuat data...</div></div>;
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h2 className="checkout-title">Konfirmasi Pembayaran</h2>
                
                <form onSubmit={handleSubmit} className="checkout-grid">
                    
                    {/* BAGIAN KIRI: RINGKASAN PESANAN */}
                    <div className="checkout-card order-summary-card">
                        <h3>Ringkasan Pesanan</h3>
                        
                        {cartItems.length === 0 ? (
                            <p className="empty-msg">Keranjang kosong.</p>
                        ) : (
                            <ul className="order-list">
                                {cartItems.map((item, index) => (
                                    <li key={index} className="order-item">
                                        <div className="item-info">
                                            <h4>{item.title}</h4>
                                            <small style={{color:'#777'}}>Materi Digital</small>
                                        </div>
                                        <span className="item-price">
                                            Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="order-total">
                            <span className="total-label">Total Tagihan</span>
                            <span className="total-amount">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: FORM PEMBAYARAN */}
                    <div className="checkout-card payment-card">
                        <h3>Metode Pembayaran</h3>
                        
                        {/* Kartu Bank Visual */}
                        <div className="bank-card">
                            <span className="bank-logo">BANK BCA</span>
                            <span className="bank-number">1234 5678 9000</span>
                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'15px'}}>
                                <span className="bank-name">a.n. Neo Scholar Corp</span>
                                <span className="bank-expiry">CODE: 014</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <p style={{fontSize:'0.9rem', color:'#555', lineHeight:'1.5', marginBottom:'20px'}}>
                                Silakan transfer sesuai nominal total ke rekening di atas, lalu upload bukti screenshot transfer Anda di bawah ini untuk verifikasi.
                            </p>

                            <label className="form-label">Upload Bukti Transfer</label>
                            
                            {/* Area Upload Custom */}
                            <label htmlFor="proof-upload" className="upload-area">
                                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                                <div className="upload-text">
                                    {proofFile ? "Ganti File" : "Klik atau seret file ke sini"}
                                </div>
                                <input 
                                    id="proof-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    style={{display:'none'}} 
                                />
                            </label>

                            {/* Preview Gambar */}
                            {preview && (
                                <div className="file-preview">
                                    <img src={preview} alt="Preview" className="preview-img" />
                                    <div className="file-info">
                                        <strong>{proofFile.name}</strong>
                                        <br/>
                                        <small>{(proofFile.size / 1024).toFixed(0)} KB</small>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="btn-checkout" 
                            disabled={loading || cartItems.length === 0}
                        >
                            {loading ? 'Memproses...' : `Bayar Rp ${totalPrice.toLocaleString('id-ID')}`}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Checkout;