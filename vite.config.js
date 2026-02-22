import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    root: './',
    // Pastikan folder 'assets' ada di root proyek Anda. 
    // Jika aset ada di dalam 'src/assets', hapus baris publicDir ini atau ubah ke 'public'.
    publicDir: 'assets', 
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 3005,
        // Tambahkan konfigurasi proxy ini
        proxy: {
            '/api': {
                // Ganti 'neo-scholar' sesuai nama folder proyek Anda di htdocs
                target: 'http://localhost:8080/Neo-skul-main/Neo-skul-main', 
                changeOrigin: true,
                secure: false,
            }
        }
    }
})