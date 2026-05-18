// File konfigurasi pusat untuk alamat API
// Saat dideploy, Vercel akan membaca VITE_API_URL dari environment variable
// Jika tidak ada, dia akan otomatis menggunakan localhost (untuk komputer Anda)

let apiBase = import.meta.env.VITE_API_URL || 'https://apiresto-orpin.vercel.app/api';

// 1. Bersihkan jika ada garis miring '/' di ujung URL untuk mencegah double-slash '//'
if (apiBase.endsWith('/')) {
  apiBase = apiBase.slice(0, -1);
}

// 2. Pastikan URL selalu diakhiri dengan '/api' (agar tidak terjadi 404)
if (!apiBase.endsWith('/api')) {
  apiBase = apiBase + '/api';
}

const API_BASE_URL = apiBase;

export default API_BASE_URL;


