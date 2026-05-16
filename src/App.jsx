import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cashier from './pages/Cashier';
import Kitchen from './pages/Kitchen';
import CustomerQR from './pages/CustomerQR';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Landing from './pages/Landing';
import AdminBooking from './pages/AdminBooking';
import Tables from './pages/Tables';
import MenuManagement from './pages/MenuManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/owner" element={<Dashboard />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/menu/:tableId" element={<CustomerQR />} />
        <Route path="/menu" element={<CustomerQR />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/booking" element={<AdminBooking />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/menu-management" element={<MenuManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
