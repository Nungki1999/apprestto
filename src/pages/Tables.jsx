import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Printer, 
  Trash2, 
  Edit2, 
  LayoutGrid, 
  Maximize2,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = `${API_BASE_URL}/table`;
  const TOKEN = localStorage.getItem('auth_token');

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handlePrintQR = (table) => {
    const printWindow = window.open('', '_blank');
    const qrUrl = `${API_BASE_URL}/table/${table.id}/qr-image`;
    const frontendUrl = window.location.origin; // Otomatis mengikuti URL Vercel nanti
    const customerUrl = `${frontendUrl}/menu/${table.id}`; 

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Meja ${table.tableNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; text-align: center; padding: 40px; }
            .card { border: 2px solid #000; padding: 40px; display: inline-block; border-radius: 20px; }
            .qr-code { width: 300px; height: 300px; margin-bottom: 20px; }
            .table-num { fontSize: 48px; font-weight: bold; margin: 0; }
            .instruction { color: #666; margin-top: 10px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="table-num">MEJA ${table.tableNumber}</h1>
            <img src="${qrUrl}" class="qr-code" onload="window.print();" />
            <p class="instruction">Scan untuk melihat menu & pesan</p>
          </div>
          <br/>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Cetak Sekarang</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddTable = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Meja Baru',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Nomor Meja (Contoh: 01)">
        <input id="swal-input2" type="number" class="swal2-input" placeholder="Kapasitas (Contoh: 4)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      background: '#1e293b',
      color: '#fff',
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    });

    if (formValues && formValues[0] && formValues[1]) {
      try {
        const branchId = localStorage.getItem('branch_id');
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({
            tableNumber: formValues[0],
            capacity: parseInt(formValues[1]),
            status: 'available',
            branchId: branchId
          })
        });

        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Meja berhasil ditambahkan', background: '#1e293b', color: '#fff' });
          fetchTables();
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menambah meja', background: '#1e293b', color: '#fff' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Manajemen Meja</h1>
            <p style={{ color: 'var(--text-muted)' }}>Atur meja dan cetak kode QR untuk pesanan pelanggan</p>
          </div>
          <button className="btn-primary" onClick={handleAddTable} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Tambah Meja
          </button>
        </header>

        {loading ? (
          <p>Memuat data meja...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {tables.map(table => (
              <motion.div 
                key={table.id}
                whileHover={{ y: -5 }}
                className="glass-card"
                style={{ textAlign: 'center', padding: '1.5rem' }}
              >
                <div style={{ 
                  width: '60px', height: '60px', background: 'rgba(59, 130, 246, 0.1)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', color: '#3b82f6'
                }}>
                  <LayoutGrid size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Meja {table.tableNumber}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Kapasitas: {table.capacity} Orang</p>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button 
                     onClick={() => handlePrintQR(table)}
                     style={{ 
                       flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #3b82f6', 
                       color: '#3b82f6', background: 'transparent', cursor: 'pointer',
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                       fontSize: '0.75rem', fontWeight: '600'
                     }}
                   >
                     <Printer size={16} /> QR
                   </button>
                   <button 
                     style={{ 
                       padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', 
                       color: '#ef4444', background: 'transparent', cursor: 'pointer'
                     }}
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tables.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Belum ada data meja. Silakan tambah meja baru.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tables;
