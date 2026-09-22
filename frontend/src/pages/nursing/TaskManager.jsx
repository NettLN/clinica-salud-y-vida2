import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clipboard, List, Play, CheckCircle, Clock, FileText, AlertTriangle, X } from 'lucide-react';
import api from '../../services/api';

const TaskManager = () => {
  const { user } = useAuth();
  
  const [tareas, setTareas] = useState([]);
  const [tareaEnProceso, setTareaEnProceso] = useState(null);
  const [evidenciaFormato, setEvidenciaFormato] = useState('Texto');
  const [notasEvidencia, setNotasEvidencia] = useState('');

  const [showHistorial, setShowHistorial] = useState(false);
  const [historialPaciente, setHistorialPaciente] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);

  useEffect(() => {
    fetchTareas();
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchTareas = async () => {
    try {
      const idStr = user._id || user.id;
      const { data } = await api.get(`/nursing/tareas/enfermero/${idStr}`);
      setTareas(data);
      const enProceso = data.find(t => t.estado === 'En_Proceso' && t.enfermeroEjecutor === idStr);
      if (enProceso) setTareaEnProceso(enProceso);
    } catch (e) { console.error(e); }
  };

  const tomarTarea = async (tareaId) => {
    if (tareaEnProceso) return alert('Ya tienes una tarea en proceso. Finalízala primero.');
    try {
      await api.put(`/nursing/tareas/${tareaId}/tomar`, { enfermeroId: user._id || user.id });
      fetchTareas();
    } catch (e) { alert('Error al tomar tarea'); }
  };

  const finalizarTarea = async () => {
    if (!notasEvidencia) return alert('Debes adjuntar notas o evidencia antes de finalizar.');
    try {
      await api.put(`/nursing/tareas/${tareaEnProceso._id}/finalizar`, {
        evidenciaFormato, notasEvidencia
      });
      alert('Tarea enviada a revisión');
      setTareaEnProceso(null);
      setNotasEvidencia('');
      fetchTareas();
    } catch (e) { alert('Error al finalizar tarea'); }
  };

  const verHistorial = async (paciente) => {
    if (!paciente) return;
    try {
      const { data } = await api.get(`/clinic/evoluciones/paciente/${paciente._id}`);
      setHistorialPaciente(data);
      setPacienteActual(paciente);
      setShowHistorial(true);
    } catch (e) { alert('Error al obtener historial'); }
  };

  const getMinutosRestantes = (plazoLimite) => {
    const diff = new Date(plazoLimite).getTime() - new Date().getTime();
    return Math.floor(diff / 60000);
  };

  const tareasDisponibles = tareas.filter(t => t.estado === 'Pendiente_General' || t.estado === 'Pendiente_Asignada');

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      <section className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-black text-gray-800 border-b-2 border-teal-500 inline-block pr-8 pb-2 mb-6 flex items-center gap-2">
          <List className="text-teal-500" /> Pool de Tareas Clínicas
        </h2>
        
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[70vh]">
          {tareasDisponibles.length === 0 ? (
            <p className="text-center text-gray-500 italic py-10">No hay tareas pendientes en la estación.</p>
          ) : (
            tareasDisponibles.map(tarea => {
              const minRestantes = getMinutosRestantes(tarea.plazoLimite);
              const isCritico = minRestantes < 15;
              const isVencida = minRestantes < 0;

              return (
                <div key={tarea._id} className={`p-5 rounded-2xl border-l-4 shadow-sm flex flex-col gap-3 transition hover:shadow-md ${
                  isVencida ? 'border-red-500 bg-red-50' : 
                  isCritico ? 'border-orange-500 bg-orange-50' : 'border-teal-500 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{tarea.asunto}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tarea.tipo==='Especifica'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{tarea.tipo}</span>
                      </div>
                      <p className="text-xs text-gray-600">Dr. {tarea.medicoId?.nombre} {tarea.medicoId?.apellido}</p>
                      <p className="text-sm font-medium text-gray-700 mt-2">{tarea.descripcion}</p>
                    </div>
                    <div className={`flex flex-col items-end gap-1 ${isVencida ? 'text-red-600' : isCritico ? 'text-orange-600' : 'text-gray-500'}`}>
                      <Clock size={20} />
                      <span className="text-xs font-bold">{isVencida ? 'VENCIDA' : `${minRestantes} min`}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2 border-t border-gray-200/50">
                    <button 
                      onClick={() => tomarTarea(tarea._id)}
                      disabled={!!tareaEnProceso}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition ${
                        tareaEnProceso ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <Play size={16} /> Iniciar Protocolo
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-teal-100 flex-1 relative overflow-y-auto overflow-x-hidden max-h-[75vh]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0"></div>
          
          <h2 className="text-xl font-black text-teal-800 mb-6 flex items-center gap-2 relative z-10">
            <Play className="text-teal-600 fill-teal-600" /> Protocolo Activo
          </h2>

          {!tareaEnProceso ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 relative z-10 min-h-[400px]">
              <Clipboard size={64} className="text-gray-300 mb-4" />
              <p className="font-bold text-gray-500">No hay tareas en proceso.</p>
              <p className="text-sm text-gray-400">Toma una del pool para comenzar.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full relative z-10">
              <div className="bg-teal-50 border-2 border-teal-200 p-4 rounded-2xl flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-1">Tiempo Restante</span>
                  <span className={`text-3xl font-black ${getMinutosRestantes(tareaEnProceso.plazoLimite) < 5 ? 'text-red-500 animate-pulse' : 'text-teal-800'}`}>
                    {getMinutosRestantes(tareaEnProceso.plazoLimite)} <span className="text-base font-bold">min</span>
                  </span>
                </div>
                <Clock size={40} className="text-teal-300" />
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{tareaEnProceso.asunto}</h3>
                <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">{tareaEnProceso.descripcion}</p>
              </div>

              {tareaEnProceso.historialesPermitidos?.length > 0 && tareaEnProceso.pacienteId && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Permisos Especiales</p>
                  <button 
                    onClick={() => verHistorial(tareaEnProceso.pacienteId)}
                    className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-blue-100 transition"
                  >
                    <FileText size={18} /> Ver Historial Clínico de {tareaEnProceso.pacienteId.nombre}
                  </button>
                </div>
              )}

              <div className="mt-auto">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Registro de Evidencia</p>
                
                <div className="flex gap-2 mb-3">
                  {['Texto', 'Imagen', 'Audio'].map(fmt => (
                    <button 
                      key={fmt} onClick={() => setEvidenciaFormato(fmt)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${evidenciaFormato === fmt ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                
                <textarea 
                  value={notasEvidencia} onChange={e => setNotasEvidencia(e.target.value)}
                  placeholder="Escribe notas, observaciones..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none h-24 mb-4"
                ></textarea>

                <button 
                  onClick={finalizarTarea}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] transition flex justify-center items-center gap-2"
                >
                  <CheckCircle size={20} /> Concluir Protocolo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {showHistorial && pacienteActual && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button onClick={() => setShowHistorial(false)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
              <X size={20} className="text-gray-600" />
            </button>
            
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FileText size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Historial Clínico Autorizado</h3>
                <p className="text-sm font-semibold text-gray-500">Paciente: {pacienteActual.nombre} {pacienteActual.apellido}</p>
              </div>
            </div>

            <div className="overflow-y-auto pr-2 space-y-4">
              {historialPaciente.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <AlertTriangle className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 font-medium">El paciente no tiene registros clínicos previos.</p>
                </div>
              ) : (
                historialPaciente.map(evo => (
                  <div key={evo._id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900">{evo.asunto}</span>
                      <span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm text-gray-600">{new Date(evo.fechaHora).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Dr.</strong> {evo.medicoId?.nombre} ({evo.medicoId?.especialidad?.join(', ')})</p>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 mt-2 text-sm text-gray-700 leading-relaxed">
                      {evo.descripcion}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
