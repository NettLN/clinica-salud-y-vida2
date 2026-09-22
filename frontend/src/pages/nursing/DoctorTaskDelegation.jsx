import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clipboard, List, Play, CheckCircle, Clock, FileText, AlertTriangle, Check } from 'lucide-react';
import api from '../../services/api';

const DoctorTaskDelegation = () => {
  const { user } = useAuth();
  
  const [listaEnfermeros, setListaEnfermeros] = useState([]);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [misTareas, setMisTareas] = useState([]);
  const [historialPacienteTarea, setHistorialPacienteTarea] = useState([]);

  const [nuevaTarea, setNuevaTarea] = useState({
    asunto: '', descripcion: '', tipo: 'General', plazoMinutos: 30, 
    enfermerosAsignados: [], pacienteId: '', historialesPermitidos: []
  });

  useEffect(() => {
    fetchDependencias();
    fetchMisTareas();
  }, []);

  useEffect(() => {
    if (nuevaTarea.pacienteId) {
      api.get(`/clinic/evoluciones/paciente/${nuevaTarea.pacienteId}`)
        .then(res => setHistorialPacienteTarea(res.data))
        .catch(console.error);
    } else {
      setHistorialPacienteTarea([]);
    }
  }, [nuevaTarea.pacienteId]);

  const fetchDependencias = async () => {
    try {
      const [enfRes, pacRes] = await Promise.all([
        api.get('/users?rol=Enfermero'),
        api.get('/users?rol=Paciente')
      ]);
      setListaEnfermeros(enfRes.data);
      setListaPacientes(pacRes.data);
    } catch (e) { console.error('Error fetching dependencias', e); }
  };

  const fetchMisTareas = async () => {
    try {
      const { data } = await api.get(`/nursing/tareas/medico/${user._id || user.id}`);
      setMisTareas(data);
    } catch (e) { console.error('Error fetching tareas', e); }
  };

  const handleCrearTarea = async () => {
    if (!nuevaTarea.asunto || !nuevaTarea.descripcion) {
      return alert('Asunto y Descripción son obligatorios');
    }
    if (nuevaTarea.tipo === 'Especifica' && nuevaTarea.enfermerosAsignados.length === 0) {
      return alert('Debes seleccionar al menos un enfermero para tareas específicas');
    }

    try {
      const payload = {
        ...nuevaTarea,
        pacienteId: nuevaTarea.pacienteId || undefined,
        medicoId: user._id || user.id,
        plazoLimite: new Date(Date.now() + nuevaTarea.plazoMinutos * 60000)
      };

      await api.post('/nursing/tareas', payload);
      alert('Tarea despachada exitosamente');
      
      setNuevaTarea({
        asunto: '', descripcion: '', tipo: 'General', plazoMinutos: 30, 
        enfermerosAsignados: [], pacienteId: '', historialesPermitidos: []
      });
      fetchMisTareas();
    } catch (e) {
      console.error(e);
      alert('Error al crear tarea');
    }
  };

  const handleAuditarTarea = async (tareaId, nuevoEstado) => {
    try {
      await api.put(`/nursing/tareas/${tareaId}/auditar`, { estado: nuevoEstado });
      fetchMisTareas();
    } catch (e) {
      console.error(e);
      alert('Error al auditar tarea');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <Clipboard className="text-indigo-600" /> Delegación y Auditoría de Tareas
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Creación de Tareas */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Nueva Orden de Enfermería</h2>
          <div className="space-y-4">
            <input 
              type="text" placeholder="Asunto (Ej. Toma de Vía Periférica)" 
              value={nuevaTarea.asunto} onChange={e => setNuevaTarea({...nuevaTarea, asunto: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
            />
            <textarea 
              placeholder="Descripción de la orden..." rows="3" 
              value={nuevaTarea.descripcion} onChange={e => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-medium text-sm resize-none"
            ></textarea>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Tarea</label>
                <select
                  value={nuevaTarea.tipo}
                  onChange={e => setNuevaTarea({...nuevaTarea, tipo: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700"
                >
                  <option value="General">General (Cualquier Enfermero)</option>
                  <option value="Especifica">Específica (Seleccionar)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tiempo Límite (Minutos)</label>
                <input 
                  type="number" min="10" value={nuevaTarea.plazoMinutos}
                  onChange={e => setNuevaTarea({...nuevaTarea, plazoMinutos: parseInt(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700"
                />
              </div>
            </div>

            {nuevaTarea.tipo === 'Especifica' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Asignar a (Selecciona uno o más)</label>
                <div className="w-full border border-gray-200 rounded-xl p-3 h-32 overflow-y-auto space-y-2 bg-gray-50">
                  {listaEnfermeros.map(enf => (
                    <label key={enf._id} className="flex items-center gap-2 text-sm text-gray-700 font-bold cursor-pointer hover:bg-gray-100 p-1.5 rounded transition">
                      <input 
                        type="checkbox" 
                        value={enf._id}
                        checked={nuevaTarea.enfermerosAsignados.includes(enf._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNuevaTarea({...nuevaTarea, enfermerosAsignados: [...nuevaTarea.enfermerosAsignados, enf._id]});
                          } else {
                            setNuevaTarea({...nuevaTarea, enfermerosAsignados: nuevaTarea.enfermerosAsignados.filter(id => id !== enf._id)});
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      {enf.nombre} {enf.apellido}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 mt-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Delegar Atención de Paciente (Opcional)</label>
              <select 
                value={nuevaTarea.pacienteId}
                onChange={e => setNuevaTarea({...nuevaTarea, pacienteId: e.target.value, historialesPermitidos: []})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 mb-4"
              >
                <option value="">-- Ninguno --</option>
                {listaPacientes.map(pac => (
                  <option key={pac._id} value={pac._id}>{pac.nombre} {pac.apellido} (CI: {pac.ci})</option>
                ))}
              </select>

              {nuevaTarea.pacienteId && historialPacienteTarea.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                  <label className="block text-xs font-bold text-blue-800 mb-2">Compartir Registros de Historial Clínico</label>
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                    {historialPacienteTarea.map(evo => (
                      <label key={evo._id} className="flex items-center gap-2 text-xs bg-white p-2 rounded shadow-sm border border-blue-50 cursor-pointer hover:bg-blue-50 transition">
                        <input 
                          type="checkbox"
                          checked={nuevaTarea.historialesPermitidos.includes(evo._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNuevaTarea({...nuevaTarea, historialesPermitidos: [...nuevaTarea.historialesPermitidos, evo._id]});
                            } else {
                              setNuevaTarea({...nuevaTarea, historialesPermitidos: nuevaTarea.historialesPermitidos.filter(id => id !== evo._id)});
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold text-gray-700">{evo.asunto} - {new Date(evo.fechaHora).toLocaleDateString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleCrearTarea} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition">
              Despachar Tarea
            </button>
          </div>
        </section>

        {/* Panel de Auditoría */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" /> Auditoría de Tareas
          </h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {misTareas.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-10 text-center">No has delegado tareas recientemente.</p>
            ) : (
              misTareas.map(tarea => (
                <div key={tarea._id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{tarea.asunto}</h4>
                      <p className="text-xs text-gray-500 mt-1">{tarea.descripcion}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                      tarea.estado === 'Cumplida' ? 'bg-green-100 text-green-700' : 
                      tarea.estado === 'En_Revision' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tarea.estado.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {tarea.estado === 'En_Revision' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mt-2">
                      <p className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-1">
                        <AlertTriangle size={14} /> Requiere tu Auditoría
                      </p>
                      {tarea.evidencia && (
                         <div className="mb-3 p-2 bg-white rounded border border-yellow-100 text-xs text-gray-700">
                           <strong>Evidencia ({tarea.evidencia.formato}):</strong> {tarea.evidencia.notas}
                         </div>
                      )}
                      <button onClick={() => handleAuditarTarea(tarea._id, 'Cumplida')} className="w-full bg-green-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                        <Check size={16} /> Aprobar y Marcar Cumplida
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorTaskDelegation;
