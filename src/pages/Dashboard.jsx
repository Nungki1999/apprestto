import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: '08:00', sales: 400 },
  { name: '10:00', sales: 900 },
  { name: '12:00', sales: 2400 },
  { name: '14:00', sales: 1800 },
  { name: '16:00', sales: 1500 },
  { name: '18:00', sales: 3200 },
  { name: '20:00', sales: 2800 },
];

const StatCard = ({ icon, label, value, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={{ 
      flex: 1, 
      minWidth: '240px', 
      background: 'rgba(30, 41, 59, 0.5)', 
      backdropFilter: 'blur(10px)',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.1)'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ 
        background: `${color}20`, 
        padding: '0.75rem', 
        borderRadius: '12px',
        color: color
      }}>
        {icon}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem', 
        color: '#10b981',
        fontSize: '0.875rem',
        fontWeight: '600'
      }}>
        {trend} <ArrowUpRight size={14} />
      </div>
    </div>
    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{label}</p>
    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{value}</h3>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/stats/dashboard';
  const TOKEN = localStorage.getItem('auth_token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Dashboard Owner</h1>
            <p style={{ color: '#94a3b8' }}>Selamat datang kembali, Owner!</p>
          </div>
          <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Live Updates</span>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard 
            icon={<TrendingUp size={24} />} 
            label="Omzet Hari Ini" 
            value={`Rp ${(stats?.today?.omzet || 0).toLocaleString()}`} 
            trend="+0%" 
            color="#10b981" 
          />
          <StatCard 
            icon={<ShoppingBag size={24} />} 
            label="Total Order" 
            value={`${stats?.today?.totalOrders || 0} Order`} 
            trend="+0%" 
            color="#3b82f6" 
          />
          <StatCard 
            icon={<Award size={24} />} 
            label="Menu Terlaris" 
            value={stats?.topMenu?.name || '-'} 
            trend={`${stats?.topMenu?.qty || 0} Terjual`} 
            color="#f59e0b" 
          />
          <StatCard 
            icon={<AlertTriangle size={24} />} 
            label="Stok Menipis" 
            value={stats?.lowStock?.length > 0 ? `${stats.lowStock[0].name} (${stats.lowStock[0].stock})` : 'Aman'} 
            trend="Pantau Stok" 
            color="#ef4444" 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Grafik Penjualan (Demo)</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Order Terbaru</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats?.activeOrders?.map((order, i) => (
                <div key={i} style={{ 
                  padding: '1rem', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600' }}>{order.table}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{order.items}</p>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem',
                    background: order.status === 'Ready' ? '#10b981' : order.status === 'Cooking' ? '#f59e0b' : '#3b82f6'
                  }}>
                    {order.status}
                  </div>
                </div>
              ))}
              {stats?.activeOrders?.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>Tidak ada order aktif</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
