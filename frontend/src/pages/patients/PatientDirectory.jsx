import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit } from 'lucide-react';

const PatientDirectory = () => {
  const [personal, setPersonal] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', ci: '', email: '', telefono: '', password: '', 
    rolId: '', fechaNacimiento: '', direccion: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users?rol=Paciente'),
        api.get('/roles')
      ]);
      setPersonal(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar a este paciente?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const handleEditClick = (userToEdit) => {
    const rolSeleccionado = userToEdit.rolId?._id || '';
    
    setFormData({
      nombre: userToEdit.nombre || '', 
      apellido: userToEdit.apellido || '', 
      ci: userToEdit.ci || '', 
      email: userToEdit.email || '', 
      telefono: userToEdit.telefono || '', 
      password: '', 
      rolId: rolSeleccionado, 
      fechaNacimiento: userToEdit.datosPaciente?.fechaNacimiento ? userToEdit.datosPaciente.fechaNacimiento.split('T')[0] : '', 
      direccion: userToEdit.datosPaciente?.direccion || ''
    });
    setEditingUserId(userToEdit._id);
    setShowModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      let finalData = { ...formData };
      
      const rolPaciente = roles.find(r => r.nombre === 'Paciente');
      if (!rolPaciente) {
         alert('El rol Paciente no está configurado en el sistema.'); return;
      }
      
      finalData.rolId = rolPaciente._id;
      finalData.datosPaciente = {
        fechaNacimiento: finalData.fechaNacimiento,
        direccion: finalData.direccion
      };

      if (editingUserId && (!finalData.password || finalData.password.trim() === '')) {
        delete finalData.password;
      }

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, finalData);
        alert("Registro actualizado con éxito");
      } else {
        await api.post('/users', finalData);
        alert("Registro creado con éxito");
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Error al procesar usuario");
    }
  };

  const handleOpenModal = () => {
    const rolPaciente = roles.find(r => r.nombre === 'Paciente');
    
    setEditingUserId(null); 
    setFormData({
      nombre: '', apellido: '', ci: '', email: '', telefono: '', password: '', 
      rolId: rolPaciente ? rolPaciente._id : '', fechaNacimiento: '', direccion: ''
    });
    setShowModal(true);
  };

  const pacientesList = personal; // Ya viene filtrado del backend

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Directorio de Pacientes</h2>
        <button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          + Añadir Paciente
        </button>
      </div>
      
      {loading ? (
        <p className="text-center py-4 text-gray-500">Cargando datos de pacientes...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-left text-sm whitespace-nowrap border rounded-lg">
            <thead className="bg-blue-50 text-blue-900">
              <tr>
                <th className="px-6 py-3 border-b font-semibold">Nombre Completo</th>
                <th className="px-6 py-3 border-b font-semibold">CI</th>
                <th className="px-6 py-3 border-b font-semibold">Contacto (Tel/Email)</th>
                <th className="px-6 py-3 border-b font-semibold">Dirección</th>
                <th className="px-6 py-3 border-b font-semibold text-center">Historial Médico</th>
                <th className="px-6 py-3 border-b font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pacientesList.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay pacientes registrados.</td></tr>
              ) : (
                pacientesList.map(p => (
                  <tr key={p._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.nombre} {p.apellido}</td>
                    <td className="px-6 py-4 text-gray-600">{p.ci}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-sm">{p.telefono || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{p.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.datosPaciente?.direccion || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full text-xs font-bold transition-colors">
                        Ver / Descargar PDF
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors mr-2" title="Editar paciente">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteUser(p._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar paciente">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto mt-20 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingUserId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
            </h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CI</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.ci} onChange={e => setFormData({...formData, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="text" className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingUserId ? 'Contraseña (Opcional)' : 'Contraseña Inicial'}
                </label>
                <input type="password" required={!editingUserId} className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <input type="date" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input type="text" className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                  {editingUserId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;
