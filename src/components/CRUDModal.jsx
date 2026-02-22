import { useState, useEffect } from "react";
import "../styles/CRUDModal.css";

function CRUDModal({ isOpen, onClose, mode, type, data, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "", // Di React kita pakai 'name' untuk input
    email: "",
    role: "client",
    status: "active",
    title: "",
    description: "",
    price: "",
    image: null,
    type: "",
  });

  useEffect(() => {
    if (data && (mode === "edit" || mode === "delete")) {
      setFormData({
        ...data,
        // PERBAIKAN: Mapping 'username' dari database ke 'name' di form
        name: data.name || data.username || "", 
        image: null,
        type: data.type || data.category || "",
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
            {mode === "create" ? "Add" : mode === "edit" ? "Edit" : "Delete"}{" "}
            {type === "user" ? "User" : "Course"}
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
                /* --- FORM COURSE (TIDAK BERUBAH) --- */
                <>
                  <div className="form-group">
                    <label>Course Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      onChange={(e) => /^\d*$/.test(e.target.value) && handleChange(e)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} required>
                      <option value="" disabled>Select Type</option>
                      <option value="ar-vr">AR/VR</option>
                      <option value="animation">Animation</option>
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Course Image (Upload)</label>
                    <input type="file" name="image" onChange={handleChange} accept="image/*" className="file-input" />
                  </div>
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