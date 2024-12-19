// src/components/Navbar.tsx
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate(); // Hook para redirigir

  // Verifica si el usuario está autenticado (si hay un token en localStorage)
  const isAuthenticated = !!localStorage.getItem('authToken');

  // Si no está autenticado, redirigir al login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div 
      style={{
        padding: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}
    >
      <h2>Dashboard</h2>
      <h3>Aqui se mostrará el contenido del panel de control</h3>
    </div>
  );
};

export default Dashboard;