import React, { useState, useEffect } from 'react';
import { Pill, Search, CheckCircle, AlertTriangle, User } from 'lucide-react';
import api from '../../services/api';

const PharmacyDispense = () => {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      const { data } = await api.get('/users?rol=Paciente');
      setPacientes(data);
    } catch (e) {
      console.error("Error al cargar pacientes", e);
    }
  };

  const fetchRecetas = async (pacienteId) => {
    if (!pacienteId) {
      setRecetas([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/pharmacy/recetas/paciente/${pacienteId}`);
      // Solo mostramos las pendientes o las pagadas que no han sido entregadas.
      // Dependiendo de la regla, podría ser solo las pendientes. Mostremos todas para historial.
      setRecetas(data);
    } catch (e) {
      console.error("Error al cargar recetas", e);
    }
    setLoading(false);
  };

  const handleSelectPaciente = (e) => {
    const pId = e.target.value;
    setSelectedPacienteId(pId);
    fetchRecetas(pId);
  };

  const handleEntregarReceta = async (recetaId) => {
    if (!window.confirm('¿Confirmar la entrega de todos los medicamentos de esta receta? Se descontarán del inventario (FEFO).')) return;
    
    try {
      await api.put(`/pharmacy/recetas/${recetaId}/entregar`);
      alert("Receta entregada exitosamente.");
      fetchRecetas(selectedPacienteId);
    } catch (error) {
      alert(error.response?.data?.message || "Error al procesar la entrega. Verifique el stock.");
    }
  };

  const recetasPendientes = recetas.filter(r => r.estadoEntrega === 'Pendiente');
  const recetasEntregadas = recetas.filter(r => r.estadoEntrega === 'Entregado');

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in max-w-5xl mx-auto mt-6">
      <div className="mb-8 border-b-2 border-blue-600 inline-block pr-8 pb-2">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <Pill className="text-blue-600" size={32} />
          Punto de Despacho
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Busca a un paciente para procesar y entregar sus recetas médicas.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Search size={18} className="text-blue-500" /> Seleccionar Paciente
        </label>
        <select 
          value={selectedPacienteId}
          onChange={handleSelectPaciente}
          className="w-full border border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
        >
          <option value="">-- Elija un paciente --</option>
          {pacientes.map(pac => (
            <option key={pac._id} value={pac._id}>{pac.nombre} {pac.apellido} (CI: {pac.ci})</option>
          ))}
        </select>
      </div>

      {selectedPacienteId && (
        <div>
          {loading ? (
            <p className="text-center py-10 text-gray-500 font-medium animate-pulse">Cargando recetas...</p>
          ) : (
            <div className="space-y-8">
              
              {/* Sección: Recetas Pendientes */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={24} /> Recetas Pendientes de Entrega
                </h3>
                {recetasPendientes.length === 0 ? (
                  <p className="text-center py-6 bg-orange-50/50 rounded-xl border border-orange-100 text-orange-600 font-medium">
                    No hay recetas pendientes para este paciente.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {recetasPendientes.map(receta => (
                      <div key={receta._id} className="bg-white border-2 border-orange-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-lg uppercase tracking-wide">
                              Emitida: {new Date(receta.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wide ${receta.estadoPago === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              Pago: {receta.estadoPago}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            <strong>Médico:</strong> Dr. {receta.medicoId?.nombre} {receta.medicoId?.apellido}
                          </p>
                          
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Medicamentos a Entregar:</h4>
                            <ul className="space-y-2">
                              {receta.medicamentos.map((med, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm font-medium">
                                  <span>{med.medicamentoId?.nombreComercial} ({med.dosis})</span>
                                  <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-200">x{med.cantidad}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-48">
                          <button 
                            onClick={() => handleEntregarReceta(receta._id)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={20} />
                            Despachar
                          </button>
                          <p className="text-center text-[10px] text-gray-400 mt-3 px-2">
                            El inventario se descontará automáticamente usando el método FEFO.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Sección: Recetas Entregadas (Historial) */}
              <section className="opacity-80">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} /> Historial de Entregas
                </h3>
                {recetasEntregadas.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay historial de entregas.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recetasEntregadas.map(receta => (
                      <div key={receta._id} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-700">Emitida el {new Date(receta.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{receta.medicamentos.length} medicamento(s)</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                          Entregado
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PharmacyDispense;
