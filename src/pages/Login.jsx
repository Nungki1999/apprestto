import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Shield, WifiOff, Mail, Lock } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('admin@resto.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_role', data.user.role.name);
        localStorage.setItem('branch_id', data.user.branchId || '');
        
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: `Selamat datang kembali, ${data.user.fullName}!`,
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
        });

        // Redirect based on role
        const role = data.user.role.name;
        if (role === 'owner' || role === 'manager') navigate('/owner');
        else if (role === 'kitchen') navigate('/kitchen');
        else navigate('/cashier');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: data.message,
          background: '#1e293b',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal terhubung ke server.',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2rem' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'var(--primary)', 
            borderRadius: '16px', margin: '0 auto 1rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>RestoApp V2</h1>
          <p style={{ color: 'var(--text-muted)' }}>Backend Connected Terminal</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '3rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '3rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem', opacity: isLoading ? 0.7 : 1 }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Login to System'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <WifiOff size={16} /> Offline Mode
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
