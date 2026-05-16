import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ChefHat, 
  Package, 
  BarChart3, 
  Settings,
  LogOut,
  Store,
  Calendar,
  LayoutGrid
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/owner' },
    { icon: <Utensils size={20} />, label: 'Kasir', path: '/cashier' },
    { icon: <ChefHat size={20} />, label: 'Kitchen', path: '/kitchen' },
    { icon: <Package size={20} />, label: 'Stok', path: '/inventory' },
    { icon: <BarChart3 size={20} />, label: 'Laporan', path: '/reports' },
    { icon: <Calendar size={20} />, label: 'Reservasi', path: '/booking' },
    { icon: <Utensils size={20} />, label: 'Menu', path: '/menu-management' },
    { icon: <LayoutGrid size={20} />, label: 'Meja', path: '/tables' },
    { icon: <Store size={20} />, label: 'Cabang', path: '#' },
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'var(--card-bg)',
      backdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
          <Utensils size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>RestoApp</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'var(--primary)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '0.5rem',
              transition: 'var(--transition)'
            })}
          >
            {item.icon}
            <span style={{ fontWeight: '500' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <NavLink
          to="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: '0.75rem',
            color: '#ef4444',
            textDecoration: 'none',
            transition: 'var(--transition)'
          }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Logout</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
