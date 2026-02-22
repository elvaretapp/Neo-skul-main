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
                                    <p>Jl. Pendidikan No. 123, Jakarta</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <h3>Telepon</h3>
                                    <p>+62 812 3456 7890</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <h3>Email</h3>
                                    <p>info@neoscholar.id</p>
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
