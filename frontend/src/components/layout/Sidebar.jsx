import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const permisos = user?.permisos || [];

  const tienePermiso = (permiso) => permisos.includes(permiso);

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">SALUD & VIDA</h1>
        <p className="text-xs text-gray-400 mt-1">Sistema Hospitalario</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <NavLink to="/" className={({isActive}) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          Inicio
        </NavLink>

        {/* Módulo Citas */}
        {(tienePermiso('CITAS_VER') || tienePermiso('HORARIOS_CONFIGURAR')) && (
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Citas y Agenda</p>
            {tienePermiso('CITAS_VER') && (
              <NavLink to="/citas" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Gestión de Citas
              </NavLink>
            )}
            {tienePermiso('HORARIOS_CONFIGURAR') && (
              <NavLink to="/horarios" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Disponibilidad
              </NavLink>
            )}
          </div>
        )}

        {/* Módulo Centro Médico */}
        {(tienePermiso('CONSULTAS_MEDICAS') || tienePermiso('CITAS_ATENDER') || tienePermiso('TAREAS_CREAR')) && (
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Centro Médico</p>
            {(tienePermiso('CITAS_ATENDER') || tienePermiso('CONSULTAS_MEDICAS')) && (
              <NavLink to="/doctor/citas" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Atender Consultas
              </NavLink>
            )}
            {(tienePermiso('TAREAS_CREAR') || tienePermiso('CONSULTAS_MEDICAS')) && (
              <NavLink to="/doctor/tareas" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Delegar Tareas
              </NavLink>
            )}
          </div>
        )}

        {/* Módulo Pacientes & Historial */}
        {(tienePermiso('PACIENTES_REGISTRAR') || tienePermiso('HISTORIAL_VER')) && (
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pacientes</p>
            {tienePermiso('PACIENTES_REGISTRAR') && (
              <NavLink to="/pacientes" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Directorio de Pacientes
              </NavLink>
            )}
            {tienePermiso('HISTORIAL_VER') && (
              <NavLink to="/historial" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Expedientes Clínicos
              </NavLink>
            )}
          </div>
        )}

        {/* Módulo Enfermería */}
        {(tienePermiso('TAREAS_EJECUTAR') || tienePermiso('TAREAS_CREAR')) && (
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Enfermería</p>
            <NavLink to="/enfermeria/tareas" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
              Tablero de Tareas
            </NavLink>
          </div>
        )}

        {/* Módulo Farmacia */}
        {(tienePermiso('FARMACIA_VER') || tienePermiso('FARMACIA_RECETAR') || tienePermiso('FARMACIA_DISPENSAR')) && (
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Farmacia</p>
            {tienePermiso('FARMACIA_VER') && (
              <NavLink to="/farmacia/inventario" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Inventario
              </NavLink>
            )}
            {tienePermiso('FARMACIA_DISPENSAR') && (
              <NavLink to="/farmacia/dispensar" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Punto de Despacho
              </NavLink>
            )}
            {(tienePermiso('SOLICITUDES_MEDICAMENTOS_GESTIONAR') || tienePermiso('FARMACIA_SOLICITAR')) && (
              <NavLink to="/farmacia/solicitudes" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Solicitudes de Stock
              </NavLink>
            )}
          </div>
        )}

        {/* Módulo Configuración / Administración */}
        {(tienePermiso('ROLES_GESTIONAR') || tienePermiso('USUARIOS_GESTIONAR')) && (
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configuración</p>
            {tienePermiso('USUARIOS_GESTIONAR') && (
              <NavLink to="/admin/usuarios" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Usuarios del Sistema
              </NavLink>
            )}
            {tienePermiso('ROLES_GESTIONAR') && (
              <NavLink to="/admin/roles" className={({isActive}) => `block px-4 py-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'}`}>
                Roles y Permisos
              </NavLink>
            )}
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">v2.0 (RBAC)</p>
      </div>
    </aside>
  );
};

export default Sidebar;
