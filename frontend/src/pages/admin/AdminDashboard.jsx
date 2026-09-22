import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PanelInventarioFarmacia from '../../components/PanelInventarioFarmacia';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LogOut, LayoutDashboard, Users, Pill, Trash2, UserPlus, Edit } from 'lucide-react';

// Gráfico vaciado por petición (Se conectará cuando los otros roles generen datos de asistencia)
const mockAttendanceData = [];

const opcionesMedico = [
  'Anestesiología y Reanimación', 
  'Cirugía General y del Aparato Digestivo', 
  'Ginecología y Obstetricia', 
  'Medicina Interna', 
  'Pediatría', 
  'Radiodiagnóstico', 
  'Traumatología y Cirugía Ortopédica'
];

const opcionesEnfermero = [
  'Enfermería en Cuidados Médico-Quirúrgicos', 
  'Enfermería Obstétrico-Ginecológica', 
  'Enfermería Pediátrica'
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado para Personal y Pacientes
  const [personal, setPersonal] = useState([]);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Formulario nuevo/editar personal
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', ci: '', email: '', telefono: '', password: '', 
    rol: 'Medico', especialidad: [], matriculaProfesional: '', turno: 'Mañana',
    fechaNacimiento: '', direccion: ''
  });

  const fetchPersonal = async () => {
    setLoadingPersonal(true);
    try {
      const response = await api.get('/users');
      setPersonal(response.data);
    } catch (error) {
      console.error("Error al cargar personal", error);
    }
    setLoadingPersonal(false);
  };

  useEffect(() => {
    if (activeTab === 'personal' || activeTab === 'pacientes') {
      fetchPersonal();
    }
  }, [activeTab]);

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchPersonal();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const handleEditClick = (userToEdit) => {
    // Rellenamos el form con los datos del usuario a editar
    setFormData({
      nombre: userToEdit.nombre || '', 
      apellido: userToEdit.apellido || '', 
      ci: userToEdit.ci || '', 
      email: userToEdit.email || '', 
      telefono: userToEdit.telefono || '', 
      password: '', // Contraseña en blanco para que no cambie a menos que escriban una nueva
      rol: userToEdit.rol || 'Medico', 
      especialidad: Array.isArray(userToEdit.especialidad) ? userToEdit.especialidad : (userToEdit.especialidad ? [userToEdit.especialidad] : []), 
      matriculaProfesional: userToEdit.matriculaProfesional || '', 
      turno: userToEdit.turno || 'Mañana',
      fechaNacimiento: userToEdit.fechaNacimiento ? userToEdit.fechaNacimiento.split('T')[0] : '', 
      direccion: userToEdit.direccion || ''
    });
    setEditingUserId(userToEdit._id);
    setShowModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      // Para Médicos y Enfermeros, si no se seleccionó especialidad, asignar el valor por defecto
      let finalData = { ...formData };
      if (finalData.rol === 'Medico' && finalData.especialidad.length === 0) {
        finalData.especialidad = ['Medicina General'];
      } else if (finalData.rol === 'Enfermero' && finalData.especialidad.length === 0) {
        finalData.especialidad = ['Enfermería General'];
      }

      // Si estamos editando y no escribieron contraseña, eliminarla del payload para no sobrescribirla
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
      fetchPersonal();
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

  const handleOpenModal = (defaultRol) => {
    setEditingUserId(null); // Nuevo registro
    setFormData({
      nombre: '', apellido: '', ci: '', email: '', telefono: '', password: '', 
      rol: defaultRol, especialidad: [], matriculaProfesional: '', turno: 'Mañana',
      fechaNacimiento: '', direccion: ''
    });
    setShowModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tasa de Asistencia vs Inasistencia Mensual</h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Asistencias" stackId="a" fill="#10b981" />
                  <Bar dataKey="Inasistencias" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'farmacia':
        return <PanelInventarioFarmacia />;
      case 'personal':
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Directorio de Empleados</h2>
              <button 
                onClick={() => handleOpenModal('Medico')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                + Añadir Personal
              </button>
            </div>
            
            {loadingPersonal ? (
              <p className="text-center py-4 text-gray-500">Cargando datos del personal...</p>
            ) : (
              <div className="space-y-8">
                {/* Tabla de Administradores y Recepcionistas */}
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Administradores y Recepcionistas</h3>
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
                        {personal.filter(p => p.rol === 'Administrador' || p.rol === 'Recepcionista').length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-4 text-gray-500">No hay administradores/recepcionistas registrados.</td></tr>
                        ) : (
                          personal.filter(p => p.rol === 'Administrador' || p.rol === 'Recepcionista').map(p => (
                            <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{p.nombre} {p.apellido}</td>
                              <td className="px-6 py-4 text-gray-600">{p.ci}</td>
                              <td className="px-6 py-4 text-gray-600">{p.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.rol === 'Administrador' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                  {p.rol}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors mr-2" title="Editar registro">
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
                </div>

                {/* Tabla de Médicos */}
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Médicos/as</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-left text-sm whitespace-nowrap border rounded-lg">
                      <thead className="bg-indigo-50 text-indigo-900">
                        <tr>
                          <th className="px-6 py-3 border-b font-semibold">Nombre Completo</th>
                          <th className="px-6 py-3 border-b font-semibold">CI</th>
                          <th className="px-6 py-3 border-b font-semibold">Email</th>
                          <th className="px-6 py-3 border-b font-semibold">Especialidad(es)</th>
                          <th className="px-6 py-3 border-b font-semibold">Matrícula</th>
                          <th className="px-6 py-3 border-b font-semibold text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {personal.filter(p => p.rol === 'Medico').length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay médicos registrados.</td></tr>
                        ) : (
                          personal.filter(p => p.rol === 'Medico').map(p => (
                            <tr key={p._id} className="hover:bg-indigo-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{p.nombre} {p.apellido}</td>
                              <td className="px-6 py-4 text-gray-600">{p.ci}</td>
                              <td className="px-6 py-4 text-gray-600">{p.email}</td>
                              <td className="px-6 py-4 text-gray-600">
                                {Array.isArray(p.especialidad) ? p.especialidad.join(', ') : p.especialidad}
                              </td>
                              <td className="px-6 py-4 text-gray-600">{p.matriculaProfesional}</td>
                              <td className="px-6 py-4 text-center">
                                <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors mr-2" title="Editar médico">
                                  <Edit size={18} />
                                </button>
                                <button onClick={() => handleDeleteUser(p._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar médico">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla de Enfermeros */}
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Enfermeros/as</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-left text-sm whitespace-nowrap border rounded-lg">
                      <thead className="bg-teal-50 text-teal-900">
                        <tr>
                          <th className="px-6 py-3 border-b font-semibold">Nombre Completo</th>
                          <th className="px-6 py-3 border-b font-semibold">CI</th>
                          <th className="px-6 py-3 border-b font-semibold">Email</th>
                          <th className="px-6 py-3 border-b font-semibold">Especialidad(es)</th>
                          <th className="px-6 py-3 border-b font-semibold">Turno</th>
                          <th className="px-6 py-3 border-b font-semibold text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {personal.filter(p => p.rol === 'Enfermero').length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay enfermeros registrados.</td></tr>
                        ) : (
                          personal.filter(p => p.rol === 'Enfermero').map(p => (
                            <tr key={p._id} className="hover:bg-teal-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{p.nombre} {p.apellido}</td>
                              <td className="px-6 py-4 text-gray-600">{p.ci}</td>
                              <td className="px-6 py-4 text-gray-600">{p.email}</td>
                              <td className="px-6 py-4 text-gray-600">
                                {Array.isArray(p.especialidad) ? p.especialidad.join(', ') : p.especialidad}
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 font-medium border border-gray-300">{p.turno}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors mr-2" title="Editar enfermero">
                                  <Edit size={18} />
                                </button>
                                <button onClick={() => handleDeleteUser(p._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar enfermero">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      case 'pacientes':
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Directorio de Pacientes</h2>
              <button 
                onClick={() => handleOpenModal('Paciente')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                + Añadir Paciente
              </button>
            </div>
            
            {loadingPersonal ? (
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
                    {personal.filter(p => p.rol === 'Paciente').length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay pacientes registrados.</td></tr>
                    ) : (
                      personal.filter(p => p.rol === 'Paciente').map(p => (
                        <tr key={p._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{p.nombre} {p.apellido}</td>
                          <td className="px-6 py-4 text-gray-600">{p.ci}</td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="text-sm">{p.telefono || 'N/A'}</div>
                            <div className="text-xs text-gray-400">{p.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{p.direccion || 'N/A'}</td>
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
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-400">SALUD Y VIDA</h2>
          <p className="text-sm text-gray-400 mt-1">Panel Administrador</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} /><span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('farmacia')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'farmacia' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}>
            <Pill size={20} /><span>Farmacia</span>
          </button>
          <button onClick={() => setActiveTab('personal')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}>
            <Users size={20} /><span>Personal</span>
          </button>
          <button onClick={() => setActiveTab('pacientes')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'pacientes' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}>
            <UserPlus size={20} /><span>Pacientes</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <div className="mb-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Conectado como</p>
            <p className="font-bold text-sm truncate bg-gray-800 py-1.5 px-3 rounded-md">{user?.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
            <LogOut size={18} /><span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </div>

      {/* Modal para Crear/Editar Usuario (Personal o Paciente) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingUserId 
                ? (formData.rol === 'Paciente' ? 'Editar Paciente' : 'Editar Personal')
                : (formData.rol === 'Paciente' ? 'Registrar Nuevo Paciente' : 'Registrar Nuevo Personal')}
            </h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CI</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.ci} onChange={e => setFormData({...formData, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingUserId ? 'Contraseña (Opcional: Dejar vacío para no cambiar)' : 'Contraseña Inicial'}
                </label>
                <input type="password" required={!editingUserId} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              {formData.rol !== 'Paciente' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
                    value={formData.rol} 
                    onChange={e => setFormData({...formData, rol: e.target.value, especialidad: []})}
                    disabled={!!editingUserId} // Evitar cambiar rol al editar por seguridad de discriminadores
                  >
                    <option value="Medico">Médico</option>
                    <option value="Enfermero">Enfermero</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              ) : (
                <input type="hidden" value="Paciente" />
              )}

              {(formData.rol === 'Medico' || formData.rol === 'Enfermero') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Matrícula Profesional</label>
                  <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.matriculaProfesional} onChange={e => setFormData({...formData, matriculaProfesional: e.target.value})} />
                </div>
              )}

              {formData.rol === 'Medico' && (
                <div className="bg-gray-50 p-4 border rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad(es)</label>
                  <p className="text-xs text-gray-500 mb-2">Por defecto: Medicina General si no se marca ninguna</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {opcionesMedico.map(opcion => (
                      <label key={opcion} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          value={opcion}
                          checked={formData.especialidad.includes(opcion)}
                          onChange={handleEspecialidadChange}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{opcion}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.rol === 'Enfermero' && (
                <div className="bg-gray-50 p-4 border rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad(es)</label>
                  <p className="text-xs text-gray-500 mb-2">Por defecto: Enfermería General si no se marca ninguna</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {opcionesEnfermero.map(opcion => (
                      <label key={opcion} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          value={opcion}
                          checked={formData.especialidad.includes(opcion)}
                          onChange={handleEspecialidadChange}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{opcion}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.rol === 'Enfermero' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Turno Asignado</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})}>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
              )}

              {formData.rol === 'Paciente' && (
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
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  {editingUserId ? 'Actualizar Registro' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
