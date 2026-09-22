import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import RoleForm from './RoleForm';
import RoleReassignModal from './RoleReassignModal';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [reassignModalState, setReassignModalState] = useState({ isOpen: false, roleToDelete: null, usersCount: 0 });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/roles');
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles', error);
      alert('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteAttempt = async (role) => {
    if (role.esRolSistema) {
      alert('No puedes eliminar un rol del sistema.');
      return;
    }
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.nombre}"?`)) {
      try {
        await api.delete(`/roles/${role._id}`);
        setRoles(roles.filter(r => r._id !== role._id));
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.usuariosAfectados > 0) {
          // Open reassignment modal
          setReassignModalState({
            isOpen: true,
            roleToDelete: role,
            usersCount: error.response.data.usuariosAfectados
          });
        } else {
          alert('Error al eliminar el rol: ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };

  if (loading) return <div className="p-6">Cargando roles...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
        <button 
          onClick={() => { setEditingRole(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
        >
          + Nuevo Rol
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm border-b">
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Descripción</th>
              <th className="py-3 px-4">Permisos</th>
              <th className="py-3 px-4 text-center">Sistema</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(rol => (
              <tr key={rol._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-semibold text-gray-800">{rol.nombre}</td>
                <td className="py-3 px-4 text-gray-600">{rol.descripcion || '-'}</td>
                <td className="py-3 px-4 text-gray-600">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {rol.permisos?.length || 0} permisos
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {rol.esRolSistema ? (
                    <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-xs uppercase">Sí</span>
                  ) : (
                    <span className="text-gray-400 text-xs uppercase">No</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center flex justify-center gap-2">
                  <button 
                    onClick={() => { setEditingRole(rol); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  {!rol.esRolSistema && (
                    <button 
                      onClick={() => handleDeleteAttempt(rol)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">No hay roles registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RoleForm 
          role={editingRole} 
          onClose={() => setShowForm(false)} 
          onSave={() => { setShowForm(false); fetchRoles(); }}
        />
      )}

      {reassignModalState.isOpen && (
        <RoleReassignModal 
          roleToDelete={reassignModalState.roleToDelete}
          usersCount={reassignModalState.usersCount}
          roles={roles}
          onClose={() => setReassignModalState({ isOpen: false, roleToDelete: null, usersCount: 0 })}
          onSuccess={() => { setReassignModalState({ isOpen: false, roleToDelete: null, usersCount: 0 }); fetchRoles(); }}
        />
      )}
    </div>
  );
};

export default RolesList;
