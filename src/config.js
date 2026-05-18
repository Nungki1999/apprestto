// File konfigurasi pusat untuk alamat API
// Saat dideploy, Vercel akan membaca VITE_API_URL dari environment variable
// Jika tidak ada, dia akan otomatis menggunakan localhost (untuk komputer Anda)

let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Bersihkan jika ada garis miring '/' di ujung URL untuk mencegah double-slash '//'
if (apiBase.endsWith('/')) {
  apiBase = apiBase.slice(0, -1);
}

const API_BASE_URL = apiBase;

export default API_BASE_URL;

