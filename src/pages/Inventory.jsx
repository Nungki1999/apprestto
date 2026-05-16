import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Truck, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Plus,
  Search,
  Filter,
  History,
  X,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactionType, setTransactionType] = useState('IN'); // 'IN' or 'OUT'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const API_STOCK_URL = 'http://localhost:5000/api/stock/items';
  const API_MOVE_URL = 'http://localhost:5000/api/stock/movements';
  const TOKEN = localStorage.getItem('auth_token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, movesRes] = await Promise.all([
        fetch(API_STOCK_URL, { headers: { 'Authorization': `Bearer ${TOKEN}` } }),
        fetch(API_MOVE_URL, { headers: { 'Authorization': `Bearer ${TOKEN}` } })
      ]);

      const itemsData = await itemsRes.json();
      const movesData = await movesRes.json();

      setItems(itemsData);
      setTransactions(movesData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransaction = async () => {
    if (!selectedItem || !amount) return;

    try {
      const response = await fetch(API_MOVE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          stockItemId: selectedItem.id,
          movementType: transactionType.toLowerCase(),
          qty: parseFloat(amount),
          notes: note
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Stok Terupdate',
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
        });
        fetchData();
        setShowModal(false);
        setAmount('');
        setNote('');
      } else {
        const err = await response.json();
        Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, background: '#1e293b', color: '#fff' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Koneksi bermasalah', background: '#1e293b', color: '#fff' });
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Manajemen Stok</h1>
            <p style={{ color: 'var(--text-muted)' }}>Pantau dan kelola bahan baku restoran</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Tambah Bahan Baru
          </button>
        </header>

        {loading ? (
          <p>Memuat data stok...</p>
        ) : (
          <>
            {/* Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#3b82f6' }}>
                  <Package size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Bahan</p>
                  <h3 style={{ fontWeight: 'bold' }}>{items.length} Jenis</h3>
                </div>
              </div>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#ef4444' }}>
                  <ArrowDownCircle size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stok Menipis</p>
                  <h3 style={{ fontWeight: 'bold' }}>{items.filter(i => parseFloat(i.currentStock) <= parseFloat(i.minimumStock)).length} Bahan</h3>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 'bold' }}>Daftar Bahan Baku</h3>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Nama Bahan</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Stok Current</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Min. Stok</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ padding: '1rem' }}>{item.currentStock} {item.unit}</td>
                      <td style={{ padding: '1rem' }}>{item.minimumStock} {item.unit}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ 
                          display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem',
                          background: parseFloat(item.currentStock) <= parseFloat(item.minimumStock) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: parseFloat(item.currentStock) <= parseFloat(item.minimumStock) ? '#ef4444' : '#10b981'
                        }}>
                          {parseFloat(item.currentStock) <= parseFloat(item.minimumStock) ? 'Perlu Order' : 'Aman'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => { setSelectedItem(item); setTransactionType('IN'); setShowModal(true); }}
                            className="btn-ghost" 
                            style={{ padding: '0.4rem', borderRadius: '6px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                          >
                            <PlusCircle size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedItem(item); setTransactionType('OUT'); setShowModal(true); }}
                            className="btn-ghost" 
                            style={{ padding: '0.4rem', borderRadius: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            <MinusCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transaction History Section */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <History size={20} color="var(--primary)" />
                <h3 style={{ fontWeight: 'bold' }}>Riwayat Transaksi Stok</h3>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Waktu</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Nama Bahan</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Tipe</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Jumlah</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(trx => (
                    <tr key={trx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {new Date(trx.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{trx.stockItem.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          color: trx.movementType === 'in' ? '#10b981' : '#ef4444',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}>
                          {trx.movementType.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        {trx.movementType === 'in' ? '+' : '-'}{trx.qty} {trx.stockItem.unit}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        {trx.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Transaction Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card"
                style={{ width: '400px', padding: '2rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 'bold' }}>Update Stok: {selectedItem?.name}</h3>
                  <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Jenis Transaksi</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setTransactionType('IN')}
                      className={transactionType === 'IN' ? 'btn-primary' : 'btn-ghost'}
                      style={{ flex: 1, fontSize: '0.875rem' }}
                    >
                      Stok Masuk (+)
                    </button>
                    <button 
                      onClick={() => setTransactionType('OUT')}
                      className={transactionType === 'OUT' ? 'btn-primary' : 'btn-ghost'}
                      style={{ flex: 1, fontSize: '0.875rem', background: transactionType === 'OUT' ? '#ef4444' : 'transparent' }}
                    >
                      Stok Keluar (-)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Jumlah ({selectedItem?.unit})</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Catatan</label>
                  <textarea 
                    className="input-field" 
                    rows="3"
                    placeholder="Alasan update stok..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>Batal</button>
                  <button onClick={handleTransaction} className="btn-primary" style={{ flex: 1 }}>Simpan</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Inventory;
