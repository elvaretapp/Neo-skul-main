// src/hooks/useAuth.js
// Helper untuk verifikasi session ke server

export const getAuthToken = () => localStorage.getItem('auth_token')

// Kirim request dengan token otomatis
export const authFetch = (url, options = {}) => {
    const token = getAuthToken()
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'X-Auth-Token': token || ''
        }
    })
}

// Cek apakah user masih login (verifikasi ke server)
export const verifySession = async () => {
    const token = getAuthToken()
    if (!token) return null

    try {
        const res = await fetch('/api/auth.php', {
            headers: { 'X-Auth-Token': token }
        })
        const data = await res.json()
        if (data.success) return data.user
        // Token tidak valid - bersihkan localStorage
        clearAuth()
        return null
    } catch {
        return null
    }
}

// Hapus semua auth data
export const clearAuth = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user_id')
    localStorage.removeItem('userAvatar')
}

// Logout ke server
export const logout = async () => {
    const token = getAuthToken()
    if (token) {
        await fetch('/api/logout.php', {
            method: 'POST',
            headers: { 'X-Auth-Token': token }
        }).catch(() => {})
    }
    clearAuth()
}
