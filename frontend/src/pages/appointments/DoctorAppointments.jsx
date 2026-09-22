import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Check, Clock, Calendar } from 'lucide-react';
import api from '../../services/api';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [misCitas, setMisCitas] = useState([]);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const { data } = await api.get(`/clinic/citas/medico/${user._id || user.id}`);
      setMisCitas(data);
    } catch (e) { console.error(e); }
  };

  const abrirConsulta = (cita) => {
    navigate(`/citas/atender/${cita._id}`, { state: { cita } });
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="text-blue-600" /> Mi Cola de Pacientes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-blue-500" /> Próximos Pacientes en Espera
          </h3>
          <div className="space-y-4">
            {misCitas.filter(c => c.estado === 'Pendiente').length === 0 ? (
              <p className="text-sm text-gray-500 italic py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No tienes pacientes en espera en este momento.
              </p>
            ) : (
              misCitas.filter(c => c.estado === 'Pendiente').map(cita => (
                <div key={cita._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{cita.pacienteId?.nombre} {cita.pacienteId?.apellido}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
                        {new Date(cita.fecha).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {cita.hora}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => abrirConsulta(cita)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition active:scale-95 shadow-sm flex justify-center"
                  >
                    Atender Cita
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 opacity-90">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Check className="text-green-500" /> Citas Concluidas Hoy
          </h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {misCitas.filter(c => c.estado === 'Atendida').length === 0 ? (
               <p className="text-sm text-gray-400 italic py-4">No has atendido citas aún.</p>
            ) : (
              misCitas.filter(c => c.estado === 'Atendida').map(cita => (
                <div key={cita._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <p className="font-semibold text-gray-700">{cita.pacienteId?.nombre} {cita.pacienteId?.apellido}</p>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">{cita.hora}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
