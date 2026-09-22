import React, { useState, useEffect } from 'react';
import { Check, X, Bell } from 'lucide-react';
import api from '../../services/api';

const PharmacyRequests = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/solicitudes');
      setSolicitudes(res.data);
    } catch (error) {
      console.error("Error cargando solicitudes", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleAprobarSolicitud = async (solicitud) => {
    if (window.confirm(`¿Aprobar ${solicitud.cantidad} u. de ${solicitud.medicamento}? Esto generará un lote automáticamente.`)) {
      try {
        await api.put(`/pharmacy/solicitudes/${solicitud.id}`, { accion: 'Aprobar' });
        fetchSolicitudes();
      } catch (error) {
        alert("Error al aprobar");
      }
    }
  };

  const handleRechazarSolicitud = async (id) => {
    if (window.confirm('¿Rechazar esta solicitud?')) {
      try {
        await api.put(`/pharmacy/solicitudes/${id}`, { accion: 'Rechazar' });
        fetchSolicitudes();
      } catch (error) {
        alert("Error al rechazar");
      }
    }
  };

  const pendientesCount = solicitudes.filter(s => s.estado === 'Pendiente').length;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 font-sans p-6 md:p-8 animate-fade-in max-w-5xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Bell className="text-blue-600" size={32} />
            Bandeja de Pedidos
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Solicitudes de insumos enviadas por consultorios</p>
        </div>
        
        {pendientesCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            {pendientesCount} Pendientes
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 font-medium animate-pulse">Cargando solicitudes...</div>
      ) : (
        <div className="space-y-4">
          {solicitudes.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No hay solicitudes médicas registradas.</p>
            </div>
          ) : (
            solicitudes.map(solicitud => (
              <div key={solicitud.id} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-black text-xl text-gray-900">{solicitud.medicamento}</h4>
                    <span className="bg-blue-50 border border-blue-100 text-blue-800 text-xs px-3 py-1 rounded-lg font-bold">
                      {solicitud.cantidad} unidades solicitadas
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong className="text-gray-800">Médico Solicitante:</strong> Dr. {solicitud.medico}
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block mt-2">
                    <strong className="text-gray-800">Motivo:</strong> {solicitud.motivo}
                  </p>
                </div>
                
                <div className="flex flex-col items-start md:items-end space-y-3">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${
                    solicitud.estado === 'Aprobado' ? 'bg-green-50 text-green-700 border-green-200' : 
                    solicitud.estado === 'Rechazado' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {solicitud.estado}
                  </span>
                  
                  {solicitud.estado === 'Pendiente' && (
                    <div className="flex space-x-3 w-full md:w-auto">
                      <button 
                        onClick={() => handleRechazarSolicitud(solicitud.id)}
                        className="flex-1 md:flex-none flex justify-center items-center space-x-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
                      >
                        <X size={18} strokeWidth={2.5} />
                        <span>Rechazar</span>
                      </button>
                      <button 
                        onClick={() => handleAprobarSolicitud(solicitud)}
                        className="flex-1 md:flex-none flex justify-center items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-md"
                      >
                        <Check size={18} strokeWidth={2.5} />
                        <span>Aprobar Lote</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PharmacyRequests;
