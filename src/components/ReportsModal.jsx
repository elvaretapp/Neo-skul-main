import { useState } from 'react'
import '../styles/ReportsModal.css'

function ReportsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview')

    if (!isOpen) return null

    // Sample data
    const monthlyData = [
        { month: 'Jan', users: 120, revenue: 15000000, courses: 8 },
        { month: 'Feb', users: 145, revenue: 18500000, courses: 10 },
        { month: 'Mar', users: 178, revenue: 22000000, courses: 12 },
        { month: 'Apr', users: 210, revenue: 28000000, courses: 15 },
        { month: 'May', users: 245, revenue: 32000000, courses: 18 },
        { month: 'Jun', users: 289, revenue: 45200000, courses: 20 }
    ]

    const topCourses = [
        { title: 'AR Learning - Struktur Bumi', students: 234, revenue: 'Rp 35.1M', rating: 4.9 },
        { title: 'Video Pembelajaran Animasi 2D', students: 156, revenue: 'Rp 19.5M', rating: 4.8 },
        { title: 'Board Game Edukasi', students: 145, revenue: 'Rp 12.3M', rating: 4.7 }
    ]

    const topMentors = [
        { name: 'Jane Smith', students: 89, courses: 5, rating: 4.9 },
        { name: 'Debbi Angelia', students: 67, courses: 4, rating: 4.8 },
        { name: 'Jawad At-Taqy', students: 54, courses: 3, rating: 4.7 }
    ]

    return (
        <div className="reports-modal-overlay" onClick={onClose}>
            <div className="reports-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="reports-modal-header">
                    <div>
                        <h2><i className="fas fa-chart-line"></i> Analytics & Reports</h2>
                        <p>Platform insights and performance metrics</p>
                    </div>
                    <button className="reports-close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="reports-tabs">
                    <button
                        className={`reports-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="fas fa-chart-pie"></i> Overview
                    </button>
                    <button
                        className={`reports-tab ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        <i className="fas fa-dollar-sign"></i> Revenue
                    </button>
                    <button
                        className={`reports-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <i className="fas fa-users"></i> Users
                    </button>
                    <button
                        className={`reports-tab ${activeTab === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        <i className="fas fa-trophy"></i> Performance
                    </button>
                </div>

                {/* Content */}
                <div className="reports-modal-body">
                    {activeTab === 'overview' && (
                        <div className="reports-section">
                            <h3>Platform Overview</h3>

                            {/* Key Metrics */}
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-icon blue">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="metric-info">
                                        <h4>Total Users</h4>
                                        <p className="metric-value">1,234</p>
                                        <span className="metric-change positive">+12% from last month</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon green">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <div className="metric-info">
                                        <h4>Total Revenue</h4>
                                        <p className="metric-value">Rp 45.2M</p>
                                        <span className="metric-change positive">+18% from last month</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon purple">
                                        <i className="fas fa-book"></i>
                                    </div>
                                    <div className="metric-info">
                                        <h4>Active Courses</h4>
                                        <p className="metric-value">128</p>
                                        <span className="metric-change positive">+8 new courses</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon orange">
                                        <i className="fas fa-star"></i>
                                    </div>
                                    <div className="metric-info">
                                        <h4>Avg. Rating</h4>
                                        <p className="metric-value">4.8</p>
                                        <span className="metric-change positive">+0.2 improvement</span>
                                    </div>
                                </div>
                            </div>

                            {/* Growth Chart */}
                            <div className="chart-container">
                                <h4>Monthly Growth</h4>
                                <div className="bar-chart">
                                    {monthlyData.map((data, index) => (
                                        <div key={index} className="bar-item">
                                            <div className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{ height: `${(data.users / 300) * 100}%` }}
                                                >
                                                    <span className="bar-value">{data.users}</span>
                                                </div>
                                            </div>
                                            <span className="bar-label">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="reports-section">
                            <h3>Revenue Analytics</h3>

                            <div className="revenue-summary">
                                <div className="revenue-card">
                                    <h4>This Month</h4>
                                    <p className="revenue-amount">Rp 45.2M</p>
                                    <span className="revenue-trend up">↑ 18% vs last month</span>
                                </div>
                                <div className="revenue-card">
                                    <h4>This Year</h4>
                                    <p className="revenue-amount">Rp 245M</p>
                                    <span className="revenue-trend up">↑ 25% vs last year</span>
                                </div>
                                <div className="revenue-card">
                                    <h4>Average/User</h4>
                                    <p className="revenue-amount">Rp 198K</p>
                                    <span className="revenue-trend up">↑ 5% increase</span>
                                </div>
                            </div>

                            <div className="revenue-chart">
                                <h4>Revenue Trend (6 Months)</h4>
                                <div className="line-chart">
                                    {monthlyData.map((data, index) => (
                                        <div key={index} className="line-item">
                                            <div className="line-point" style={{ bottom: `${(data.revenue / 50000000) * 100}%` }}>
                                                <span className="point-value">Rp {(data.revenue / 1000000).toFixed(1)}M</span>
                                            </div>
                                            <span className="line-label">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="reports-section">
                            <h3>User Analytics</h3>

                            <div className="user-stats">
                                <div className="stat-item">
                                    <i className="fas fa-user-graduate"></i>
                                    <div>
                                        <h4>Students</h4>
                                        <p>1,089 (88%)</p>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                    <div>
                                        <h4>Mentors</h4>
                                        <p>45 (4%)</p>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <i className="fas fa-user-shield"></i>
                                    <div>
                                        <h4>Admins</h4>
                                        <p>8 (1%)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="top-list">
                                <h4>Top Mentors</h4>
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Students</th>
                                            <th>Courses</th>
                                            <th>Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topMentors.map((mentor, index) => (
                                            <tr key={index}>
                                                <td><strong>{mentor.name}</strong></td>
                                                <td>{mentor.students}</td>
                                                <td>{mentor.courses}</td>
                                                <td>⭐ {mentor.rating}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="reports-section">
                            <h3>Performance Metrics</h3>

                            <div className="top-list">
                                <h4>Top Performing Courses</h4>
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Students</th>
                                            <th>Revenue</th>
                                            <th>Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topCourses.map((course, index) => (
                                            <tr key={index}>
                                                <td><strong>{course.title}</strong></td>
                                                <td>{course.students}</td>
                                                <td>{course.revenue}</td>
                                                <td>⭐ {course.rating}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="performance-indicators">
                                <div className="indicator">
                                    <h4>Course Completion Rate</h4>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: '78%' }}>78%</div>
                                    </div>
                                </div>
                                <div className="indicator">
                                    <h4>Student Satisfaction</h4>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: '92%' }}>92%</div>
                                    </div>
                                </div>
                                <div className="indicator">
                                    <h4>Mentor Response Rate</h4>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: '85%' }}>85%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="reports-modal-footer">
                    <button className="btn-export">
                        <i className="fas fa-download"></i> Export Report
                    </button>
                    <button className="btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportsModal
