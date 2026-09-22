import React, { useState } from 'react';
import api from '../../../services/api';

const RoleReassignModal = ({ roleToDelete, usersCount, roles, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtrar el rol que se va a eliminar
  const availableRoles = roles.filter(r => r._id !== roleToDelete._id);

  const handleReassignAndDrop = async () => {
    if (!selectedRole) {
      alert('Por favor selecciona un rol para transferir los usuarios.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/roles/reasignar-y-eliminar', {
        rolIdEliminar: roleToDelete._id,
        rolIdReasignar: selectedRole
      });
      alert('Usuarios reasignados y rol eliminado exitosamente.');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Error en el proceso: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-t-4 border-yellow-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Eliminación de Rol Bloqueada</h2>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4 text-sm">
          No puedes eliminar el rol <strong>"{roleToDelete.nombre}"</strong> porque hay <strong>{usersCount} usuarios</strong> asignados a él.
          Para mantener la integridad del sistema, debes reasignarlos a otro rol antes de eliminarlo.
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el nuevo rol para estos usuarios:
          </label>
          <select 
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Seleccionar Rol --</option>
            {availableRoles.map(r => (
              <option key={r._id} value={r._id}>{r.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleReassignAndDrop}
            disabled={!selectedRole || loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? 'Procesando...' : 'Reasignar y Eliminar Rol'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleReassignModal;
