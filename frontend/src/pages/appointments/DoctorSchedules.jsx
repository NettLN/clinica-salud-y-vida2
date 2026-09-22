import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Clock, Calendar } from 'lucide-react';
import api from '../../services/api';

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const DoctorSchedules = () => {
  const { user } = useAuth();
  
  const [horarios, setHorarios] = useState([]);
  const [selectedDia, setSelectedDia] = useState(1);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('17:00');
  const [activoDia, setActivoDia] = useState(true);

  useEffect(() => {
    fetchHorarios();
  }, []);

  const fetchHorarios = async () => {
    try {
      const { data } = await api.get(`/clinic/horarios/${user._id || user.id}`);
      setHorarios(data);
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleGuardarHorario = async () => {
    try {
      await api.post('/clinic/horarios', {
        medicoId: user._id || user.id,
        diaSemana: selectedDia,
        horaInicio,
        horaFin,
        activo: activoDia
      });
      alert('Horario guardado');
      fetchHorarios();
    } catch (e) { 
      alert('Error al guardar horario'); 
    }
  };

  const handleEliminarHorario = async (id) => {
    if (!window.confirm('¿Eliminar este horario?')) return;
    try {
      await api.delete(`/clinic/horarios/${id}`);
      fetchHorarios();
    } catch (e) { 
      alert('Error al eliminar horario'); 
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in max-w-4xl mx-auto mt-6">
      <div className="mb-8 border-b-2 border-blue-600 inline-block pr-8 pb-2">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <Calendar className="text-blue-600" size={32} />
          Configurar Disponibilidad
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">Define los días y horarios en los que atenderás citas</p>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Día de la Semana</label>
            <select 
              value={selectedDia} onChange={e => setSelectedDia(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {diasSemana.map((dia, idx) => <option key={idx} value={idx}>{dia}</option>)}
            </select>
          </div>
          <div className="flex items-center mt-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer w-full">
              <input type="checkbox" checked={activoDia} onChange={e => setActivoDia(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="font-bold text-gray-700 text-sm">Atiendo este día</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Inicio</label>
            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Fin</label>
            <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <button onClick={handleGuardarHorario} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
          <Clock size={20} /> Guardar Horario
        </button>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-5">Mis Horarios Registrados</h3>
      {horarios.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No has registrado ningún horario de disponibilidad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {horarios.map(h => (
            <div key={h._id} className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm hover:border-blue-300 transition-colors group">
              <div>
                <span className="font-black text-gray-800 block text-lg mb-1">{diasSemana[h.diaSemana]}</span>
                {h.activo ? (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg mt-1 inline-block shadow-sm">
                    {h.horaInicio} a {h.horaFin} (Citas 30m)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg mt-1 inline-block shadow-sm">
                    Inactivo
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleEliminarHorario(h._id)} 
                className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-70 group-hover:opacity-100"
                title="Eliminar Horario"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSchedules;
