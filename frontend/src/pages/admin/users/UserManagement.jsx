import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Trash2, Edit } from 'lucide-react';

const opcionesMedico = [
  'Anestesiología y Reanimación', 'Cirugía General y del Aparato Digestivo', 
  'Ginecología y Obstetricia', 'Medicina Interna', 'Pediatría', 
  'Radiodiagnóstico', 'Traumatología y Cirugía Ortopédica'
];

const opcionesEnfermero = [
  'Enfermería en Cuidados Médico-Quirúrgicos', 'Enfermería Obstétrico-Ginecológica', 'Enfermería Pediátrica'
];

const UserManagement = () => {
  const [personal, setPersonal] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', ci: '', email: '', telefono: '', password: '', 
    rolId: '', especialidad: [], matriculaProfesional: '', turno: 'Mañana'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles')
      ]);
      setPersonal(usersRes.data);
      setRoles(rolesRes.data.filter(r => r.nombre !== 'Paciente'));
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
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
    const rolObj = roles.find(r => r._id === rolSeleccionado);
    
    const esp = userToEdit.datosMedico?.especialidad || userToEdit.datosEnfermero?.especialidad || [];
    const mat = userToEdit.datosMedico?.matriculaProfesional || userToEdit.datosEnfermero?.matriculaProfesional || '';
    const turno = userToEdit.datosEnfermero?.turno || 'Mañana';

    setFormData({
      nombre: userToEdit.nombre || '', 
      apellido: userToEdit.apellido || '', 
      ci: userToEdit.ci || '', 
      email: userToEdit.email || '', 
      telefono: userToEdit.telefono || '', 
      password: '', 
      rolId: rolSeleccionado, 
      especialidad: esp, 
      matriculaProfesional: mat, 
      turno: turno
    });
    setEditingUserId(userToEdit._id);
    setShowModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      let finalData = { ...formData };
      
      const rolObj = roles.find(r => r._id === finalData.rolId);
      if (!rolObj) {
         alert('Seleccione un rol válido'); return;
      }
      
      const nombreRol = rolObj.nombre;

      if (nombreRol === 'Medico') {
        if (finalData.especialidad.length === 0) finalData.especialidad = ['Medicina General'];
        finalData.datosMedico = { especialidad: finalData.especialidad, matriculaProfesional: finalData.matriculaProfesional };
      } else if (nombreRol === 'Enfermero') {
        if (finalData.especialidad.length === 0) finalData.especialidad = ['Enfermería General'];
        finalData.datosEnfermero = { especialidad: finalData.especialidad, matriculaProfesional: finalData.matriculaProfesional, turno: finalData.turno };
      }

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

  const handleEspecialidadChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, especialidad: [...prev.especialidad, value] };
      } else {
        return { ...prev, especialidad: prev.especialidad.filter(item => item !== value) };
      }
    });
  };

  const handleOpenModal = () => {
    setEditingUserId(null); 
    setFormData({
      nombre: '', apellido: '', ci: '', email: '', telefono: '', password: '', 
      rolId: roles.length > 0 ? roles[0]._id : '', especialidad: [], matriculaProfesional: '', turno: 'Mañana'
    });
    setShowModal(true);
  };

  const personalList = personal.filter(p => p.rolId?.nombre !== 'Paciente');
  const selectedRolObj = roles.find(r => r._id === formData.rolId);
  const selectedRolName = selectedRolObj?.nombre || '';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Directorio de Empleados</h2>
        <button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          + Añadir Personal
        </button>
      </div>
      
      {loading ? (
        <p className="text-center py-4 text-gray-500">Cargando datos del personal...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-left text-sm whitespace-nowrap border rounded-lg">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 border-b font-semibold">Nombre Completo</th>
                <th className="px-6 py-3 border-b font-semibold">CI</th>
                <th className="px-6 py-3 border-b font-semibold">Email</th>
                <th className="px-6 py-3 border-b font-semibold">Rol</th>
                <th className="px-6 py-3 border-b font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {personalList.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No hay personal registrado.</td></tr>
              ) : (
                personalList.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.nombre} {p.apellido}</td>
                    <td className="px-6 py-4 text-gray-600">{p.ci}</td>
                    <td className="px-6 py-4 text-gray-600">{p.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {p.rolId?.nombre || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors" title="Editar registro">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteUser(p._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar registro">
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
              {editingUserId ? 'Editar Personal' : 'Registrar Nuevo Personal'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select 
                  className="mt-1 block w-full px-3 py-2 border rounded-md" 
                  value={formData.rolId} 
                  onChange={e => setFormData({...formData, rolId: e.target.value, especialidad: []})}
                  disabled={!!editingUserId}
                >
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>{r.nombre}</option>
                  ))}
                </select>
              </div>

              {(selectedRolName === 'Medico' || selectedRolName === 'Enfermero') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Matrícula Profesional</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.matriculaProfesional} onChange={e => setFormData({...formData, matriculaProfesional: e.target.value})} />
                </div>
              )}

              {selectedRolName === 'Medico' && (
                <div className="bg-gray-50 p-4 border rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad(es)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {opcionesMedico.map(opcion => (
                      <label key={opcion} className="flex items-center space-x-2">
                        <input type="checkbox" value={opcion} checked={formData.especialidad.includes(opcion)} onChange={handleEspecialidadChange} className="rounded text-blue-600" />
                        <span className="text-sm text-gray-700">{opcion}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedRolName === 'Enfermero' && (
                <div className="bg-gray-50 p-4 border rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad(es)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {opcionesEnfermero.map(opcion => (
                      <label key={opcion} className="flex items-center space-x-2">
                        <input type="checkbox" value={opcion} checked={formData.especialidad.includes(opcion)} onChange={handleEspecialidadChange} className="rounded text-blue-600" />
                        <span className="text-sm text-gray-700">{opcion}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedRolName === 'Enfermero' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Turno Asignado</label>
                  <select className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})}>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
              )}

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

export default UserManagement;
