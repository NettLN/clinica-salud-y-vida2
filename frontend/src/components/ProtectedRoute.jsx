import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

<<<<<<< HEAD
const ProtectedRoute = ({ children, permisosRequeridos }) => {
=======
const ProtectedRoute = ({ children, allowedRoles }) => {
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
  if (permisosRequeridos && permisosRequeridos.length > 0) {
    const tienePermiso = permisosRequeridos.some(permiso => user.permisos && user.permisos.includes(permiso));
    if (!tienePermiso) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes los permisos necesarios para acceder a esta sección.</p>
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Volver al inicio</a>
        </div>
      );
    }
=======
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Si el usuario no tiene permiso, lo enviamos al login o a un "No autorizado"
    return <Navigate to="/login" replace />;
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
