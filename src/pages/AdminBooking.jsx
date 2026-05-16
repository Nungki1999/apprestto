import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Phone, 
  Check, 
  X, 
  Clock, 
  Info,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const AdminBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const API_URL = `${API_BASE_URL}/booking`;
  const TOKEN = localStorage.getItem('auth_token');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (id, status) => {
    let rejectionReason = null;

    if (status === 'rejected') {
      const { value: reason } = await Swal.fire({
        title: 'Tolak Reservasi',
        input: 'textarea',
        inputLabel: 'Alasan Penolakan',
        inputPlaceholder: 'Tulis alasan kenapa reservasi ditolak...',
        inputAttributes: { 'aria-label': 'Tulis alasan penolakan' },
        showCancelButton: true,
        confirmButtonText: 'Kirim Penolakan',
        cancelButtonText: 'Batal',
        background: '#1e293b',
        color: '#fff',
        inputValidator: (value) => {
          if (!value) return 'Alasan harus diisi!';
        }
      });

      if (!reason) return; // User cancelled
      rejectionReason = reason;
    } else {
      const confirm = await Swal.fire({
        title: 'Terima Reservasi?',
        text: "Pastikan pelanggan sudah membayar DP atau sudah dikonfirmasi.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Terima!',
        background: '#1e293b',
        color: '#fff'
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: `Booking telah di-${status === 'accepted' ? 'terima' : 'tolak'}`,
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
        });
        fetchBookings();
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem.', background: '#1e293b', color: '#fff' });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 size={16} color="#10b981" />;
      case 'rejected': return <XCircle size={16} color="#ef4444" />;
      default: return <HelpCircle size={16} color="#f59e0b" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'accepted': return 'rgba(16, 185, 129, 0.2)';
      case 'rejected': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(245, 158, 11, 0.2)';
    }
  };

  const filteredBookings = bookings.filter(b => filterStatus === 'all' || b.status === filterStatus);

  return (
    <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Manajemen Reservasi</h1>
            <p style={{ color: 'var(--text-muted)' }}>Kelola booking meja dan pre-order pelanggan</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             {['all', 'pending', 'accepted', 'rejected'].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={filterStatus === s ? 'btn-primary' : 'btn-ghost'}
                  style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                >
                  {s}
                </button>
             ))}
          </div>
        </header>

        {loading ? (
          <p>Memuat data reservasi...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <AnimatePresence>
              {filteredBookings.map(booking => (
                <motion.div 
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card"
                  style={{ borderLeft: `6px solid ${booking.status === 'accepted' ? '#10b981' : booking.status === 'rejected' ? '#ef4444' : '#f59e0b'}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{booking.customerName}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        <Phone size={14} /> {booking.phone}
                        <a href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                          <ExternalLink size={12} color="#3b82f6" />
                        </a>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.4rem 0.8rem', borderRadius: '20px', 
                      background: getStatusBg(booking.status), 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600'
                    }}>
                      {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tanggal & Jam</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} color="#3b82f6" />
                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{new Date(booking.bookingDate).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Jumlah Orang</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={14} color="#10b981" />
                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{booking.guestCount} Orang</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Menu Pre-Order:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {booking.menuItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span>{item.qty}x {item.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Rp {(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>Total Bayar:</span>
                      <span style={{ fontWeight: 'bold' }}>Rp {parseFloat(booking.totalPrice).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      <span>Deposit (DP 20%):</span>
                      <span style={{ fontWeight: 'bold' }}>Rp {parseFloat(booking.depositAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  {booking.status === 'rejected' && booking.rejectionReason && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <p style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={14} /> Alasan Penolakan:
                      </p>
                      <p style={{ color: 'var(--text-muted)' }}>{booking.rejectionReason}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => handleAction(booking.id, 'rejected')}
                        className="btn-ghost" 
                        style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <X size={18} /> Tolak
                      </button>
                      <button 
                        onClick={() => handleAction(booking.id, 'accepted')}
                        className="btn-primary" 
                        style={{ flex: 1, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Check size={18} /> Terima (ACC)
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredBookings.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                <Calendar size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Tidak ada data reservasi.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBooking;
