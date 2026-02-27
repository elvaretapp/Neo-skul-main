import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Products.css'

function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('All')
    const [detailItem, setDetailItem] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/courses.php');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                const adminProducts = data.filter(p => p.type !== 'course' && p.type !== '');
                setProducts(adminProducts);
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleBuy = async (product) => {
        const userId = localStorage.getItem('user_id');
        if (!userId || userId === 'undefined') {
            alert("Silakan login terlebih dahulu.");
            navigate('/login');
            return;
        }
        try {
            const response = await fetch('/api/cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, course_id: product.id }),
            });
            const result = await response.json();
            if (response.ok) {
                alert("Berhasil masuk keranjang!");
                navigate('/cart');
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi ke server.");
        }
    }

    const filteredProducts = filterType === 'All'
        ? products
        : products.filter(p => p.type === filterType);

    const types = ['All', ...new Set(products.map(p => p.type).filter(Boolean))];

    return (
        <div className="products-page">
            <div className="products-hero">
                <div className="container">
                    <h1>Katalog Produk</h1>
                    <p>Temukan semua materi pembelajaran dan alat edukasi terbaik kami.</p>
                </div>
            </div>

            <div className="container section">
                <div className="products-filter">
                    {types.map((type, index) => (
                        <button
                            key={index}
                            className={`filter-btn ${filterType === type ? 'active' : ''}`}
                            onClick={() => setFilterType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-state">Memuat katalog...</div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map((item) => (
                            <div key={item.id} className="product-card-catalog">
                                <div className="product-img-wrapper">
                                    <img
                                        src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${item.image}`}
                                        alt={item.title}
                                        onError={(e) => { e.target.src = '/assets/images/products/Tamplateedukasi.jpeg' }}
                                    />
                                    <div className="product-tag">{item.type?.toUpperCase()}</div>
                                </div>
                                <div className="product-content">
                                    <h3 className="product-title">{item.title}</h3>
                                    <p className="product-desc">{item.description}</p>
                                    <div className="product-footer">
                                        <span className="product-price">Rp {parseInt(item.price).toLocaleString('id-ID')}</span>
                                        <div style={{display:'flex', gap:'8px'}}>
                                            <button
                                                className="btn-detail"
                                                onClick={() => setDetailItem(item)}
                                            >
                                                Detail
                                            </button>
                                            <button
                                                className="btn-buy"
                                                onClick={() => handleBuy(item)}
                                            >
                                                Beli
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredProducts.length === 0 && !loading && (
                    <p className="empty-state">Tidak ada produk ditemukan.</p>
                )}
            </div>

            {/* MODAL DETAIL */}
            {detailItem && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}
                     onClick={() => setDetailItem(null)}>
                    <div style={{background:'#fff', borderRadius:'16px', maxWidth:'480px', width:'100%', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}
                         onClick={e => e.stopPropagation()}>
                        <img
                            src={`http://localhost:8080/Neo-skul-main/Neo-skul-main${detailItem.image}`}
                            alt={detailItem.title}
                            style={{width:'100%', height:'220px', objectFit:'cover'}}
                            onError={e => e.target.src = '/assets/images/products/Tamplateedukasi.jpeg'}
                        />
                        <div style={{padding:'24px'}}>
                            <span style={{fontSize:'0.78rem', background:'#ede9fe', color:'#6d28d9', padding:'3px 10px', borderRadius:'20px', fontWeight:'700', textTransform:'uppercase'}}>
                                {detailItem.type}
                            </span>
                            <h2 style={{margin:'12px 0 8px', fontSize:'1.3rem', color:'#1e293b'}}>{detailItem.title}</h2>
                            <p style={{color:'#64748b', fontSize:'0.92rem', lineHeight:'1.6', margin:'0 0 16px'}}>{detailItem.description}</p>
                            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                <span style={{fontSize:'1.3rem', fontWeight:'700', color:'#2563eb'}}>
                                    Rp {parseInt(detailItem.price).toLocaleString('id-ID')}
                                </span>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button onClick={() => setDetailItem(null)}
                                        style={{padding:'9px 18px', border:'1.5px solid #e2e8f0', borderRadius:'8px', background:'white', color:'#64748b', cursor:'pointer', fontWeight:'600'}}>
                                        Tutup
                                    </button>
                                    <button onClick={() => { setDetailItem(null); handleBuy(detailItem); }}
                                        style={{padding:'9px 22px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'0.95rem'}}>
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

export default Products