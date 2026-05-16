import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Phone, 
  Utensils, 
  ChevronRight, 
  Star, 
  MapPin, 
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const Landing = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    bookingDate: '',
    guestCount: 1,
    menuChoices: [],
    notes: ''
  });
  const [notes, setNotes] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuSectionRef = useRef(null);

  const API_URL = API_BASE_URL;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/public/menu`);
        const data = await res.json();
        if (Array.isArray(data)) setMenuItems(data);
      } catch (err) {
        console.error("Gagal ambil menu:", err);
      }
    };
    fetchMenu();
  }, []);

  const scrollToMenu = () => {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMenuChoice = (menu) => {
    const exists = formData.menuChoices.find(m => m.id === menu.id);
    if (exists) {
      setFormData({
        ...formData,
        menuChoices: formData.menuChoices.filter(m => m.id !== menu.id)
      });
    } else {
      setFormData({
        ...formData,
        menuChoices: [...formData.menuChoices, { id: menu.id, name: menu.name, price: parseFloat(menu.price), qty: 1 }]
      });
    }
  };

  const updateMenuQty = (id, qty) => {
    setFormData({
      ...formData,
      menuChoices: formData.menuChoices.map(m => m.id === id ? { ...m, qty: Math.max(1, qty) } : m)
    });
  };

  const totalPrice = formData.menuChoices.reduce((sum, m) => sum + (m.price * m.qty), 0);
  const depositAmount = totalPrice * 0.2;

  const handleMidtransDP = async (bookingId) => {
    try {
      const response = await fetch(`${API_URL}/payment/create-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      const data = await response.json();
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: () => {
            Swal.fire({ icon: 'success', title: 'DP Berhasil Dibayar!', text: 'Reservasi Anda telah dikonfirmasi otomatis.', background: '#1e293b', color: '#fff' });
          },
          onPending: () => {
            Swal.fire({ icon: 'info', title: 'Menunggu Pembayaran', text: 'Segera selesaikan pembayaran DP Anda.', background: '#1e293b', color: '#fff' });
          }
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.menuChoices.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Pilih Menu', text: 'Mohon pilih minimal satu menu.', background: '#1e293b', color: '#fff' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/booking/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          menuItems: formData.menuChoices,
          totalPrice
        })
      });

      const data = await response.json();

      if (response.ok) {
        const result = await Swal.fire({
          icon: 'success',
          title: 'Reservasi Diajukan!',
          background: '#1e293b',
          color: '#fff',
          html: `
            <div style="text-align: left">
              <p>Halo <b>${formData.customerName}</b>, reservasi Anda berhasil dicatat.</p>
              <p>Untuk konfirmasi instan, silakan bayar DP sebesar:</p>
              <h2 style="color: #3b82f6; margin: 10px 0">Rp ${depositAmount.toLocaleString()}</h2>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Bayar QRIS Sekarang',
          cancelButtonText: 'Bayar Nanti (Manual)',
          confirmButtonColor: '#3b82f6'
        });

        if (result.isConfirmed) {
          await handleMidtransDP(data.booking.id);
        }
        
        setShowBooking(false);
        setFormData({ customerName: '', phone: '', bookingDate: '', guestCount: 1, menuChoices: [], notes: '' });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message, background: '#1e293b', color: '#fff' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.', background: '#1e293b', color: '#fff' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section style={{ 
        height: '90vh', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2070") center/cover',
          opacity: 0.3, zIndex: 0
        }}></div>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, transparent, #0f172a)', zIndex: 1
        }}></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'relative', zIndex: 2, maxWidth: '800px', padding: '0 2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '1px', background: '#3b82f6' }}></div>
            <span style={{ textTransform: 'uppercase', fontSize: '0.875rem', color: '#3b82f6', fontWeight: 'bold' }}>Premium Dining Experience</span>
            <div style={{ width: '40px', height: '1px', background: '#3b82f6' }}></div>
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: '1.1' }}>
            Nikmati Kelezatan <br/> <span style={{ color: '#3b82f6' }}>Tanpa Menunggu.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Pesan meja dan menu favorit Anda jauh-jauh hari. Reservasi instan dengan sistem deposit aman.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setShowBooking(true)}
              style={{ 
                padding: '1.25rem 2.5rem', background: '#3b82f6', color: '#fff', 
                borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'
              }}
            >
              Reservasi Sekarang <ChevronRight size={20} />
            </button>
            <button 
              onClick={scrollToMenu}
              style={{ 
                padding: '1.25rem 2.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff', 
                borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Lihat Menu
            </button>
          </div>
        </motion.div>
      </section>

      {/* Menu Section */}
      <section ref={menuSectionRef} style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Daftar Menu Kami</h2>
          <p style={{ color: '#94a3b8' }}>Pilih menu terbaik untuk menemani waktu santai Anda</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {menuItems.map(menu => (
            <motion.div 
              key={menu.id}
              whileHover={{ y: -10 }}
              style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <img src={menu.imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{menu.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', height: '40px', overflow: 'hidden' }}>{menu.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#3b82f6' }}>Rp {parseFloat(menu.price).toLocaleString()}</span>
                  <button onClick={() => setShowBooking(true)} style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Pesan Meja</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              style={{ 
                background: '#1e293b', width: '100%', maxWidth: '1000px', 
                maxHeight: '95vh', overflowY: 'auto', borderRadius: '2rem',
                position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button 
                onClick={() => setShowBooking(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                {/* Modal Left: Form */}
                <div style={{ padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#3b82f6' }}>Form Reservasi</h2>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nama Lengkap</label>
                      <input 
                        type="text" required placeholder="Masukkan nama..."
                        style={{ width: '100%', padding: '0.875rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nomor WhatsApp</label>
                      <input 
                        type="tel" required placeholder="0812..."
                        style={{ width: '100%', padding: '0.875rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Tanggal & Jam</label>
                        <input 
                          type="datetime-local" required
                          style={{ width: '100%', padding: '0.875rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                          value={formData.bookingDate}
                          onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Jumlah Tamu</label>
                        <input 
                          type="number" min="1" required
                          style={{ width: '100%', padding: '0.875rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                          value={formData.guestCount}
                          onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Catatan</label>
                      <textarea 
                        rows="2" placeholder="Tuliskan jika ada permintaan khusus..."
                        style={{ width: '100%', padding: '0.875rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      ></textarea>
                    </div>

                    <div style={{ marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Pre-Order:</span>
                        <span style={{ fontWeight: 'bold' }}>Rp {totalPrice.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6' }}>
                        <span style={{ fontWeight: 'bold' }}>Wajib DP (20%):</span>
                        <span style={{ fontWeight: '900', fontSize: '1.25rem' }}>Rp {depositAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={isLoading}
                      style={{ 
                        width: '100%', padding: '1rem', background: '#3b82f6', color: '#fff', 
                        borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                        fontSize: '1.1rem', opacity: isLoading ? 0.5 : 1
                      }}
                    >
                      {isLoading ? 'Mengirim...' : 'Kirim Pengajuan Reservasi'}
                    </button>
                  </form>
                </div>

                {/* Modal Right: Menu Selection */}
                <div style={{ padding: '2.5rem', background: 'rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Utensils size={24} color="#3b82f6" /> Pilih Menu Pre-Order
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {menuItems.length > 0 ? menuItems.map(menu => {
                      const selected = formData.menuChoices.find(m => m.id === menu.id);
                      return (
                        <div 
                          key={menu.id}
                          onClick={() => toggleMenuChoice(menu)}
                          style={{ 
                            padding: '0.875rem', background: selected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)', 
                            borderRadius: '1rem', border: selected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'center'
                          }}
                        >
                          <img src={menu.imageUrl} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '600' }}>{menu.name}</h4>
                            <p style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>Rp {parseFloat(menu.price).toLocaleString()}</p>
                          </div>
                          {selected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                               <button 
                                 onClick={() => updateMenuQty(menu.id, selected.qty - 1)}
                                 style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer' }}
                               >-</button>
                               <span style={{ minWidth: '20px', textAlign: 'center' }}>{selected.qty}</span>
                               <button 
                                 onClick={() => updateMenuQty(menu.id, selected.qty + 1)}
                                 style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer' }}
                               >+</button>
                            </div>
                          )}
                        </div>
                      )
                    }) : <p style={{ color: '#94a3b8' }}>Memuat menu...</p>}
                  </div>
                  <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '1rem', fontSize: '0.8rem', color: '#94a3b8', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                     <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: 'bold' }}>
                        <AlertCircle size={14} /> Kebijakan Reservasi:
                     </p>
                     <ul style={{ paddingLeft: '1.25rem' }}>
                        <li>Booking valid jika sudah dikonfirmasi admin.</li>
                        <li>Wajib bayar DP 20% segera setelah pengajuan.</li>
                        <li>Slot waktu terbatas untuk kenyamanan Anda.</li>
                     </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>&copy; 2024 RestoApp Premium POS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
