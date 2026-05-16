import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Layers,
  Upload,
  Camera
} from 'lucide-react';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const API_URL = `${API_BASE_URL}/menu`;
  const TOKEN = localStorage.getItem('auth_token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        fetch(API_URL),
        fetch(`${API_URL}/categories`)
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();
      setMenus(menuData);
      setCategories(catData);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadImage = async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/${id}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
      });
      return response.ok;
    } catch (error) {
      console.error("Upload error:", error);
      return false;
    }
  };

  const openMenuModal = async (menu = null) => {
    const isEdit = !!menu;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Edit Menu' : 'Tambah Menu Baru',
      html: `
        <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; padding: 10px;">
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Nama Menu</label>
            <input id="swal-name" class="swal2-input" style="width: 100%; margin: 0; padding: 0.75rem;" placeholder="Contoh: Ayam Bakar" value="${isEdit ? menu.name : ''}">
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Kategori</label>
              <select id="swal-category" class="swal2-input" style="width: 100%; margin: 0; padding: 0.75rem;">
                ${categories.map(c => `<option value="${c.id}" ${isEdit && menu.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Harga (Rp)</label>
              <input id="swal-price" type="number" class="swal2-input" style="width: 100%; margin: 0; padding: 0.75rem;" placeholder="25000" value="${isEdit ? parseFloat(menu.price) : ''}">
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Deskripsi</label>
            <textarea id="swal-desc" class="swal2-textarea" style="width: 100%; margin: 0; padding: 0.75rem; min-height: 80px;" placeholder="Deskripsi singkat menu...">${isEdit ? menu.description || '' : ''}</textarea>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Foto Menu</label>
            <input id="swal-file" type="file" accept="image/*" class="swal2-file" style="margin: 0; width: 100%;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Simpan Perubahan' : 'Simpan Menu',
      background: '#1e293b',
      color: '#fff',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const categoryId = document.getElementById('swal-category').value;
        const price = document.getElementById('swal-price').value;
        const description = document.getElementById('swal-desc').value;
        const file = document.getElementById('swal-file').files[0];
        
        if (!name || !price) {
          Swal.showValidationMessage('Nama dan Harga wajib diisi!');
          return false;
        }
        
        return { name, categoryId, price, description, file };
      }
    });

    if (formValues) {
      try {
        const url = isEdit ? `${API_URL}/${menu.id}` : API_URL;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({
            name: formValues.name,
            categoryId: formValues.categoryId,
            price: formValues.price,
            description: formValues.description
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Jika ada file yang dipilih, upload fotonya
          if (formValues.file) {
            const menuId = isEdit ? menu.id : data.id;
            await handleUploadImage(menuId, formValues.file);
          }

          Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil', 
            text: 'Data menu dan foto diperbarui', 
            background: '#1e293b', 
            color: '#fff',
            timer: 1500
          });
          fetchData();
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', background: '#1e293b', color: '#fff' });
      }
    }
  };

  const handleDeleteMenu = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Menu?',
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Ya, Hapus!',
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Terhapus', background: '#1e293b', color: '#fff', timer: 1000 });
          fetchData();
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', background: '#1e293b', color: '#fff' });
      }
    }
  };

  const filteredMenus = menus.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Manajemen Menu</h1>
            <p style={{ color: 'var(--text-muted)' }}>Kelola daftar hidangan dan harga restoran Anda</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => openMenuModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} /> Tambah Menu
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Cari nama menu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff' }}
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.75rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', minWidth: '200px' }}
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <p>Memuat daftar menu...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredMenus.map(menu => (
              <motion.div 
                key={menu.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '0', overflow: 'hidden' }}
              >
                <div style={{ position: 'relative', height: '180px', background: '#334155' }}>
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                       <ImageIcon size={48} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                     <button onClick={() => openMenuModal(menu)} style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.8)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                        <Camera size={16} />
                     </button>
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{menu.name}</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px', fontWeight: 'bold' }}>
                      {menu.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', height: '40px', overflow: 'hidden', marginBottom: '1rem' }}>{menu.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>
                      Rp {parseFloat(menu.price).toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button 
                         onClick={() => openMenuModal(menu)}
                         className="btn-ghost" 
                         style={{ padding: '0.5rem', minWidth: 'auto' }}
                       >
                          <Edit3 size={18} />
                       </button>
                       <button 
                         onClick={() => handleDeleteMenu(menu.id)}
                         className="btn-ghost" 
                         style={{ padding: '0.5rem', minWidth: 'auto', color: '#ef4444' }}
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuManagement;
