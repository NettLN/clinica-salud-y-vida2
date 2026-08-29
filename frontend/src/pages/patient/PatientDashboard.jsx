import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, ChevronRight, User, Stethoscope, FileText, XCircle, RefreshCw, X, Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('reservar'); // 'reservar', 'citas', 'recetas'
  
  // -- RESERVA STATE --
  const [step, setStep] = useState(1);
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [fechaReserva, setFechaReserva] = useState(new Date().toISOString().split('T')[0]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [sintomas, setSintomas] = useState('');

  // -- MIS CITAS STATE --
  const [misCitas, setMisCitas] = useState([]);
  const [citasTab, setCitasTab] = useState('activas'); // 'activas', 'historial'

  // -- RECETAS STATE --
  const [misRecetas, setMisRecetas] = useState([]);
  const [selectedReceta, setSelectedReceta] = useState(null);

  // Inicialización
  useEffect(() => {
    if (activeTab === 'reservar' && step === 1) fetchMedicos();
    if (activeTab === 'citas') fetchMisCitas();
    if (activeTab === 'recetas') fetchMisRecetas();
  }, [activeTab, step]);

  const fetchMedicos = async () => {
    try {
      const { data } = await api.get('/users?rol=Medico');
      setMedicos(data);
    } catch (error) {
      console.error("Error al cargar médicos", error);
    }
  };

  const fetchHorarios = async (medico, fecha) => {
    try {
      const { data } = await api.get(`/clinic/citas/disponibilidad?medicoId=${medico._id}&fecha=${fecha}`);
      setHorariosDisponibles(data.cupos || []);
    } catch (error) {
      console.error("Error al cargar disponibilidad", error);
    }
  };

  const handleSelectMedico = (medico) => {
    setSelectedMedico(medico);
    fetchHorarios(medico, fechaReserva);
    setStep(2);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFechaReserva(newDate);
    fetchHorarios(selectedMedico, newDate);
  };

  const handleConfirmarReserva = async () => {
    try {
      await api.post('/clinic/citas', {
        pacienteId: user._id,
        medicoId: selectedMedico._id,
        fecha: fechaReserva,
        hora: selectedHorario,
        sintomasPrevios: sintomas
      });
      alert('Cita reservada con éxito');
      setStep(1);
      setSelectedMedico(null);
      setSelectedHorario(null);
      setSintomas('');
      setActiveTab('citas');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al reservar cita');
    }
  };

  const fetchMisCitas = async () => {
    try {
      const { data } = await api.get(`/clinic/citas/paciente/${user._id}`);
      setMisCitas(data);
    } catch (error) {
      console.error("Error al cargar citas", error);
    }
  };

  const handleCancelarCita = async (id) => {
    if (!window.confirm("¿Seguro que desea cancelar esta cita?")) return;
    try {
      await api.put(`/clinic/citas/${id}/cancelar`, { canceladoPor: 'Paciente' });
      fetchMisCitas();
    } catch (error) {
      alert('Error al cancelar');
    }
  };

  const fetchMisRecetas = async () => {
    try {
      const { data } = await api.get(`/pharmacy/recetas/paciente/${user._id}`);
      setMisRecetas(data);
    } catch (error) {
      console.error("Error al cargar recetas", error);
    }
  };

  const citasActivas = misCitas.filter(c => c.estado === 'Pendiente');
  const citasHistorial = misCitas.filter(c => c.estado !== 'Pendiente');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-5 shadow-lg flex justify-between items-center rounded-b-[2.5rem]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Salud & Vida</h1>
          <p className="text-sm text-blue-100 mt-1 font-medium">Panel del Paciente</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold hidden md:block">{user?.nombre}</span>
          <button onClick={logout} className="p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition shadow-sm">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 max-w-2xl mx-auto w-full mt-2">
        
        {/* TABS NAVEGACIÓN (Desktop/Tablet sup, Mobile fijo abajo) */}
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around p-3 md:relative md:bg-transparent md:shadow-none md:justify-center md:gap-4 md:mb-8 z-40">
          <button 
            onClick={() => { setActiveTab('reservar'); setStep(1); }}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-2xl transition-all ${activeTab === 'reservar' ? 'text-blue-600 bg-blue-100 md:bg-white md:shadow-md font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Calendar size={22} />
            <span className="text-[10px] md:text-sm uppercase tracking-wide">Reservar</span>
          </button>
          <button 
            onClick={() => setActiveTab('citas')}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-2xl transition-all ${activeTab === 'citas' ? 'text-blue-600 bg-blue-100 md:bg-white md:shadow-md font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Clock size={22} />
            <span className="text-[10px] md:text-sm uppercase tracking-wide">Mis Citas</span>
          </button>
          <button 
            onClick={() => setActiveTab('recetas')}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-2xl transition-all ${activeTab === 'recetas' ? 'text-blue-600 bg-blue-100 md:bg-white md:shadow-md font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <FileText size={22} />
            <span className="text-[10px] md:text-sm uppercase tracking-wide">Recetas</span>
          </button>
        </div>

        {/* CONTENIDO TABS */}
        <div className="animate-fade-in-up">
          {/* ---- TAB: RESERVAR ---- */}
          {activeTab === 'reservar' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              
              {/* Stepper Visual */}
              <div className="flex items-center justify-between mb-8 px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${step >= 1 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>1</div>
                <div className={`flex-1 h-1.5 mx-2 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${step >= 2 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>2</div>
                <div className={`flex-1 h-1.5 mx-2 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${step >= 3 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>3</div>
              </div>

              {/* Paso 1: Especialidad/Médico */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                    <Stethoscope className="text-blue-500" /> Selecciona Médico
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicos.length === 0 ? (
                      <p className="text-gray-500 italic">Cargando médicos...</p>
                    ) : (
                      medicos.map(med => (
                        <button
                          key={med._id}
                          onClick={() => handleSelectMedico(med)}
                          className="bg-gray-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4 text-left group"
                        >
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                            {med.nombre.charAt(0)}{med.apellido.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{med.nombre} {med.apellido}</h3>
                            <p className="text-xs text-blue-600 font-semibold">{med.especialidad?.join(', ')}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Paso 2: Horarios */}
              {step === 2 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                      <Clock className="text-blue-500" /> Horarios
                    </h2>
                    <button onClick={() => setStep(1)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-semibold transition">Volver</button>
                  </div>
                  
                  <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-blue-800 mb-2">Fecha de cita:</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={fechaReserva}
                      onChange={handleDateChange}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2.5 font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {horariosDisponibles.length === 0 ? (
                      <p className="col-span-2 text-center py-6 text-gray-400 font-medium bg-gray-50 rounded-xl">No hay cupos disponibles para este día.</p>
                    ) : (
                      horariosDisponibles.map(hora => (
                        <button
                          key={hora}
                          onClick={() => { setSelectedHorario(hora); setStep(3); }}
                          className="bg-white border-2 border-gray-200 p-3 rounded-xl font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-between items-center"
                        >
                          {hora} <ChevronRight size={18} />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Paso 3: Confirmación */}
              {step === 3 && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 mb-1">Confirmar Cita</h2>
                  <p className="text-gray-500 mb-6 font-medium">Estás a un paso de finalizar</p>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl text-left border border-gray-100 mb-6 space-y-3">
                    <p className="flex justify-between border-b pb-2"><span className="text-gray-500">Médico:</span> <strong className="text-gray-800">{selectedMedico.nombre} {selectedMedico.apellido}</strong></p>
                    <p className="flex justify-between border-b pb-2"><span className="text-gray-500">Fecha:</span> <strong className="text-gray-800">{fechaReserva}</strong></p>
                    <p className="flex justify-between"><span className="text-gray-500">Hora:</span> <strong className="text-blue-600 text-lg">{selectedHorario}</strong></p>
                  </div>

                  <div className="mb-6 text-left">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Síntomas Previos (Opcional)</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      rows="2"
                      placeholder="Breve descripción de lo que sientes..."
                      value={sintomas}
                      onChange={e => setSintomas(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <button
                    onClick={handleConfirmarReserva}
                    className="w-full bg-blue-600 text-white text-lg font-bold py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1 transition-all"
                  >
                    Confirmar Cita Ahora
                  </button>
                  <button onClick={() => setStep(2)} className="w-full mt-4 text-gray-400 font-bold hover:text-gray-600 transition">
                    Cambiar horario
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- TAB: CITAS ---- */}
          {activeTab === 'citas' && (
            <div className="space-y-4">
              <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100">
                <button 
                  onClick={() => setCitasTab('activas')}
                  className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${citasTab === 'activas' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Próximas Citas
                </button>
                <button 
                  onClick={() => setCitasTab('historial')}
                  className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${citasTab === 'historial' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Historial
                </button>
              </div>

              {citasTab === 'activas' && (
                <div className="space-y-4">
                  {citasActivas.length === 0 ? (
                    <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border-dashed border-2 border-gray-200">No tienes citas programadas.</p>
                  ) : (
                    citasActivas.map(cita => (
                      <div key={cita._id} className="bg-white p-5 rounded-3xl shadow-sm border border-l-4 border-l-blue-500 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-lg">Dr. {cita.medicoId?.nombre} {cita.medicoId?.apellido}</h3>
                            <p className="text-sm font-semibold text-blue-600">{cita.medicoId?.especialidad?.join(', ')}</p>
                          </div>
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm text-center">
                            {new Date(cita.fecha).toLocaleDateString()}<br/><span className="text-lg">{cita.hora}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleCancelarCita(cita._id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition">
                            <XCircle size={16} /> Cancelar
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-sm transition opacity-50 cursor-not-allowed" title="Función en desarrollo">
                            <RefreshCw size={16} /> Reprogramar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {citasTab === 'historial' && (
                <div className="space-y-4">
                  {citasHistorial.length === 0 ? (
                    <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border-dashed border-2 border-gray-200">No hay historial.</p>
                  ) : (
                    citasHistorial.map(cita => (
                      <div key={cita._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center opacity-80">
                        <div>
                          <h3 className="font-bold text-gray-800">Dr. {cita.medicoId?.nombre} {cita.medicoId?.apellido}</h3>
                          <p className="text-xs text-gray-500">{new Date(cita.fecha).toLocaleDateString()} a las {cita.hora}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cita.estado === 'Atendida' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {cita.estado.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---- TAB: RECETAS ---- */}
          {activeTab === 'recetas' && (
            <div className="space-y-4">
              {misRecetas.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border-dashed border-2 border-gray-200">No tienes recetas médicas.</p>
              ) : (
                misRecetas.map(receta => (
                  <div key={receta._id} onClick={() => setSelectedReceta(receta)} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition">
                        <Pill size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Dr. {receta.medicoId?.nombre} {receta.medicoId?.apellido}</h3>
                        <p className="text-sm text-gray-500">{new Date(receta.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-emerald-500" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalle de Receta */}
      {selectedReceta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full md:max-w-md md:rounded-3xl rounded-t-3xl p-6 shadow-2xl relative animate-slide-up">
            <button onClick={() => setSelectedReceta(null)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-600">
              <X size={20} />
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2"><FileText className="text-emerald-500" /> Receta Médica</h3>
              <p className="text-sm text-gray-500 font-medium">Emitida el {new Date(selectedReceta.createdAt).toLocaleDateString()} por Dr. {selectedReceta.medicoId?.nombre}</p>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-2xl mb-6">
              <p className="text-sm font-bold text-emerald-800 mb-1">Indicaciones Generales:</p>
              <p className="text-sm text-emerald-700 leading-relaxed">{selectedReceta.indicacionesGenerales}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-700 border-b pb-2">Medicamentos:</h4>
              {selectedReceta.medicamentos.map((med, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">{med.medicamentoId?.nombreComercial}</p>
                    <p className="text-xs text-gray-500">{med.medicamentoId?.presentacion} - Dosis: {med.dosis}</p>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-200 font-bold text-sm text-gray-700">
                    x{med.cantidad}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${selectedReceta.estadoPago === 'Pendiente' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {selectedReceta.estadoPago.replace('_', ' ')}
              </span>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${selectedReceta.estadoEntrega === 'Entregado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {selectedReceta.estadoEntrega.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
