import '../styles/About.css'

function About() {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <h1>Tentang NeoScholar</h1>
                    <p>Platform Edukasi Masa Depan</p>
                </div>
            </section>

            <section className="about-content">
                <div className="container">
                    <div className="about-section">
                        <h2>Visi Kami</h2>
                        <p>
                            Menjadi platform edukasi terdepan yang menghubungkan teknologi inovatif dengan pembelajaran berkualitas,
                            mempersiapkan generasi masa depan dengan keterampilan yang relevan dan komprehensif.
                        </p>
                    </div>

                    <div className="about-section">
                        <h2>Misi Kami</h2>
                        <ul>
                            <li>Menyediakan akses ke teknologi pembelajaran terkini seperti AR/VR dan robotika</li>
                            <li>Menghubungkan siswa dengan mentor profesional dan berpengalaman</li>
                            <li>Menciptakan ekosistem pembelajaran yang interaktif dan engaging</li>
                            <li>Mendukung pengembangan keterampilan abad 21</li>
                        </ul>
                    </div>

                    <div className="about-section">
                        <h2>Mengapa NeoScholar?</h2>
                        <div className="features-grid">
                            <div className="feature-item">
                                <i className="fas fa-graduation-cap"></i>
                                <h3>Mentor Profesional</h3>
                                <p>Belajar dari para ahli di bidangnya</p>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-vr-cardboard"></i>
                                <h3>Teknologi Terkini</h3>
                                <p>AR/VR dan media pembelajaran inovatif</p>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-certificate"></i>
                                <h3>Sertifikasi</h3>
                                <p>Dapatkan sertifikat untuk setiap pencapaian</p>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-users"></i>
                                <h3>Komunitas</h3>
                                <p>Bergabung dengan ribuan pelajar lainnya</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About
