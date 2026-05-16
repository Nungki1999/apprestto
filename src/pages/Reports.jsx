import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, Calendar, Users, Coffee } from 'lucide-react';

const salesData = [
  { name: 'Sen', omzet: 2100, laba: 1200 },
  { name: 'Sel', omzet: 1800, laba: 900 },
  { name: 'Rab', omzet: 2400, laba: 1500 },
  { name: 'Kam', omzet: 2200, laba: 1300 },
  { name: 'Jum', omzet: 3500, laba: 2100 },
  { name: 'Sab', omzet: 4800, laba: 3200 },
  { name: 'Min', omzet: 5200, laba: 3500 },
];

const categoryData = [
  { name: 'Makanan', value: 65 },
  { name: 'Minuman', value: 25 },
  { name: 'Snack', value: 10 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/stats/reports';
  const TOKEN = localStorage.getItem('auth_token');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px' }}>Loading Reports...</div>;

  return (
    <div style={{ display: 'flex', background: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Laporan Analitik</h1>
            <p style={{ color: '#94a3b8' }}>Analisa performa bisnis Anda secara mendalam</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ padding: '0.5rem 1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Mei 2024
            </button>
            <button style={{ padding: '0.5rem 1rem', background: '#10b981', borderRadius: '8px', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <Download size={18} /> Export PDF
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Omzet vs Laba Kotor (Mingguan - Demo)</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="omzet" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="laba" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Proporsi Penjualan (Demo)</h3>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
               {categoryData.map((cat, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i] }}></div>
                       <span style={{ fontSize: '0.875rem' }}>{cat.name}</span>
                    </div>
                    <span style={{ fontWeight: '600' }}>{cat.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#10b981" /> Performa Pegawai
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reportData?.staff?.map((staff, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <span style={{ fontWeight: '500' }}>{staff.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem' }}>{staff.orders} Selesai</div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>★ {staff.rating}</div>
                  </div>
                </div>
              ))}
              {reportData?.staff?.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>Belum ada data performa</p>}
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coffee size={20} color="#f59e0b" /> Menu Paling Laris
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reportData?.topMenus?.map((menu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <span style={{ fontWeight: '500' }}>{menu.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem' }}>{menu.sold} Terjual</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Terlaris #{i+1}</div>
                  </div>
                </div>
              ))}
              {reportData?.topMenus?.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>Belum ada data penjualan</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
