import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, X, FileText, Clipboard, Search, Check } from 'lucide-react';
import api from '../../services/api';

const AttendAppointment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const citaInicial = location.state?.cita;
  const [consultaActiva, setConsultaActiva] = useState(citaInicial || null);
  const [evolucionesPrevias, setEvolucionesPrevias] = useState([]);
  const [nuevaEvolucion, setNuevaEvolucion] = useState({ asunto: '', sintomas: citaInicial?.sintomasPrevios || '', descripcion: '' });
  
  const [inventario, setInventario] = useState([]);
  const [busquedaMed, setBusquedaMed] = useState('');
  const [medicamentosRecetados, setMedicamentosRecetados] = useState([]);

  useEffect(() => {
    if (!consultaActiva) {
      navigate('/doctor/citas');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [historialRes, inventarioRes] = await Promise.all([
          api.get(`/clinic/evoluciones/paciente/${consultaActiva.pacienteId._id}`),
          api.get('/pharmacy/inventario')
        ]);
        setEvolucionesPrevias(historialRes.data);
        setInventario(inventarioRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [consultaActiva, navigate]);

  if (!consultaActiva) return null;

  const cerrarConsulta = () => navigate('/doctor/citas');

  // --- MÉTODOS RECETARIO ---
  const [showDropdown, setShowDropdown] = useState(false);

  const medicamentosFiltrados = inventario.filter(m => {
    const termino = busquedaMed.toLowerCase();
    const nombre = m.nombre || '';
    const principioActivo = m.principioActivo || '';
    return nombre.toLowerCase().includes(termino) || principioActivo.toLowerCase().includes(termino);
  });

  const agregarAReceta = (med) => {
    if (!medicamentosRecetados.find(m => m.medicamentoId === med._id)) {
      setMedicamentosRecetados([...medicamentosRecetados, { 
        medicamentoId: med._id, 
        nombreComercial: med.nombre,
        presentacion: med.presentacion,
        dosis: '', 
        cantidad: 1, 
        precioUnitario: med.precioUnitario || 0 
      }]);
    }
    setBusquedaMed('');
  };

  const concluirCita = async () => {
    if (!nuevaEvolucion.asunto || !nuevaEvolucion.descripcion) {
      return alert('Asunto y Descripción son obligatorios');
    }

    try {
      if (medicamentosRecetados.length > 0) {
        const sinDosis = medicamentosRecetados.some(m => !m.dosis);
        if (sinDosis) return alert('Todos los medicamentos recetados deben tener una dosis indicada.');
      }

      // 1. Crear Evolución
      const resEvo = await api.post('/clinic/evoluciones', {
        pacienteId: consultaActiva.pacienteId._id,
        medicoId: user._id || user.id,
        citaId: consultaActiva._id,
        asunto: nuevaEvolucion.asunto,
        sintomas: nuevaEvolucion.sintomas,
        descripcion: nuevaEvolucion.descripcion
      });

      // 2. Crear Receta
      if (medicamentosRecetados.length > 0) {
        await api.post('/pharmacy/recetas', {
          pacienteId: consultaActiva.pacienteId._id,
          medicoId: user._id || user.id,
          evolucionMedicaId: resEvo.data._id,
          indicacionesGenerales: 'Seguir indicaciones de cada medicamento.',
          medicamentos: medicamentosRecetados
        });
      }

      alert('Consulta concluida con éxito');
      navigate('/doctor/citas');

    } catch (e) {
      console.error(e);
      alert('Error al guardar la consulta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col font-sans">
      {/* Navbar Superior */}
      <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Consulta en Progreso</h1>
            <p className="text-xs font-semibold text-gray-500 tracking-wider">Paciente: {consultaActiva.pacienteId?.nombre} {consultaActiva.pacienteId?.apellido}</p>
          </div>
        </div>
        <button onClick={cerrarConsulta} className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition font-medium bg-gray-100 px-4 py-2 rounded-lg">
          <span>Cancelar Atención (Salir)</span>
          <X size={20} />
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* LADO IZQUIERDO: Historial del Paciente */}
        <section className="w-full md:w-1/2 flex flex-col gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 overflow-hidden">
          <h2 className="text-lg font-extrabold text-gray-800 border-b pb-2 flex items-center gap-2 shrink-0">
            <FileText className="text-blue-600" /> Historial Clínico Previo
          </h2>
          <div className="flex-1 overflow-y-auto pr-2">
            {evolucionesPrevias.length === 0 ? (
              <p className="text-gray-500 text-center py-10 italic">No hay historial clínico previo para este paciente.</p>
            ) : (
              <div className="space-y-4">
                {evolucionesPrevias.map(evo => (
                  <div key={evo._id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">{evo.asunto}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">{new Date(evo.fechaHora).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1"><strong>Médico:</strong> Dr. {evo.medicoId?.nombre} {evo.medicoId?.apellido}</p>
                    {evo.sintomas && <p className="text-xs text-gray-600 mb-1"><strong>Síntomas:</strong> {evo.sintomas}</p>}
                    <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 mt-2"><strong>Descripción:</strong> {evo.descripcion}</p>
                    
                    {evo.recetaId && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 p-2 rounded">
                        <p className="text-xs font-bold text-emerald-800 mb-1">Receta Emitida:</p>
                        <ul className="list-disc list-inside text-xs text-emerald-700">
                          {evo.recetaId.medicamentos?.map((m, i) => (
                            <li key={i}>{m.medicamentoId?.nombreComercial || m.medicamentoId?.nombre} ({m.dosis}) - x{m.cantidad}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* LADO DERECHO: Nueva Consulta y Recetario */}
        <section className="w-full md:w-1/2 flex flex-col gap-4 overflow-hidden">
          
          {/* Formulario de Evolución */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-none">
            <h2 className="text-lg font-extrabold text-gray-800 border-b pb-2 mb-4">Nueva Evolución Médica</h2>
            <div className="space-y-3">
              <input 
                type="text" placeholder="Asunto (Ej. Control de Diabetes)"
                value={nuevaEvolucion.asunto} onChange={e => setNuevaEvolucion({...nuevaEvolucion, asunto: e.target.value})}
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <textarea 
                placeholder="Síntomas presentados..." rows="2"
                value={nuevaEvolucion.sintomas} onChange={e => setNuevaEvolucion({...nuevaEvolucion, sintomas: e.target.value})}
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              ></textarea>
              <textarea 
                placeholder="Descripción detallada de la consulta / diagnóstico..." rows="3"
                value={nuevaEvolucion.descripcion} onChange={e => setNuevaEvolucion({...nuevaEvolucion, descripcion: e.target.value})}
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Recetario FEFO */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-lg font-extrabold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2 shrink-0">
              <Clipboard className="text-blue-600" /> Recetario Inteligente (Inventario en Vivo)
            </h2>
            
            <div className="relative mb-4 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="text-gray-400" size={18} /></div>
              <input
                type="text" placeholder="Buscar en Farmacia..."
                value={busquedaMed} 
                onChange={(e) => setBusquedaMed(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-sm"
              />
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {medicamentosFiltrados.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">No hay medicamentos disponibles</div>
                  ) : 
                  medicamentosFiltrados.map(med => {
                    const hasStock = med.stock > 0;
                    return (
                    <div key={med._id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50 transition">
                      <div>
                        <div className={`font-bold text-sm ${hasStock ? 'text-gray-800' : 'text-red-600 line-through'}`}>{med.nombre}</div>
                        <div className="text-[10px] text-gray-500">{med.principioActivo} - {med.presentacion}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => agregarAReceta(med)} className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold rounded-lg hover:bg-blue-200">Añadir</button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>

            {/* Lista Receta */}
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4">
              {medicamentosRecetados.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6 font-medium">No se han recetado medicamentos.</p>
              ) : (
                <div className="space-y-2">
                  {medicamentosRecetados.map((item, idx) => (
                    <div key={item.medicamentoId} className="bg-white p-2 rounded-lg border border-gray-200 flex flex-col gap-2 relative">
                      <button onClick={() => setMedicamentosRecetados(medicamentosRecetados.filter(m => m.medicamentoId !== item.medicamentoId))} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                      <div className="flex justify-between items-center pr-6">
                        <span className="font-bold text-gray-800 text-sm">{item.nombreComercial}</span>
                        <input 
                          type="number" min="1" value={item.cantidad} 
                          onChange={(e) => {
                            const newArr = [...medicamentosRecetados];
                            newArr[idx].cantidad = parseInt(e.target.value);
                            setMedicamentosRecetados(newArr);
                          }}
                          className="w-16 text-center text-sm font-bold p-1 bg-gray-50 border border-gray-200 rounded focus:border-blue-400 focus:outline-none" 
                        />
                      </div>
                      <input 
                        type="text" placeholder="Dosis (Ej. 1 tableta cada 8 hrs)" value={item.dosis}
                        onChange={(e) => {
                          const newArr = [...medicamentosRecetados];
                          newArr[idx].dosis = e.target.value;
                          setMedicamentosRecetados(newArr);
                        }}
                        className="w-full text-xs p-1.5 bg-gray-50 border border-gray-200 rounded focus:border-blue-400 focus:outline-none pr-8"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={concluirCita} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-auto shrink-0">
              <Check size={20} /> Concluir Consulta y Guardar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AttendAppointment;
