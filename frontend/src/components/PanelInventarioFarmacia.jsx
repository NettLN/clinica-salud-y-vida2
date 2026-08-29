import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Plus, Trash2, Check, X } from 'lucide-react';
import api from '../services/api';

const PanelInventarioFarmacia = () => {
  const [activeTab, setActiveTab] = useState('inventario');
  const [inventario, setInventario] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  
  // Estado para el modal de nuevo lote/medicamento
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombreComercial: '', principioActivo: '', precioUnitario: 0, stockMinimo: 20, cantidadInicial: 0, fechaVencimiento: ''
  });

  const fetchData = async () => {
    try {
      if (activeTab === 'inventario') {
        const res = await api.get('/pharmacy/inventario');
        setInventario(res.data);
      } else {
        const res = await api.get('/pharmacy/solicitudes');
        setSolicitudes(res.data);
      }
    } catch (error) {
      console.error("Error cargando farmacia", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const evaluarFila = (item) => {
    const hoy = new Date();
    const vencimiento = new Date(item.fechaVenc);
    const diasParaVencer = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    // Semaforización Estricta por Fila (Rojo, Amarillo, Verde)
    if (item.stock === 0 || diasParaVencer < 0) {
      return { 
        bgClass: 'bg-red-100 hover:bg-red-200 text-red-900 border-red-500', 
        badgeClass: 'bg-red-200 text-red-800 border-red-300',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        mensaje: item.stock === 0 ? 'Agotado' : 'Vencido'
      };
    } else if (item.stock <= item.minStock || diasParaVencer <= 30) {
      return { 
        bgClass: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-500', 
        badgeClass: 'bg-yellow-200 text-yellow-800 border-yellow-300',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-700" />,
        mensaje: item.stock <= item.minStock ? 'Bajo Stock' : 'Vence Pronto'
      };
    } else {
      return { 
        bgClass: 'bg-green-50 hover:bg-green-100 text-green-900 border-green-500', 
        badgeClass: 'bg-green-200 text-green-800 border-green-300',
        icon: <CheckCircle className="w-5 h-5 text-green-700" />,
        mensaje: 'Óptimo'
      };
    }
  };

  const handleDarBajaLote = (id) => {
    if (window.confirm('¿Estás seguro de dar de baja este lote?')) {
      setInventario(inventario.filter(item => item.id !== id));
    }
  };

  const handleAprobarSolicitud = async (solicitud) => {
    if (window.confirm(`¿Aprobar ${solicitud.cantidad} u. de ${solicitud.medicamento}? Esto generará un lote automáticamente.`)) {
      try {
        await api.put(`/pharmacy/solicitudes/${solicitud.id}`, { accion: 'Aprobar' });
        fetchData(); // Recargar
      } catch (error) {
        alert("Error al aprobar");
      }
    }
  };

  const handleRechazarSolicitud = async (id) => {
    if (window.confirm('¿Rechazar esta solicitud?')) {
      try {
        await api.put(`/pharmacy/solicitudes/${id}`, { accion: 'Rechazar' });
        fetchData();
      } catch (error) {
        alert("Error al rechazar");
      }
    }
  };

  const handleCrearLote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/inventario', formData);
      setShowModal(false);
      fetchData();
      alert('Inventario registrado con éxito');
    } catch (error) {
      alert('Error al registrar inventario');
    }
  };

  const handleDarBaja = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este medicamento y todos sus lotes del sistema?')) {
      try {
        await api.delete(`/pharmacy/inventario/${id}`);
        fetchData();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md font-sans h-full flex flex-col">
      {/* Pestañas de Navegación */}
      <div className="flex border-b">
        <button 
          className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'inventario' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('inventario')}
        >
          Inventario Actual (FEFO)
        </button>
        <button 
          className={`flex-1 py-4 text-center font-bold transition-colors flex items-center justify-center space-x-2 ${activeTab === 'solicitudes' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('solicitudes')}
        >
          <span>Solicitudes Médicas</span>
          {solicitudes.filter(s => s.estado === 'Pendiente').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {solicitudes.filter(s => s.estado === 'Pendiente').length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="p-6 flex-1 overflow-auto">
        
        {/* PESTAÑA 1: INVENTARIO */}
        {activeTab === 'inventario' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Control de Lotes</h3>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                <span>Registrar Lote</span>
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Medicamento</th>
                    <th className="px-6 py-4 font-semibold">Lote</th>
                    <th className="px-6 py-4 font-semibold">Vencimiento</th>
                    <th className="px-6 py-4 font-semibold">Stock</th>
                    <th className="px-6 py-4 font-semibold text-center">Estado</th>
                    <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((item) => {
                    const rowStyle = evaluarFila(item);
                    return (
                      <tr key={item._id} className={`border-b border-l-4 transition-colors ${rowStyle.bgClass}`}>
                        <td className="px-6 py-4 font-bold">{item.nombre}</td>
                        <td className="px-6 py-4 font-medium opacity-80">{item.lote}</td>
                        <td className="px-6 py-4 font-medium opacity-80">{item.fechaVenc ? new Date(item.fechaVenc).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 font-black">
                          {item.stock} <span className="text-xs font-normal opacity-70">/ min {item.minStock}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {rowStyle.icon}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rowStyle.badgeClass}`}>
                              {rowStyle.mensaje}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDarBaja(item._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PESTAÑA 2: SOLICITUDES MÉDICAS */}
        {activeTab === 'solicitudes' && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Bandeja de Pedidos</h3>
            <div className="space-y-4">
              {solicitudes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes.</p>
              ) : (
                solicitudes.map(solicitud => (
                  <div key={solicitud.id} className="bg-gray-50 border border-gray-200 p-5 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-lg text-gray-900">{solicitud.medicamento}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                          {solicitud.cantidad} unidades
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1"><strong>Médico:</strong> {solicitud.medico}</p>
                      <p className="text-sm text-gray-600"><strong>Motivo:</strong> {solicitud.motivo}</p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-sm font-bold ${solicitud.estado === 'Aprobado' ? 'text-green-600' : solicitud.estado === 'Rechazado' ? 'text-red-600' : 'text-yellow-600'}`}>
                        Estado: {solicitud.estado}
                      </span>
                      {solicitud.estado === 'Pendiente' && (
                        <div className="flex space-x-2 mt-2">
                          <button 
                            onClick={() => handleRechazarSolicitud(solicitud.id)}
                            className="flex items-center space-x-1 border border-red-500 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                          >
                            <X size={16} />
                            <span>Rechazar</span>
                          </button>
                          <button 
                            onClick={() => handleAprobarSolicitud(solicitud)}
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md transition-colors"
                          >
                            <Check size={16} />
                            <span>Aprobar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* MODAL CREAR INVENTARIO */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Medicamento / Lote</h2>
              <form onSubmit={handleCrearLote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
                    <input type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" value={formData.nombreComercial} onChange={e => setFormData({...formData, nombreComercial: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Principio Activo</label>
                    <input type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" value={formData.principioActivo} onChange={e => setFormData({...formData, principioActivo: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Unitario ($)</label>
                    <input type="number" step="0.01" required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" value={formData.precioUnitario} onChange={e => setFormData({...formData, precioUnitario: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alerta Stock Mínimo</label>
                    <input type="number" required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" value={formData.stockMinimo} onChange={e => setFormData({...formData, stockMinimo: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad (Lote Inicial)</label>
                    <input type="number" required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" value={formData.cantidadInicial} onChange={e => setFormData({...formData, cantidadInicial: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                    <input type="date" required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" value={formData.fechaVencimiento} onChange={e => setFormData({...formData, fechaVencimiento: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Registrar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelInventarioFarmacia;
