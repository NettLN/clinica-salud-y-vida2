import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Plus, Trash2, Package } from 'lucide-react';
import api from '../../services/api';

const PharmacyInventory = () => {
  const [inventario, setInventario] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombreComercial: '', principioActivo: '', precioUnitario: 0, stockMinimo: 20, cantidadInicial: 0, fechaVencimiento: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/inventario');
      setInventario(res.data);
    } catch (error) {
      console.error("Error cargando inventario", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const evaluarFila = (item) => {
    const hoy = new Date();
    const vencimiento = new Date(item.fechaVenc);
    const diasParaVencer = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (item.stock === 0 || diasParaVencer < 0) {
      return { 
        bgClass: 'bg-red-50 hover:bg-red-100 text-red-900 border-red-500', 
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        mensaje: item.stock === 0 ? 'Agotado' : 'Vencido'
      };
    } else if (item.stock <= item.minStock || diasParaVencer <= 30) {
      return { 
        bgClass: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border-yellow-500', 
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        mensaje: item.stock <= item.minStock ? 'Bajo Stock' : 'Vence Pronto'
      };
    } else {
      return { 
        bgClass: 'bg-white hover:bg-green-50 text-gray-900 border-transparent hover:border-green-300', 
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        mensaje: 'Óptimo'
      };
    }
  };

  const handleCrearLote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/inventario', formData);
      setShowModal(false);
      fetchData();
      alert('Inventario registrado con éxito');
      setFormData({nombreComercial: '', principioActivo: '', precioUnitario: 0, stockMinimo: 20, cantidadInicial: 0, fechaVencimiento: ''});
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 font-sans p-6 md:p-8 animate-fade-in max-w-6xl mx-auto mt-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            Inventario de Farmacia
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Control de lotes, vencimientos y existencias (FEFO)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Registrar Nuevo Lote</span>
        </button>
      </div>
      
      {loading ? (
        <div className="py-12 text-center text-gray-500 font-medium animate-pulse">Cargando inventario...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Medicamento</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Lote</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Vencimiento</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Stock</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs text-center">Estado</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventario.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500 font-medium">No hay registros en el inventario.</td>
                </tr>
              ) : (
                inventario.map((item) => {
                  const rowStyle = evaluarFila(item);
                  return (
                    <tr key={item._id} className={`transition-all border-l-4 ${rowStyle.bgClass}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.nombre}</div>
                        <div className="text-xs text-gray-500">{item.principioActivo}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{item.lote}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{item.fechaVenc ? new Date(item.fechaVenc).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-lg text-gray-800">{item.stock}</span>
                        <span className="text-xs font-bold text-gray-400 ml-1">/ min {item.minStock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {rowStyle.icon}
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${rowStyle.badgeClass}`}>
                            {rowStyle.mensaje}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDarBaja(item._id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                          title="Eliminar registro"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR INVENTARIO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full animate-slide-up">
            <h2 className="text-2xl font-black mb-6 text-gray-800 border-b border-gray-100 pb-4">Registrar Medicamento / Lote</h2>
            <form onSubmit={handleCrearLote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Nombre Comercial</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-colors outline-none" value={formData.nombreComercial} onChange={e => setFormData({...formData, nombreComercial: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Principio Activo</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-colors outline-none" value={formData.principioActivo} onChange={e => setFormData({...formData, principioActivo: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Precio Unitario ($)</label>
                  <input type="number" step="0.01" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-colors outline-none" value={formData.precioUnitario} onChange={e => setFormData({...formData, precioUnitario: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Alerta Stock Mínimo</label>
                  <input type="number" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-colors outline-none" value={formData.stockMinimo} onChange={e => setFormData({...formData, stockMinimo: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Cantidad (Lote Inicial)</label>
                  <input type="number" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-colors outline-none" value={formData.cantidadInicial} onChange={e => setFormData({...formData, cantidadInicial: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Vencimiento</label>
                  <input type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-colors outline-none" value={formData.fechaVencimiento} onChange={e => setFormData({...formData, fechaVencimiento: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">Registrar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInventory;
