import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, Play, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `${API_BASE_URL}/order`;
  const TOKEN = localStorage.getItem('auth_token');

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const data = await response.json();
      
      // Filter for active kitchen orders (pending, cooking, ready)
      const activeOrders = data.filter(o => ['pending', 'cooking', 'ready'].includes(o.status));
      
      // Transform data for UI
      const transformed = activeOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        table: o.table ? `Meja ${o.table.tableNumber}` : 'Takeaway',
        items: o.items.map(i => ({
          name: i.menu.name,
          qty: i.qty,
          note: i.notes
        })),
        status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
        time: Math.floor((new Date() - new Date(o.createdAt)) / 1000)
      }));

      setOrders(transformed);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prev => prev.map(o => ({ ...o, time: o.time + 1 })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });

      if (response.ok) {
        fetchOrders();
        if (newStatus === 'Completed') {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Pesanan telah diantar dan diselesaikan.',
            timer: 1500,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#fff'
          });
        }
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal update status', background: '#1e293b', color: '#fff' });
    }
  };

  const getStatusColor = (status, time) => {
    if (status === 'Ready') return '#10b981';
    if (time > 600) return '#ef4444';
    if (status === 'Cooking') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '1.5rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ChefHat size={32} /> Kitchen Display System
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Monitoring pesanan aktif di dapur</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div className="glass-card" style={{ padding: '0.5rem 1rem', borderColor: '#3b82f6' }}>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>PENDING: {orders.filter(o => o.status === 'Pending').length}</span>
             </div>
             <div className="glass-card" style={{ padding: '0.5rem 1rem', borderColor: '#f59e0b' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold' }}>COOKING: {orders.filter(o => o.status === 'Cooking').length}</span>
             </div>
             <div className="glass-card" style={{ padding: '0.5rem 1rem', borderColor: '#10b981' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>READY: {orders.filter(o => o.status === 'Ready').length}</span>
             </div>
          </div>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>Memuat pesanan...</p>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            <AnimatePresence>
              {orders.map(order => (
                <motion.div 
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card"
                  style={{ 
                    width: '320px', 
                    flexShrink: 0, 
                    borderLeft: `6px solid ${getStatusColor(order.status, order.time)}` 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold' }}>{order.table}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{order.orderNumber}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: order.time > 600 ? '#ef4444' : 'var(--text)' }}>
                      <Clock size={16} />
                      <span style={{ fontWeight: '600' }}>{formatTime(order.time)}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem', minHeight: '120px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '500' }}><span style={{ color: 'var(--primary)' }}>{item.qty}x</span> {item.name}</span>
                        </div>
                        {item.note && <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' }}>* {item.note}</p>}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Cooking')}
                        className="btn-primary" 
                        style={{ flex: 1, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Play size={18} /> Masak
                      </button>
                    )}
                    {order.status === 'Cooking' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Ready')}
                        className="btn-primary" 
                        style={{ flex: 1, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <CheckCircle size={18} /> Selesai
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                        className="btn-primary" 
                        style={{ flex: 1, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Check size={18} /> Antar
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)', marginTop: '50px' }}>
                <p>Tidak ada pesanan aktif saat ini.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Kitchen;
