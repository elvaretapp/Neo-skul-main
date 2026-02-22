import '../styles/Categories.css'

function Categories() {
    const categories = [
        {
            icon: 'fa-vr-cardboard',
            title: 'AR/VR',
            description: 'Pelajari materi dengan pengalaman imersif melalui teknologi augmented dan virtual reality.',
            count: '50+ Produk'
        },
        {
            icon: 'fa-robot',
            title: 'Robot',
            description: 'Kembangkan keterampilan coding dan engineering dengan kit robot interaktif.',
            count: '30+ Produk'
        },
        {
            icon: 'fa-book',
            title: 'E-book',
            description: 'Akses ribuan e-book premium dengan materi yang selalu diperbarui.',
            count: '500+ E-books'
        },
        {
            icon: 'fa-video',
            title: 'Video Pembelajaran',
            description: 'Tonton video pembelajaran berkualitas tinggi dari mentor profesional.',
            count: '200+ Video'
        },
        {
            icon: 'fa-gamepad',
            title: 'Game Edukasi',
            description: 'Belajar sambil bermain dengan game edukasi yang menyenangkan.',
            count: '40+ Games'
        },
        {
            icon: 'fa-chalkboard-teacher',
            title: 'Les Privat',
            description: 'Dapatkan bimbingan personal dari mentor berpengalaman.',
            count: '100+ Mentor'
        }
    ]

    return (
        <div className="categories-page">
            <section className="categories-hero">
                <div className="container">
                    <h1>Kategori Pembelajaran</h1>
                    <p>Jelajahi berbagai kategori media pembelajaran yang kami sediakan</p>
                </div>
            </section>

            <section className="categories-content">
                <div className="container">
                    <div className="categories-grid-page">
                        {categories.map((category, index) => (
                            <div key={index} className="category-card-page">
                                <div className="category-icon-container">
                                    <i className={`fas ${category.icon} category-icon-large`}></i>
                                </div>
                                <h3>{category.title}</h3>
                                <p>{category.description}</p>
                                <div className="category-count">{category.count}</div>
                                <a href="#" className="btn btn-secondary">Jelajahi</a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Categories
