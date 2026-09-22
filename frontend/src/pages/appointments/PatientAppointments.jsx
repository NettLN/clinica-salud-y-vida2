import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PatientAppointments = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('reservar');
  const [step, setStep] = useState(1);
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [fechaReserva, setFechaReserva] = useState(new Date().toISOString().split('T')[0]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [sintomas, setSintomas] = useState('');

  const [misCitas, setMisCitas] = useState([]);

  useEffect(() => {
    if (activeTab === 'reservar' && step === 1) fetchMedicos();
    if (activeTab === 'citas') fetchMisCitas();
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

  const citasActivas = misCitas.filter(c => c.estado === 'Pendiente');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
      <div className="flex gap-4 mb-6 border-b pb-4">
        <button 
          onClick={() => { setActiveTab('reservar'); setStep(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${activeTab === 'reservar' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Calendar size={20} /> Agendar Nueva Cita
        </button>
        <button 
          onClick={() => setActiveTab('citas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${activeTab === 'citas' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Clock size={20} /> Mis Citas
        </button>
      </div>

      {activeTab === 'reservar' && (
        <div>
          <div className="flex items-center justify-between mb-8 px-4 max-w-lg mx-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${step >= 1 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${step >= 2 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${step >= 3 ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>3</div>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicos.length === 0 ? (
                <p className="text-gray-500 italic col-span-full">Cargando médicos disponibles...</p>
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
                      <p className="text-xs text-blue-600 font-semibold">{med.datosMedico?.especialidad?.join(', ')}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl mx-auto">
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {horariosDisponibles.length === 0 ? (
                  <p className="col-span-full text-center py-6 text-gray-400 font-medium bg-gray-50 rounded-xl">No hay cupos disponibles.</p>
                ) : (
                  horariosDisponibles.map(hora => (
                    <button
                      key={hora}
                      onClick={() => { setSelectedHorario(hora); setStep(3); }}
                      className="bg-white border-2 border-gray-200 p-3 rounded-xl font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-between items-center"
                    >
                      {hora} <ChevronRight size={16} />
                    </button>
                  ))
                )}
              </div>
              <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-500 hover:text-gray-800 font-bold">← Volver a Médicos</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-6">Confirmar Cita</h2>
              
              <div className="bg-gray-50 p-5 rounded-2xl text-left border border-gray-100 mb-6 space-y-3">
                <p className="flex justify-between border-b pb-2"><span className="text-gray-500">Médico:</span> <strong className="text-gray-800">{selectedMedico.nombre} {selectedMedico.apellido}</strong></p>
                <p className="flex justify-between border-b pb-2"><span className="text-gray-500">Fecha:</span> <strong className="text-gray-800">{fechaReserva}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500">Hora:</span> <strong className="text-blue-600 text-lg">{selectedHorario}</strong></p>
              </div>

              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2">Motivo / Síntomas</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  rows="2"
                  placeholder="Breve descripción..."
                  value={sintomas}
                  onChange={e => setSintomas(e.target.value)}
                ></textarea>
              </div>
              
              <button
                onClick={handleConfirmarReserva}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                Confirmar Reserva
              </button>
              <button onClick={() => setStep(2)} className="w-full mt-4 text-gray-500 hover:text-gray-800 font-bold">← Volver</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'citas' && (
        <div className="space-y-4 max-w-2xl">
          {citasActivas.length === 0 ? (
            <p className="text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">No tienes citas próximas.</p>
          ) : (
            citasActivas.map(cita => (
              <div key={cita._id} className="bg-white p-5 rounded-3xl shadow-sm border border-l-4 border-l-blue-500 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">Dr. {cita.medicoId?.nombre} {cita.medicoId?.apellido}</h3>
                    <p className="text-xs font-semibold text-blue-600">{cita.medicoId?.datosMedico?.especialidad?.join(', ')}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm text-center">
                    {new Date(cita.fecha).toLocaleDateString()}<br/><span>{cita.hora}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCancelarCita(cita._id)} className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-sm transition">
                    <XCircle size={16} /> Cancelar Cita
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
