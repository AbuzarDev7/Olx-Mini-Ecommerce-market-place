import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadProduct from './pages/UploadProduct';
import ProductDetail from './pages/ProductDetail';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<UploadProduct />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/info" element={<ProductDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
