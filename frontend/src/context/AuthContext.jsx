import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Primer efecto para inicializar desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('clinica_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Segundo efecto para socket.io
  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000');

    socket.on('role_updated', async (data) => {
      // Si el rol actualizado es el mismo que tiene el usuario actual
      if (user.rol === data.rolNombre) {
        try {
          const response = await api.post('/auth/refresh');
          const { token, user: userData } = response.data;
          
          localStorage.setItem('clinica_token', token);
          localStorage.setItem('clinica_user', JSON.stringify(userData));
          
          // Recarga silenciosa seguida de recarga de página para reflejar cambios
          window.location.reload();
        } catch (error) {
          console.error('Error al refrescar permisos:', error);
          setUser(null);
          localStorage.removeItem('clinica_token');
          localStorage.removeItem('clinica_user');
          window.location.href = '/login';
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('clinica_token', token);
      localStorage.setItem('clinica_user', JSON.stringify(userData));
      
      setUser(userData);
      return userData; // Retornamos los datos para poder usarlos al momento de redirigir
    } catch (error) {
      console.error('Error en el login', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinica_token');
    localStorage.removeItem('clinica_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
