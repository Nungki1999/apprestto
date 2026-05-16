import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { 
  Info, 
  Plus, 
  Minus, 
  ShoppingCart, 
  MessageSquare, 
  ChevronLeft,
  Star,
  Bell,
  CreditCard,
  Banknote,
  Utensils
} from 'lucide-react';
import API_BASE_URL from '../config';

const CustomerQR = () => {
  const { tableId } = useParams();
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemNotes, setItemNotes] = useState('');
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL_PUBLIC = `${API_BASE_URL}/public`;
  const API_PAYMENT_URL = `${API_BASE_URL}/payment`;
  const BASIC_AUTH = btoa('resto_public:public12345');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tableRes = await fetch(`${API_BASE_URL}/table/${tableId}`, {
          headers: { 'Authorization': `Basic ${BASIC_AUTH}` }
        });
        const tableData = await tableRes.json();
        setTableInfo(tableData);

        const menuRes = await fetch(`${API_BASE_URL}/menu`, {
          headers: { 'Authorization': `Basic ${BASIC_AUTH}` }
        });
        const menuData = await menuRes.json();
        setMenuItems(menuData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tableId) fetchData();
  }, [tableId]);

  const addToCart = (item) => {
    setCart([...cart, { 
      menuId: item.id, 
      name: item.name, 
      price: parseFloat(item.price), 
      qty: 1, 
      image: item.imageUrl,
      notes: itemNotes
    }]);
    setSelectedItem(null);
    setItemNotes('');
  };

  const handleMidtransPayment = async (orderId) => {
    try {
      const response = await fetch(`${API_PAYMENT_URL}/create-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: () => {
            Swal.fire({ icon: 'success', title: 'Terima Kasih!', text: 'Pesanan telah dibayar dan segera diproses.', background: '#1e293b', color: '#fff' });
            setCart([]);
            setActiveTab('menu');
          },
          onPending: () => {
            Swal.fire({ icon: 'info', title: 'Menunggu Pembayaran', text: 'Segera selesaikan pembayaran QRIS Anda.', background: '#1e293b', color: '#fff' });
            setCart([]);
            setActiveTab('menu');
          },
          onClose: () => {
            Swal.fire({ title: 'Pembayaran Ditunda', text: 'Pesanan Anda tetap tersimpan. Anda bisa membayarnya nanti di Kasir.', icon: 'info', background: '#1e293b', color: '#fff' });
            setCart([]);
            setActiveTab('menu');
          }
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    // 1. Pilih Metode Pembayaran
    const { value: method } = await Swal.fire({
      title: 'Pilih Metode Pembayaran',
      background: '#1e293b',
      color: '#fff',
      showCancelButton: true,
      cancelButtonText: 'Kembali',
      showDenyButton: true,
      confirmButtonText: 'Bayar di Kasir',
      denyButtonText: 'Bayar Sekarang (QRIS)',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#3b82f6',
    });

    if (method === undefined) return;

    const selectedMethod = method ? 'LATER' : 'QRIS';

    try {
      const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      const orderPayload = {
        branchId: tableInfo.branchId,
        tableId: tableId,
        customerName: `Customer Meja ${tableInfo.tableNumber}`,
        items: cart.map(i => ({
          menuId: i.menuId,
          qty: i.qty,
          price: i.price,
          notes: i.notes || ''
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        notes: `Order Meja ${tableInfo.tableNumber} - ${selectedMethod}`
      };

      const res = await fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${BASIC_AUTH}`
        },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await res.json();

      if (res.ok) {
        if (selectedMethod === 'QRIS') {
          await handleMidtransPayment(orderData.id);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Pesanan Terkirim!',
            text: 'Mohon tunggu, dapur sedang menyiapkan pesanan Anda.',
            confirmButtonColor: '#10b981',
            background: '#1e293b', color: '#fff'
          });
          setCart([]);
          setActiveTab('menu');
        }
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Gagal menghubungi server.', background: '#1e293b', color: '#fff' });
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading menu...</div>;

  const cartTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', background: '#0f172a', minHeight: '100vh', position: 'relative', paddingBottom: '100px', color: 'white' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', sticky: 'top', top: 0, zIndex: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Meja {tableInfo?.tableNumber}</h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tableInfo?.branch?.name}</p>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: '#94a3b8' }} onClick={() => Swal.fire({ title: 'Memanggil Pelayan...', text: 'Mohon tunggu sebentar.', icon: 'info', background: '#1e293b', color: '#fff' })}>
          <Bell size={20} />
        </button>
      </header>

      {activeTab === 'menu' ? (
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {menuItems.map(item => (
              <motion.div 
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: '#1e293b', borderRadius: '1rem', border: '1px solid #334155' }}
              >
                <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '600' }}>{item.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', height: '1.5rem', overflow: 'hidden' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>Rp {parseFloat(item.price).toLocaleString()}</span>
                    <button style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none' }}>Tambah</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Detail Pesanan</h3>
          {cart.map((item, index) => (
            <div key={index} style={{ background: '#1e293b', padding: '1rem', borderRadius: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontWeight: '600' }}>{item.name}</h4>
                <button onClick={() => setCart(cart.filter((_, i) => i !== index))} style={{ color: '#ef4444', border: 'none', background: 'transparent' }}><Minus size={16}/></button>
              </div>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Rp {item.price.toLocaleString()} x {item.qty}</p>
            </div>
          ))}
          
          <div style={{ marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#94a3b8' }}>
              <span>Total (inc. Pajak)</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Rp {(cartTotal * 1.1).toLocaleString()}</span>
            </div>
            
            <button 
              disabled={cart.length === 0}
              onClick={handlePlaceOrder}
              style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
            >
              Konfirmasi Pesanan
            </button>
          </div>
        </div>
      )}

      {/* Modal Detail Item */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, top: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', background: '#1e293b', borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem', padding: '2rem' }}>
              <button onClick={() => setSelectedItem(null)} style={{ marginBottom: '1rem', color: '#94a3b8', background: 'transparent', border: 'none' }}>✕ Tutup</button>
              <img src={selectedItem.imageUrl} style={{ width: '100%', height: '180px', borderRadius: '1rem', objectFit: 'cover', marginBottom: '1rem' }} />
              <h3>{selectedItem.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>{selectedItem.description}</p>
              <textarea placeholder="Catatan: pedas, dsb..." value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: 'white', marginBottom: '1.5rem' }}></textarea>
              <button style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }} onClick={() => addToCart(selectedItem)}>Tambah ke Keranjang</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 40px)', maxWidth: '410px', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '0.75rem', display: 'flex', justifyContent: 'space-around', border: '1px solid #334155' }}>
        <button onClick={() => setActiveTab('menu')} style={{ background: 'transparent', border: 'none', color: activeTab === 'menu' ? '#10b981' : '#94a3b8' }}><Utensils size={20}/></button>
        <button onClick={() => setActiveTab('cart')} style={{ background: 'transparent', border: 'none', color: activeTab === 'cart' ? '#10b981' : '#94a3b8' }}><ShoppingCart size={20}/> {cart.length > 0 && <span style={{ background: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>{cart.length}</span>}</button>
      </nav>
    </div>
  );
};

export default CustomerQR;
