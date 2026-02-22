import { useState } from 'react'
import '../styles/SearchModal.css'

function SearchModal({ isOpen, onClose, searchType, query }) {
    const mockResults = {
        general: [
            { id: 1, title: 'Video Pembelajaran Animasi 2D', type: 'Kursus', price: 'Rp 1.250.000' },
            { id: 2, title: 'AR Learning - Struktur Bumi', type: 'Kursus', price: 'Rp 899.000' },
            { id: 3, title: 'Board Game Edukasi', type: 'Produk', price: 'Rp 1.750.000' },
            { id: 4, title: 'E-book Mengenal Angka', type: 'E-book', price: 'Rp 150.000' },
            { id: 5, title: 'Template Edukasi PowerPoint', type: 'Template', price: 'Rp 250.000' },
        ],
        ai: [
            { id: 1, question: query, answer: 'Berdasarkan pertanyaan Anda, saya merekomendasikan untuk mempelajari konsep dasar terlebih dahulu. Anda bisa memulai dengan kursus "Pengenalan Dasar" yang tersedia di platform kami.' },
            { id: 2, question: 'Materi terkait', answer: 'Berikut adalah beberapa materi yang relevan dengan pertanyaan Anda: 1) Video Tutorial Dasar, 2) E-book Panduan Lengkap, 3) Konsultasi dengan Mentor.' },
        ]
    }

    const results = mockResults[searchType] || []

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {searchType === 'general' ? 'Hasil Pencarian' : 'Hasil Konsultasi AI'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {query && (
                        <div className="search-query">
                            <strong>Pencarian:</strong> "{query}"
                        </div>
                    )}

                    {searchType === 'general' ? (
                        <div className="search-results">
                            {results.map((result) => (
                                <div key={result.id} className="result-item">
                                    <div className="result-icon">
                                        <i className="fas fa-book"></i>
                                    </div>
                                    <div className="result-info">
                                        <h3>{result.title}</h3>
                                        <p className="result-type">{result.type}</p>
                                        <p className="result-price">{result.price}</p>
                                    </div>
                                    <button className="btn btn-sm btn-primary">Lihat Detail</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="ai-results">
                            {results.map((result) => (
                                <div key={result.id} className="ai-response">
                                    <div className="ai-icon">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                    <div className="ai-content">
                                        <p>{result.answer}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="ai-actions">
                                <button className="btn btn-secondary">
                                    <i className="fas fa-redo"></i> Tanya Lagi
                                </button>
                                <button className="btn btn-primary">
                                    <i className="fas fa-user"></i> Hubungi Mentor
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchModal
