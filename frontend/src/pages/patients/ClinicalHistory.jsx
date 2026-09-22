import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Search, User } from 'lucide-react';
import api from '../../services/api';

const ClinicalHistory = () => {
  const { user } = useAuth();
  
  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [evoluciones, setEvoluciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const esPaciente = user?.rol === 'Paciente';

  useEffect(() => {
    if (esPaciente) {
      fetchEvoluciones(user._id);
    } else {
      fetchPacientes();
    }
  }, [esPaciente, user._id]);

  const fetchPacientes = async () => {
    try {
      const { data } = await api.get('/users?rol=Paciente');
      setPacientes(data);
    } catch (e) {
      console.error("Error al cargar pacientes", e);
    }
  };

  const fetchEvoluciones = async (pacienteId) => {
    if (!pacienteId) {
      setEvoluciones([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/clinic/evoluciones/paciente/${pacienteId}`);
      setEvoluciones(data);
    } catch (e) {
      console.error("Error al cargar historial", e);
    }
    setLoading(false);
  };

  const handleSelectPaciente = (e) => {
    const pId = e.target.value;
    setSelectedPacienteId(pId);
    fetchEvoluciones(pId);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in max-w-5xl mx-auto mt-6">
      <div className="mb-8 border-b-2 border-blue-600 inline-block pr-8 pb-2">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <FileText className="text-blue-600" size={32} />
          Expedientes Clínicos
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {esPaciente ? 'Tu historial de atenciones médicas' : 'Consulta el historial médico de los pacientes'}
        </p>
      </div>

      {!esPaciente && (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Search size={18} className="text-blue-500" /> Buscar Paciente
          </label>
          <select 
            value={selectedPacienteId}
            onChange={handleSelectPaciente}
            className="w-full border border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
          >
            <option value="">-- Selecciona un paciente --</option>
            {pacientes.map(pac => (
              <option key={pac._id} value={pac._id}>{pac.nombre} {pac.apellido} (CI: {pac.ci})</option>
            ))}
          </select>
        </div>
      )}

      {(esPaciente || selectedPacienteId) && (
        <div>
          {loading ? (
            <p className="text-center py-10 text-gray-500 font-medium animate-pulse">Cargando historial...</p>
          ) : evoluciones.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={30} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No se encontraron registros clínicos.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {evoluciones.map(evo => (
                <div key={evo._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-black text-gray-800 text-xl">{evo.asunto}</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
                        <User size={14} /> Dr. {evo.medicoId?.nombre} {evo.medicoId?.apellido}
                      </p>
                    </div>
                    <span className="text-sm bg-blue-50 text-blue-700 border border-blue-100 font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {new Date(evo.fechaHora).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {evo.sintomas && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Síntomas</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{evo.sintomas}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción / Diagnóstico</h4>
                    <p className="text-sm text-gray-800 bg-blue-50/30 p-4 rounded-xl border border-blue-100">{evo.descripcion}</p>
                  </div>
                  
                  {evo.recetaId && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-emerald-800 mb-2">Receta Emitida</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {evo.recetaId.medicamentos?.map((m, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">
                            <div>
                              <span className="font-bold text-gray-800 text-sm block">{m.medicamentoId?.nombreComercial}</span>
                              <span className="text-xs text-gray-500">{m.dosis}</span>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">x{m.cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClinicalHistory;
