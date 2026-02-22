import { useState } from 'react'
import '../styles/Carousel.css'

function Carousel({ items }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
    }

    const goToSlide = (index) => {
        setCurrentIndex(index)
    }

    return (
        <div className="carousel">
            <div className="carousel-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {items.map((item, index) => (
                    <div key={index} className="carousel-item">
                        <div className="card">
                            <img src={item.image} alt={item.title} className="carousel-img" />
                            <div className="carousel-content">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <div className="product-price">{item.price}</div>
                                <a href="#" className="btn btn-primary">Lihat Detail</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="carousel-controls">
                {items.map((_, index) => (
                    <div
                        key={index}
                        className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    ></div>
                ))}
            </div>
            <div className="carousel-arrows">
                <button className="carousel-prev" onClick={prevSlide}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <button className="carousel-next" onClick={nextSlide}>
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    )
}

export default Carousel
