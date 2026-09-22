import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

// Lista de permisos agrupados según PERMISOS_SISTEMA en seeder.js
const PERMISOS_GROUPED = {
  'Citas y Agenda': [
    { id: 'HORARIOS_CONFIGURAR', label: 'Configurar Horarios' },
    { id: 'CITAS_VER', label: 'Ver Citas' },
    { id: 'CITAS_AGENDAR', label: 'Agendar Citas' },
    { id: 'CITAS_ATENDER', label: 'Atender Citas (Enfermería/Recepción)' },
    { id: 'CONSULTAS_MEDICAS', label: 'Atender Consultas Médicas' },
    { id: 'CITAS_REPROGRAMAR_CANCELAR', label: 'Reprogramar/Cancelar Citas' }
  ],
  'Historial Clínico': [
    { id: 'HISTORIAL_VER', label: 'Ver Historial' },
    { id: 'HISTORIAL_CREAR_EVOLUCION', label: 'Crear Evolución' },
    { id: 'HISTORIAL_ADJUNTAR_DOCUMENTOS', label: 'Adjuntar Documentos' }
  ],
  'Gestión de Pacientes': [
    { id: 'PACIENTES_REGISTRAR', label: 'Registrar Pacientes' }
  ],
  'Tareas de Enfermería': [
    { id: 'TAREAS_CREAR', label: 'Crear Tareas' },
    { id: 'TAREAS_EJECUTAR', label: 'Ejecutar Tareas' },
    { id: 'TAREAS_AUDITAR', label: 'Auditar Tareas' }
  ],
  'Farmacia e Inventario': [
    { id: 'FARMACIA_VER', label: 'Ver Farmacia' },
    { id: 'FARMACIA_GESTIONAR_INVENTARIO', label: 'Gestionar Inventario' },
    { id: 'FARMACIA_RECETAR', label: 'Recetar Medicamentos' },
    { id: 'FARMACIA_SOLICITAR', label: 'Solicitar Medicamentos' },
    { id: 'FARMACIA_DISPENSAR', label: 'Dispensar Medicamentos' },
    { id: 'SOLICITUDES_MEDICAMENTOS_GESTIONAR', label: 'Gestionar Solicitudes' }
  ],
  'Administración': [
    { id: 'ROLES_GESTIONAR', label: 'Gestionar Roles' },
    { id: 'USUARIOS_GESTIONAR', label: 'Gestionar Usuarios' },
    { id: 'REPORTES_VER', label: 'Ver Reportes' }
  ]
};

const RoleForm = ({ role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre,
        descripcion: role.descripcion || '',
        permisos: role.permisos || []
      });
    }
  }, [role]);

  const togglePermiso = (permisoId) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permisoId) 
        ? prev.permisos.filter(p => p !== permisoId)
        : [...prev.permisos, permisoId]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (role) {
        await api.put(`/roles/${role._id}`, formData);
      } else {
        await api.post('/roles', formData);
      }
      onSave();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el rol: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4 mt-20">
        <h2 className="text-2xl font-bold mb-4">{role ? 'Editar Rol' : 'Nuevo Rol'}</h2>
        
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
              <input 
                type="text" 
                required 
                disabled={role?.esRolSistema}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
              {role?.esRolSistema && <p className="text-xs text-red-500 mt-1">El nombre de un rol de sistema no se puede modificar.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
          </div>

          <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Matriz de Permisos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {Object.entries(PERMISOS_GROUPED).map(([groupName, permisos]) => (
              <div key={groupName} className="bg-gray-50 p-4 rounded border">
                <h4 className="font-medium text-gray-700 mb-3">{groupName}</h4>
                <div className="space-y-2">
                  {permisos.map(permiso => (
                    <label key={permiso.id} className="flex items-start">
                      <input 
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-600 rounded"
                        checked={formData.permisos.includes(permiso.id)}
                        onChange={() => togglePermiso(permiso.id)}
                      />
                      <span className="ml-2 text-sm text-gray-600">{permiso.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8 border-t pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
