import '../styles/Contact.css'

function Contact() {
    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="container">
                    <h1>Hubungi Kami</h1>
                    <p>Kami siap membantu Anda. Jangan ragu untuk menghubungi kami!</p>
                </div>
            </section>

            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <h2>Informasi Kontak</h2>
                            <div className="contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <h3>Alamat</h3>
                                    <p>Jl. Lidah Wetan Gg. IXB No. 70b, Lakarsantri, Surabaya</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fab fa-whatsapp"></i>
                                <div>
                                    <h3>WhatsApp</h3>
                                    <p>+62 881-9505-545(admin)</p>
                                    <p>Klik tombol berikut untuk bergabung dalam grup.</p>
                                        <button onClick={() => window.open('https://chat.whatsapp.com/BWROjgyoXJq6FDBy2LMOKf?mode=gi_t', '_blank')}>
                                            Bergabung ke Grup
                                        </button>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <h3>Email</h3>
                                    <p>neoscholar.25@gmail.com</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fab fa-instagram"></i>
                                <div>
                                    <h3>Instagram</h3>
                                    <p>neoscholar_id</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fab fa-tiktok"></i>
                                <div>
                                    <h3>TikTok</h3>
                                    <p>neoscholar_</p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-container">
                            <h2>Kirim Pesan</h2>
                            <form className="contact-form">
                                <div className="form-group">
                                    <label>Nama</label>
                                    <input type="text" placeholder="Nama lengkap Anda" required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" placeholder="email@example.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Subjek</label>
                                    <input type="text" placeholder="Subjek pesan" required />
                                </div>
                                <div className="form-group">
                                    <label>Pesan</label>
                                    <textarea rows="5" placeholder="Tulis pesan Anda di sini..." required></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Kirim Pesan</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contact
