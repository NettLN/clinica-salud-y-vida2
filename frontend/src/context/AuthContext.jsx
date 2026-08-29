import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar, recuperar estado de localStorage
    const storedUser = localStorage.getItem('clinica_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

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
