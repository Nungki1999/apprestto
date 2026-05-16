// File konfigurasi pusat untuk alamat API
// Saat dideploy, Vercel akan membaca VITE_API_URL dari environment variable
// Jika tidak ada, dia akan otomatis menggunakan localhost (untuk komputer Anda)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;
