import { useState, useEffect } from "react";
import "../styles/CRUDModal.css";

function CRUDModal({ isOpen, onClose, mode, type, subType = 'product', data, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "client",
    status: "active",
    title: "",
    description: "",
    price: "",
    image: null,
    type: "",
    drive_link: "",
    wa_group: "",
    wa_mentor: "",
    schedule_days: "",
    schedule_time: "",
  });

  useEffect(() => {
    if (data && (mode === "edit" || mode === "delete")) {
      setFormData({
        ...data,
        name: data.name || data.username || "", 
        image: null,
        type: data.type || data.category || "",
        price: data.price ? Math.round(data.price) : "",
        drive_link: data.drive_link || "",
        wa_group: data.wa_group || "",
        wa_mentor: data.wa_mentor || "",
        schedule_days: data.schedule_days || "",
        schedule_time: data.schedule_time || "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        email: "",
        role: "client",
        status: "active",
        title: "",
        description: "",
        price: "",
        image: null,
        type: "",
        drive_link: "",
        wa_group: "",
        wa_mentor: "",
        schedule_days: "",
        schedule_time: "",
      });
    }
  }, [data, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kembalikan 'name' form menjadi 'username' agar sesuai database saat disimpan
    const payload = { ...formData, username: formData.name };
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="crud-modal-overlay" onClick={onClose}>
      <div className="crud-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="crud-modal-header">
          <h2>
            {mode === "create" ? "Tambah" : mode === "edit" ? "Edit" : "Hapus"}{" "}
            {type === "user" ? "User" : subType === 'product' ? "Produk Pembelajaran" : "Kursus"}
          </h2>
          <button className="crud-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {mode === "delete" ? (
          <div className="crud-modal-body">
            <p>Are you sure you want to delete <strong>{formData.name || formData.title}</strong>?</p>
            <div className="delete-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="btn-delete" onClick={() => { onSave(data); onClose(); }}>Delete</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="crud-modal-body">
              {/* --- PERBAIKAN: FORM USER DITAMBAHKAN DI SINI --- */}
              {type === "user" ? (
                <>
                  <div className="form-group">
                    <label>Full Name / Username</label>
                    <input
                      type="text"
                      name="name" // State tetap 'name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                      <option value="client">Client</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {/* Status opsional jika ada di DB */}
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              ) : (
                /* --- FORM PRODUK / KURSUS --- */
                <>
                  <div className="form-group">
                    <label>Judul</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Harga (Rp)</label>
                    <input type="number" name="price" value={formData.price} min="0" required onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Tipe</label>
                    <select name="type" value={formData.type} onChange={handleChange} required>
                      <option value="" disabled>-- Pilih Tipe --</option>
                      {subType === 'product' ? (
                        <>
                          <option value="ebook">E-Book</option>
                          <option value="vr">AR/VR</option>
                          <option value="game">Game Edukasi</option>
                        </>
                      ) : (
                        <option value="course">Course / Jadwal</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gambar</label>
                    <input type="file" name="image" onChange={handleChange} accept="image/*" className="file-input" />
                  </div>
                  {subType === 'product' ? (
                    <div className="form-group">
                      <label><i className="fab fa-google-drive" style={{marginRight:'6px', color:'#4285f4'}}></i>Link Google Drive (Materi)</label>
                      <input type="url" name="drive_link" value={formData.drive_link || ''} onChange={handleChange} placeholder="https://drive.google.com/..." />
                    </div>
                  ) : (
                    <>
                      {/* JADWAL PER HARI */}
                      <div className="form-group">
                        <label><i className="fas fa-calendar-alt" style={{marginRight:'6px', color:'#2563eb'}}></i>Jadwal Pertemuan</label>
                        <p style={{fontSize:'0.78rem', color:'#94a3b8', margin:'2px 0 10px'}}>Klik hari untuk mengaktifkan, lalu atur jam mulai & selesai</p>
                        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                          {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(hari => {
                            // Parse schedule_days sebagai JSON
                            let scheduleObj = {}
                            try { scheduleObj = JSON.parse(formData.schedule_days || '{}') } catch(e) {}
                            const isActive = !!scheduleObj[hari]

                            const toggleHari = () => {
                              let obj = {}
                              try { obj = JSON.parse(formData.schedule_days || '{}') } catch(e) {}
                              if (obj[hari]) {
                                delete obj[hari]
                              } else {
                                obj[hari] = { mulai: '08:00', selesai: '10:00' }
                              }
                              setFormData(prev => ({ ...prev, schedule_days: JSON.stringify(obj) }))
                            }

                            const updateJam = (field, val) => {
                              let obj = {}
                              try { obj = JSON.parse(formData.schedule_days || '{}') } catch(e) {}
                              if (obj[hari]) obj[hari][field] = val
                              setFormData(prev => ({ ...prev, schedule_days: JSON.stringify(obj) }))
                            }

                            return (
                              <div key={hari} style={{border: isActive ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0', borderRadius:'10px', overflow:'hidden'}}>
                                <div
                                  onClick={toggleHari}
                                  style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', cursor:'pointer', background: isActive ? '#eff6ff' : '#f8fafc', userSelect:'none'}}
                                >
                                  <div style={{width:'20px', height:'20px', borderRadius:'50%', border: isActive ? '2px solid #2563eb' : '2px solid #cbd5e1', background: isActive ? '#2563eb' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                    {isActive && <i className="fas fa-check" style={{color:'white', fontSize:'10px'}}></i>}
                                  </div>
                                  <span style={{fontWeight: isActive ? '700' : '500', color: isActive ? '#1d4ed8' : '#475569', fontSize:'0.9rem'}}>{hari}</span>
                                </div>
                                {isActive && (() => {
                                  let obj = {}
                                  try { obj = JSON.parse(formData.schedule_days || '{}') } catch(e) {}
                                  return (
                                    <div style={{display:'flex', gap:'12px', alignItems:'center', padding:'10px 14px', background:'#f0f9ff', borderTop:'1px solid #bae6fd'}}>
                                      <span style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'600', minWidth:'30px'}}>Mulai</span>
                                      <input type="time" value={obj[hari]?.mulai || '08:00'} onChange={e => updateJam('mulai', e.target.value)}
                                        style={{border:'1px solid #bae6fd', borderRadius:'6px', padding:'5px 8px', fontSize:'0.88rem', color:'#0c4a6e'}} />
                                      <span style={{color:'#94a3b8'}}>—</span>
                                      <span style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'600', minWidth:'40px'}}>Selesai</span>
                                      <input type="time" value={obj[hari]?.selesai || '10:00'} onChange={e => updateJam('selesai', e.target.value)}
                                        style={{border:'1px solid #bae6fd', borderRadius:'6px', padding:'5px 8px', fontSize:'0.88rem', color:'#0c4a6e'}} />
                                    </div>
                                  )
                                })()}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="form-group">
                        <label><i className="fab fa-whatsapp" style={{marginRight:'6px', color:'#25d366'}}></i>Link WA Grup</label>
                        <input type="url" name="wa_group" value={formData.wa_group || ''} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." />
                      </div>
                      <div className="form-group">
                        <label><i className="fab fa-whatsapp" style={{marginRight:'6px', color:'#25d366'}}></i>Link WA Mentor</label>
                        <input type="url" name="wa_mentor" value={formData.wa_mentor || ''} onChange={handleChange} placeholder="https://wa.me/628..." />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="crud-modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-save">Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CRUDModal;