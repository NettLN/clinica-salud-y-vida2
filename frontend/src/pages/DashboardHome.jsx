import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, FileText, Package, Users, Shield, LayoutGrid, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const { user } = useAuth();
  const roleName = user?.rol || 'Usuario';
  const permisos = user?.permisos || [];

  const tienePermiso = (perm) => permisos.includes(perm);

  return (
    <div className="p-6 max-w-7xl mx-auto mt-4 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Activity size={300} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
            Hola, {user?.nombre} {user?.apellido}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl">
            Bienvenido al Sistema de Gestión Clínica Salud & Vida. Estás accediendo como <strong className="bg-white/20 px-2 py-1 rounded">{roleName}</strong>.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <LayoutGrid className="text-blue-600" /> Accesos Rápidos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Panel Médico (Consultas y Tareas) */}
        {(tienePermiso('CITAS_ATENDER') || tienePermiso('CONSULTAS_MEDICAS') || tienePermiso('TAREAS_CREAR')) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Centro Médico</h3>
            <p className="text-sm text-gray-500 mb-4">Atención de pacientes en vivo, emisión de recetas y delegación de órdenes clínicas.</p>
            <div className="flex flex-col gap-2 mt-auto">
              {(tienePermiso('CITAS_ATENDER') || tienePermiso('CONSULTAS_MEDICAS')) && (
                <Link to="/doctor/citas" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  &rarr; Atender Consultas (Mi Cola)
                </Link>
              )}
              {(tienePermiso('TAREAS_CREAR') || tienePermiso('CONSULTAS_MEDICAS')) && (
                <Link to="/doctor/tareas" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  &rarr; Delegar / Auditar Tareas
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* Pacientes & Historial */}
        {(tienePermiso('PACIENTES_REGISTRAR') || tienePermiso('HISTORIAL_VER')) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pacientes</h3>
            <p className="text-sm text-gray-500 mb-4">Gestiona el directorio de pacientes y visualiza los expedientes clínicos.</p>
            <div className="flex flex-col gap-2 mt-auto">
              {tienePermiso('PACIENTES_REGISTRAR') && (
                <Link to="/pacientes" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  &rarr; Directorio de Pacientes
                </Link>
              )}
              {tienePermiso('HISTORIAL_VER') && (
                <Link to="/historial" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  &rarr; Expedientes Clínicos
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Citas & Horarios (Recepción) */}
        {(tienePermiso('CITAS_VER') || tienePermiso('HORARIOS_CONFIGURAR')) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Citas</h3>
            <p className="text-sm text-gray-500 mb-4">Administra la agenda de consultas, turnos y disponibilidad médica.</p>
            <div className="flex flex-col gap-2 mt-auto">
              {tienePermiso('CITAS_VER') && (
                <Link to="/citas" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  &rarr; Agenda General
                </Link>
              )}
              {tienePermiso('HORARIOS_CONFIGURAR') && (
                <Link to="/horarios" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  &rarr; Mis Horarios
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Enfermería (Ejecución) */}
        {(tienePermiso('TAREAS_EJECUTAR')) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Enfermería</h3>
            <p className="text-sm text-gray-500 mb-4">Pool de tareas clínicas, protocolos de atención y reportes de estado.</p>
            <div className="flex flex-col gap-2 mt-auto">
              <Link to="/enfermeria/tareas" className="text-sm font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1">
                &rarr; Pool de Tareas Clínicas
              </Link>
            </div>
          </div>
        )}

        {/* Farmacia */}
        {(tienePermiso('FARMACIA_VER') || tienePermiso('FARMACIA_DISPENSAR')) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Farmacia</h3>
            <p className="text-sm text-gray-500 mb-4">Control de inventario FEFO, despachos y bandeja de solicitudes médicas.</p>
            <div className="flex flex-col gap-2 mt-auto">
              {tienePermiso('FARMACIA_VER') && (
                <Link to="/farmacia/inventario" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  &rarr; Inventario Activo
                </Link>
              )}
              {tienePermiso('FARMACIA_DISPENSAR') && (
                <Link to="/farmacia/dispensar" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  &rarr; Punto de Despacho
                </Link>
              )}
              {tienePermiso('SOLICITUDES_MEDICAMENTOS_GESTIONAR') && (
                <Link to="/farmacia/solicitudes" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  &rarr; Solicitudes de Insumos
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Administración */}
        {(tienePermiso('USUARIOS_GESTIONAR') || tienePermiso('ROLES_GESTIONAR')) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Administración</h3>
            <p className="text-sm text-gray-500 mb-4">Control de accesos (RBAC), gestión de personal y configuración del sistema.</p>
            <div className="flex flex-col gap-2 mt-auto">
              {tienePermiso('USUARIOS_GESTIONAR') && (
                <Link to="/admin/usuarios" className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  &rarr; Gestión de Usuarios
                </Link>
              )}
              {tienePermiso('ROLES_GESTIONAR') && (
                <Link to="/admin/roles" className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  &rarr; Roles y Permisos
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardHome;
