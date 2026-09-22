import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {user?.rol || 'Usuario'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Hola, <strong>{user?.nombre} {user?.apellido}</strong>
        </span>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
