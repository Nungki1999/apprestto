import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode,
  Receipt,
  ChevronLeft,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const Cashier = () => {
  const [categories, setCategories] = useState(['Semua']);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemNotes, setItemNotes] = useState('');

  const API_MENU_URL = `${API_BASE_URL}/menu`;
  const API_ORDER_URL = `${API_BASE_URL}/order`;
  const API_PAYMENT_URL = `${API_BASE_URL}/payment`;
  const TOKEN = localStorage.getItem('auth_token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_MENU_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const data = await response.json();
      setMenuItems(data);
      
      const cats = ['Semua', ...new Set(data.map(m => m.category.name))];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (item, notes = '') => {
    setCart([...cart, { 
      ...item, 
      cartId: Date.now(),
      qty: 1, 
      notes: notes 
    }]);
    setSelectedItem(null);
    setItemNotes('');
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(i => i.cartId !== cartId));
  };

  const updateQty = (cartId, delta) => {
    setCart(cart.map(i => {
      if (i.cartId === cartId) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredMenu = menuItems.filter(item => {
    const matchCategory = activeCategory === 'Semua' || item.category.name === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleMidtransPayment = async (orderId) => {
    try {
      const response = await fetch(`${API_PAYMENT_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            Swal.fire({ icon: 'success', title: 'Pembayaran Sukses!', background: '#1e293b', color: '#fff' });
            setCart([]);
          },
          onPending: (result) => {
            Swal.fire({ icon: 'info', title: 'Menunggu Pembayaran', text: 'Silakan selesaikan pembayaran QRIS Anda.', background: '#1e293b', color: '#fff' });
            setCart([]);
          },
          onError: (result) => {
            Swal.fire({ icon: 'error', title: 'Pembayaran Gagal', background: '#1e293b', color: '#fff' });
          },
          onClose: () => {
            Swal.fire({ 
              title: 'Pembayaran Ditunda', 
              text: 'Apakah ingin mengganti ke pembayaran Tunai?', 
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Tetap QRIS',
              cancelButtonText: 'Batal / Ganti Tunai',
              background: '#1e293b', 
              color: '#fff' 
            }).then(res => {
              if (!res.isConfirmed) {
                // Keep cart if they want to change something
              } else {
                setCart([]); // Clear cart if they will finish QRIS later
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Midtrans Error:", error);
      Swal.fire({ icon: 'error', title: 'Gagal memuat pembayaran online', background: '#1e293b', color: '#fff' });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // 1. Choose Payment Method First
    const { value: method } = await Swal.fire({
      title: 'Pilih Metode Pembayaran',
      background: '#1e293b',
      color: '#fff',
      showCancelButton: true,
      cancelButtonText: 'Kembali',
      showDenyButton: true,
      confirmButtonText: '<i class="fa fa-money-bill"></i> Tunai (Cash)',
      denyButtonText: '<i class="fa fa-qrcode"></i> QRIS / Online',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#3b82f6',
    });

    if (method === undefined) return; // User clicked Cancel

    const selectedMethod = method ? 'CASH' : 'QRIS';

    try {
      const orderPayload = {
        branchId: localStorage.getItem('branch_id'),
        orderType: 'dine_in',
        status: selectedMethod === 'CASH' ? 'paid' : 'pending',
        items: cart.map(i => ({
          menuId: i.id,
          qty: i.qty,
          price: parseFloat(i.price),
          notes: i.notes
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        notes: `Pembayaran ${selectedMethod}`
      };

      const response = await fetch(API_ORDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await response.json();

      if (response.ok) {
        if (selectedMethod === 'QRIS') {
          await handleMidtransPayment(orderData.id);
        } else {
          Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil!', 
            text: 'Pesanan Tunai telah dicatat dan lunas.', 
            background: '#1e293b', 
            color: '#fff',
            timer: 2000,
            showConfirmButton: false
          });
          setCart([]);
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: orderData.message, background: '#1e293b', color: '#fff' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops', text: 'Gagal menghubungi server.', background: '#1e293b', color: '#fff' });
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
        
        {/* Left: Menu Section */}
        <div style={{ flex: 1 }}>
          <header style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
              <input 
                type="text" 
                placeholder="Cari menu..." 
                className="input-field" 
                style={{ paddingLeft: '3rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? 'btn-primary' : 'btn-ghost'}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1.25rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <p>Memuat menu...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
              {filteredMenu.map(item => (
                <motion.div 
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedItem(item)}
                  className="glass-card"
                  style={{ padding: '0.75rem', cursor: 'pointer' }}
                >
                  <div style={{ 
                    width: '100%', height: '120px', borderRadius: '0.75rem', 
                    overflow: 'hidden', marginBottom: '0.75rem' 
                  }}>
                    <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem', height: '2.5rem', overflow: 'hidden' }}>{item.name}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Rp {parseFloat(item.price).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Cart Section */}
        <div className="glass-card" style={{ width: '380px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ShoppingCart size={24} />
            <h3 style={{ fontWeight: 'bold' }}>Keranjang</h3>
            <span style={{ 
              marginLeft: 'auto', background: 'var(--primary)', 
              padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' 
            }}>{cart.length} Item</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
            <AnimatePresence>
              {cart.map(item => (
                <motion.div 
                  key={item.cartId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ 
                    display: 'flex', gap: '0.75rem', marginBottom: '1rem', 
                    paddingBottom: '1rem', borderBottom: '1px solid var(--border)' 
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.name}</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rp {parseFloat(item.price).toLocaleString()}</p>
                    {item.notes && <p style={{ fontSize: '0.7rem', color: '#f59e0b', fontStyle: 'italic' }}>* {item.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQty(item.cartId, -1)} style={{ padding: '0.25rem', background: 'var(--glass)', borderRadius: '4px', border: 'none', color: 'white' }}><Minus size={14}/></button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.cartId, 1)} style={{ padding: '0.25rem', background: 'var(--glass)', borderRadius: '4px', border: 'none', color: 'white' }}><Plus size={14}/></button>
                    <button onClick={() => removeFromCart(item.cartId)} style={{ color: '#ef4444', marginLeft: '0.5rem', background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pajak (10%)</span>
              <span>Rp {tax.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>Rp {total.toLocaleString()}</span>
            </div>
          </div>
          
          <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }} onClick={handleCheckout}>
            <Receipt size={20} /> Konfirmasi & Bayar
          </button>
        </div>
      </main>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card" style={{ width: '400px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold' }}>{selectedItem.name}</h3>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <img src={selectedItem.imageUrl || 'https://via.placeholder.com/150'} style={{ width: '100%', height: '180px', borderRadius: '1rem', objectFit: 'cover', marginBottom: '1.5rem' }} />
              <textarea className="input-field" rows="3" placeholder="Catatan..." value={itemNotes} onChange={(e) => setItemNotes(e.target.value)}></textarea>
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} onClick={() => addToCart(selectedItem, itemNotes)}>Tambah ke Keranjang</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cashier;
