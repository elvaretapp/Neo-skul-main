import { useState } from 'react'
import '../styles/MentorApplicationForm.css'

function MentorApplicationForm({ onClose, onSuccess }) {
    const userId = localStorage.getItem('user_id')
    const storedUsername = localStorage.getItem('username')

    const [formData, setFormData] = useState({
        name: storedUsername || '',
        phone: '',
        expertise: '',
        experience: '',
        instagram: '',
        linkedin: '',
        cv_link: '',
        reason: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi'
        if (!formData.phone.trim()) newErrors.phone = 'No HP wajib diisi'
        if (!formData.expertise.trim()) newErrors.expertise = 'Bidang keahlian wajib diisi'
        if (!formData.experience) newErrors.experience = 'Pengalaman wajib diisi'
        if (!formData.cv_link.trim()) newErrors.cv_link = 'Link CV wajib diisi'
        if (!formData.reason.trim()) newErrors.reason = 'Alasan wajib diisi'
        if (formData.reason.trim().length < 50) newErrors.reason = 'Alasan minimal 50 karakter'
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/mentor_applications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_id: userId })
            })
            const result = await response.json()

            if (result.success) {
                onSuccess()
            } else {
                alert(result.message || 'Gagal mengirim lamaran')
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-modal-overlay" onClick={onClose}>
            <div className="app-modal-box" onClick={e => e.stopPropagation()}>
                <div className="app-modal-header">
                    <div>
                        <h2>Daftar Jadi Mentor</h2>
                        <p>Isi formulir berikut untuk mengajukan diri sebagai mentor NeoScholar</p>
                    </div>
                    <button className="app-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>

                <form onSubmit={handleSubmit} className="app-form">
                    <div className="app-form-grid">

                        {/* Nama */}
                        <div className={`app-form-group ${errors.name ? 'has-error' : ''}`}>
                            <label><i className="fas fa-user"></i> Nama Lengkap <span className="required">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama lengkap Anda" />
                            {errors.name && <span className="error-msg">{errors.name}</span>}
                        </div>

                        {/* No HP */}
                        <div className={`app-form-group ${errors.phone ? 'has-error' : ''}`}>
                            <label><i className="fas fa-phone"></i> No. HP / WhatsApp <span className="required">*</span></label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Contoh: 6281234567890" />
                            {errors.phone && <span className="error-msg">{errors.phone}</span>}
                        </div>

                        {/* Bidang Keahlian */}
                        <div className={`app-form-group ${errors.expertise ? 'has-error' : ''}`}>
                            <label><i className="fas fa-graduation-cap"></i> Bidang Keahlian / Mata Pelajaran <span className="required">*</span></label>
                            <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} placeholder="Contoh: Matematika, Bahasa Inggris, Pemrograman" />
                            {errors.expertise && <span className="error-msg">{errors.expertise}</span>}
                        </div>

                        {/* Pengalaman */}
                        <div className={`app-form-group ${errors.experience ? 'has-error' : ''}`}>
                            <label><i className="fas fa-briefcase"></i> Pengalaman Mengajar <span className="required">*</span></label>
                            <select name="experience" value={formData.experience} onChange={handleChange}>
                                <option value="">-- Pilih --</option>
                                <option value="0">Belum ada pengalaman</option>
                                <option value="1">1 tahun</option>
                                <option value="2">2 tahun</option>
                                <option value="3">3 tahun</option>
                                <option value="4">4 tahun</option>
                                <option value="5">5+ tahun</option>
                            </select>
                            {errors.experience && <span className="error-msg">{errors.experience}</span>}
                        </div>

                        {/* Instagram */}
                        <div className="app-form-group">
                            <label><i className="fab fa-instagram"></i> Instagram <span className="optional">(opsional)</span></label>
                            <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" />
                        </div>

                        {/* LinkedIn */}
                        <div className="app-form-group">
                            <label><i className="fab fa-linkedin"></i> LinkedIn <span className="optional">(opsional)</span></label>
                            <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                        </div>

                        {/* CV Link - full width */}
                        <div className={`app-form-group full-width ${errors.cv_link ? 'has-error' : ''}`}>
                            <label><i className="fab fa-google-drive"></i> Link CV (Google Drive) <span className="required">*</span></label>
                            <input type="url" name="cv_link" value={formData.cv_link} onChange={handleChange} placeholder="https://drive.google.com/..." />
                            <small>Pastikan link CV bisa diakses oleh siapapun yang memiliki link</small>
                            {errors.cv_link && <span className="error-msg">{errors.cv_link}</span>}
                        </div>

                        {/* Alasan - full width */}
                        <div className={`app-form-group full-width ${errors.reason ? 'has-error' : ''}`}>
                            <label><i className="fas fa-comment-alt"></i> Alasan Ingin Menjadi Mentor <span className="required">*</span></label>
                            <textarea name="reason" value={formData.reason} onChange={handleChange} rows="5" placeholder="Ceritakan mengapa Anda ingin menjadi mentor, apa yang ingin Anda ajarkan, dan bagaimana Anda bisa berkontribusi untuk siswa NeoScholar... (min. 50 karakter)"></textarea>
                            <small style={{textAlign:'right', display:'block'}}>{formData.reason.length} karakter</small>
                            {errors.reason && <span className="error-msg">{errors.reason}</span>}
                        </div>

                    </div>

                    <div className="app-form-footer">
                        <button type="button" className="btn-cancel-app" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn-submit-app" disabled={loading}>
                            {loading ? <><i className="fas fa-spinner fa-spin"></i> Mengirim...</> : <><i className="fas fa-paper-plane"></i> Kirim Lamaran</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MentorApplicationForm
