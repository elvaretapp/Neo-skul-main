import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CRUDModal from '../components/CRUDModal'
import ReportsModal from '../components/ReportsModal'
import '../styles/Dashboard.css'
import '../styles/AdminDashboard.css'

function AdminDashboard({ setIsLoggedIn }) {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // CRUD Modal States
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create') // create, edit, delete
    const [modalType, setModalType] = useState('user') // user, course
    const [selectedData, setSelectedData] = useState(null)

    // Reports Modal State
    const [showReportsModal, setShowReportsModal] = useState(false)

    // Data States
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [mentorApplications, setMentorApplications] = useState([]) // State untuk aplikasi mentor

    // Validasi Checkout
    const [transactions, setTransactions] = useState([]);

    // untuk ambil data transaksi
    useEffect(() => {
    fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
    try {
        const res = await fetch('/api/admin_transactions.php');
        const data = await res.json();
        setTransactions(data);
    } catch (error) {
        console.error("Gagal load transaksi", error);
    }
    };

    const handleUpdateStatus = async (id, newStatus) => {
    if(!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
        const res = await fetch('/api/admin_transactions.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ transaction_id: id, status: newStatus })
        });
        const result = await res.json();
        if(result.success) {
            alert("Status diperbarui!");
            fetchTransactions(); // Refresh data
        }
    } catch (error) {
        console.error(error);
    }
    };



    // Load data from API on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Fungsi fetch yang aman: Jika gagal, return array kosong agar tidak error
            const safeFetch = async (url) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) return [];
                    const text = await res.text();
                    try {
                        const json = JSON.parse(text);
                        // Jika API return error object (bukan array), anggap kosong
                        if (json.message && !Array.isArray(json)) return [];
                        return Array.isArray(json) ? json : [];
                    } catch (e) {
                        console.error(`Error parsing JSON from ${url}`, e);
                        return [];
                    }
                } catch (error) {
                    console.error(`Network error ${url}`, error);
                    return [];
                }
            };

            // Ambil semua data secara paralel
            const [usersData, coursesData, appsData] = await Promise.all([
                safeFetch(`/api/users.php?t=${Date.now()}`),
                safeFetch(`/api/courses.php?t=${Date.now()}`),
                safeFetch(`/api/mentor_applications.php?t=${Date.now()}`)
            ]);

            setUsers(usersData);
            setCourses(coursesData);
            setMentorApplications(appsData);

            setIsLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const userLoggedIn = localStorage.getItem('userLoggedIn')
        const userRole = localStorage.getItem('userRole')
        const storedUsername = localStorage.getItem('username')

        if (!userLoggedIn || userLoggedIn !== 'true') {
            navigate('/login')
        } else if (userRole !== 'admin') {
            alert('Akses Ditolak. Halaman ini hanya untuk Admin.');
            navigate(userRole === 'mentor' ? '/mentor/dashboard' : '/dashboard')
        } else {
            setUsername(storedUsername || 'Admin')
        }
    }, [navigate])

    // --- PERHITUNGAN STATISTIK ---
    const totalUsers = users.length;
    const activeMentors = users.filter(u => u.role === 'mentor').length;
    const pendingMentors = mentorApplications.length;
    const totalCourses = courses.length;
    const totalRevenue = courses.reduce((acc, curr) => {
        return acc + (parseFloat(curr.price) || 0);
    }, 0);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    }

    // --- FUNGSI CRUD (User & Course) ---
    const handleCreateUser = () => { setModalMode('create'); setModalType('user'); setSelectedData(null); setShowModal(true); }
    const handleEditUser = (user) => { setModalMode('edit'); setModalType('user'); setSelectedData(user); setShowModal(true); }
    const handleDeleteUser = (user) => { setModalMode('delete'); setModalType('user'); setSelectedData(user); setShowModal(true); }

    const handleCreateCourse = () => { setModalMode('create'); setModalType('course'); setSelectedData(null); setShowModal(true); }
    const handleEditCourse = (course) => { setModalMode('edit'); setModalType('course'); setSelectedData(course); setShowModal(true); }
    const handleDeleteCourse = (course) => { setModalMode('delete'); setModalType('course'); setSelectedData(course); setShowModal(true); }

    // --- FUNGSI APPROVE/REJECT MENTOR ---
    const handleApplicationStatus = async (id, status) => {
        const actionText = status === 'approved' ? 'menyetujui' : 'menolak';
        if (!window.confirm(`Apakah Anda yakin ingin ${actionText} pengajuan ini?`)) return;

        try {
            const response = await fetch('/api/mentor_applications.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                // Refresh data aplikasi
                const refreshApps = await fetch(`/api/mentor_applications.php?t=${Date.now()}`);
                const appsData = await refreshApps.json();
                setMentorApplications(Array.isArray(appsData) ? appsData : []);
                
                // Jika diapprove, refresh juga data user karena role berubah jadi mentor
                if (status === 'approved') {
                    const refreshUsers = await fetch(`/api/users.php?t=${Date.now()}`);
                    const usersData = await refreshUsers.json();
                    setUsers(Array.isArray(usersData) ? usersData : []);
                }
            } else {
                alert('Gagal: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Terjadi kesalahan koneksi.');
        }
    };

    // --- FUNGSI SIMPAN MODAL ---
    const handleSave = async (data) => {
        try {
            let endpoint = modalType === 'user' ? 'users' : 'courses';
            let url = `/api/${endpoint}.php`; 
            let options = {};

            if (modalType === 'course') {
                if (modalMode === 'delete') {
                     options = {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: data.id })
                    };
                } else {
                    // Pakai FormData untuk Course (karena ada upload file)
                    const formData = new FormData();
                    if (data.id) formData.append('id', data.id);
                    
                    formData.append('title', data.title);
                    formData.append('description', data.description);
                    formData.append('price', data.price);
                    formData.append('type', data.type); 
                    
                    const currentUserId = localStorage.getItem('userId') || '1';
                    formData.append('mentor_id', currentUserId);

                    if (data.image instanceof File) {
                        formData.append('image', data.image);
                    }

                    options = {
                        method: 'POST',
                        body: formData
                    };
                }
            } 
            else {
                // Pakai JSON untuk User
                if (modalMode === 'delete') {
                     options = {
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: data.id, action: 'delete' }) 
                    };
                    if (modalMode === 'delete') url += `?id=${data.id}`;
                    options = { method: 'DELETE' };

                } else {
                    options = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    };
                }
            }

            const response = await fetch(url, options);
            const responseText = await response.text();
            
            try {
                const jsonRes = JSON.parse(responseText);
                if (response.ok) {
                    // Refresh data setelah save
                    const refreshRes = await fetch(`/api/${endpoint}.php?t=${Date.now()}`);
                    const refreshData = await refreshRes.json();

                    if (modalType === 'user') setUsers(Array.isArray(refreshData) ? refreshData : []);
                    else setCourses(Array.isArray(refreshData) ? refreshData : []);

                    setShowModal(false);
                } else {
                    alert('Gagal: ' + (jsonRes.message || 'Terjadi kesalahan'));
                }
            } catch (e) {
                console.error("Error parsing JSON:", e);
                alert('Terjadi kesalahan server.');
            }
        } catch (error) {
            console.error("Error saving data:", error);
            alert('Terjadi kesalahan koneksi server.');
        }
    }

    if (isLoading) return <div className="dashboard-loading"><div className="spinner"></div><p>Memuat Data Dashboard...</p></div>;

    return (
        <div className="dashboard admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="container">
                    <div className="dashboard-welcome">
                        <h1>Admin Dashboard 🛡️</h1>
                        <p>Selamat datang, {username}! Kelola platform NeoScholar dengan mudah</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                <div className="container">
                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-users"></i></div>
                            <div className="stat-info"><h3>{totalUsers}</h3><p>Total Users</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                            <div className="stat-info"><h3>{activeMentors}</h3><p>Active Mentors</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-file-signature"></i></div>
                            <div className="stat-info"><h3>{pendingMentors}</h3><p>Pending Mentors</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-dollar-sign"></i></div>
                            <div className="stat-info"><h3>{formatRupiah(totalRevenue)}</h3><p>Est. Total Nilai Kursus</p></div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-section full-width">
                        <div className="section-header"><h2>Quick Actions</h2></div>
                        <div className="quick-actions-grid">
                            <div className="quick-action-card" onClick={handleCreateUser}>
                                <div className="quick-action-icon"><i className="fas fa-user-plus"></i></div>
                                <h3 className="quick-action-title">Add User</h3>
                                <p className="quick-action-desc">Create new user account</p>
                            </div>
                            <div className="quick-action-card" onClick={handleCreateCourse}>
                                <div className="quick-action-icon"><i className="fas fa-book-medical"></i></div>
                                <h3 className="quick-action-title">Add Course</h3>
                                <p className="quick-action-desc">Create new course</p>
                            </div>
                            <div className="quick-action-card" onClick={() => document.getElementById('mentor-applications').scrollIntoView({ behavior: 'smooth' })}>
                                <div className="quick-action-icon"><i className="fas fa-user-tie"></i></div>
                                <h3 className="quick-action-title">Review Mentors</h3>
                                <p className="quick-action-desc">Check {pendingMentors} pending apps</p>
                            </div>
                            <div className="quick-action-card" onClick={() => setShowReportsModal(true)}>
                                <div className="quick-action-icon"><i className="fas fa-chart-line"></i></div>
                                <h3 className="quick-action-title">View Reports</h3>
                                <p className="quick-action-desc">Analytics & insights</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="dashboard-grid">


                        {/* --- SECTION 1: KONFIRMASI PEMBAYARAN (TRANSAKSI) --- */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2><i className="fas fa-money-check-alt" style={{marginRight:'10px'}}></i> Konfirmasi Pembayaran</h2>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <p style={{color: '#666', fontStyle: 'italic'}}>Belum ada transaksi baru.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Kursus / Item</th>
                                    <th>Total Bayar</th>
                                    <th>Bukti TF</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((trx) => (
                                    <tr key={trx.id}>
                                        <td>
                                            <strong>{trx.username}</strong><br/>
                                            <small style={{color:'#777'}}>{trx.email}</small>
                                        </td>
                                        <td>
                                            {/* Menampilkan list kursus jika ada, atau '-' */}
                                            <div style={{maxWidth:'200px', fontSize:'0.9rem'}}>
                                                {trx.course_names || 'Pembelian Paket'}
                                            </div>
                                        </td>
                                        <td style={{fontWeight:'bold', color:'#1a237e'}}>
                                            Rp {parseFloat(trx.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td>
                                            {trx.proof_image ? (
                                                <a href={`${trx.proof_image}`} target="_blank" rel="noreferrer">
                                                    <img 
                                                        src={`${trx.proof_image}`} 
                                                        alt="Bukti" 
                                                        className="proof-thumb"
                                                        title="Klik untuk memperbesar"
                                                    />
                                                </a>
                                            ) : (
                                                <span style={{color:'#999'}}>Tidak ada</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${trx.status}`}>
                                                {trx.status}
                                            </span>
                                        </td>
                                        <td>
                                            {trx.status === 'pending' && (
                                                <div className="action-buttons">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(trx.id, 'approved')}
                                                        className="btn-action btn-approve"
                                                        title="Terima Pembayaran"
                                                    >
                                                        <i className="fas fa-check"></i> Terima
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(trx.id, 'rejected')}
                                                        className="btn-action btn-reject"
                                                        title="Tolak Pembayaran"
                                                    >
                                                        <i className="fas fa-times"></i> Tolak
                                                    </button>
                                                </div>
                                            )}
                                            {trx.status !== 'pending' && (
                                                <span style={{color:'#777', fontSize:'0.9rem'}}>Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                        
                        {/* TABEL APLIKASI MENTOR (BARU) */}
                        <div className="dashboard-section full-width" id="mentor-applications">
                            <div className="admin-card">
                                <div className="admin-card-header">
                                    <div className="admin-card-title"><i className="fas fa-envelope-open-text"></i> Mentor Applications</div>
                                </div>
                                <div className="admin-table">
                                    {mentorApplications.length === 0 ? (
                                        <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Tidak ada pengajuan mentor baru.</p>
                                    ) : (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>User Name</th>
                                                    <th>Email</th>
                                                    <th>Date Applied</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mentorApplications.map((app) => (
                                                    <tr key={app.id}>
                                                        <td><strong>{app.name}</strong></td>
                                                        <td>{app.email}</td>
                                                        <td>{new Date(app.created_at).toLocaleDateString('id-ID')}</td>
                                                        <td>
                                                            <button 
                                                                className="btn-sm btn-success" 
                                                                style={{ marginRight: '8px' }}
                                                                onClick={() => handleApplicationStatus(app.id, 'approved')}
                                                            >
                                                                <i className="fas fa-check"></i> Approve
                                                            </button>
                                                            <button 
                                                                className="btn-sm btn-danger"
                                                                onClick={() => handleApplicationStatus(app.id, 'rejected')}
                                                            >
                                                                <i className="fas fa-times"></i> Reject
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Management */}
                        <div className="dashboard-section">
                            <div className="admin-card">
                                <div className="admin-card-header">
                                    <div className="admin-card-title"><i className="fas fa-users"></i> User Management</div>
                                    <button className="btn-sm btn-success" onClick={handleCreateUser}><i className="fas fa-plus"></i> Add User</button>
                                </div>
                                <div className="admin-table">
                                    <table>
                                        <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td><strong>{user.name || user.username}</strong><br /><small style={{ color: '#718096' }}>{user.email}</small></td>
                                                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                                                    <td><span className={`status-${user.status || 'active'}`}>{user.status || 'Active'}</span></td>
                                                    <td>
                                                        <button className="btn-sm" onClick={() => handleEditUser(user)} style={{ marginRight: '8px' }}>Edit</button>
                                                        <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(user)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Course Management */}
                        <div className="dashboard-section">
                            <div className="admin-card">
                                <div className="admin-card-header">
                                    <div className="admin-card-title"><i className="fas fa-book"></i> Course Management</div>
                                    <button className="btn-sm btn-success" onClick={handleCreateCourse}><i className="fas fa-plus"></i> Add Course</button>
                                </div>
                                <div className="courses-list">
                                    {courses.map((course) => (
                                        <div key={course.id} className="course-item">
                                            <img
                                                src={`${course.image}?t=${Date.now()}`}
                                                alt={course.title}
                                                onError={(e) => { 
                                                    e.target.onerror = null; 
                                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image'; 
                                                }}
                                                style={{ 
                                                    width: '80px', 
                                                    height: '80px', 
                                                    objectFit: 'cover', 
                                                    borderRadius: '8px', 
                                                    border: '1px solid #eee' 
                                                }}
                                            />
                                            <div className="course-info">
                                                <h3>{course.title}</h3>
                                                <p className="course-stats">
                                                    <strong>{formatRupiah(course.price)}</strong>
                                                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '8px' }}>({course.type})</span>
                                                </p>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                    <button className="btn-sm" onClick={() => handleEditCourse(course)}>Edit</button>
                                                    <button className="btn-sm btn-danger" onClick={() => handleDeleteCourse(course)}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CRUDModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                mode={modalMode}
                type={modalType}
                data={selectedData}
                onSave={handleSave}
            />

            <ReportsModal
                isOpen={showReportsModal}
                onClose={() => setShowReportsModal(false)}
            />

            

        </div>

    )
}

export default AdminDashboard