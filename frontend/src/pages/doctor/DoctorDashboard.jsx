import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Clipboard, Search, AlertCircle, Send, PlusCircle, Check, Calendar, Users, List, X, FileText, ChevronRight, Clock, Stethoscope } from 'lucide-react';
import api from '../../services/api';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  
// 2FA ya fue validado en Login.jsx

  // -- TABS NAVEGACIÓN --
  const [activeTab, setActiveTab] = useState('citas'); // 'disponibilidad', 'citas', 'tareas'

  // -- DISPONIBILIDAD STATE --
  const [horarios, setHorarios] = useState([]);
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [selectedDia, setSelectedDia] = useState(1);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('17:00');
  const [activoDia, setActivoDia] = useState(true);

  // -- CITAS Y CONSULTA STATE --
  const [misCitas, setMisCitas] = useState([]);
  const [consultaActiva, setConsultaActiva] = useState(null); // La cita que se está atendiendo
  const [evolucionesPrevias, setEvolucionesPrevias] = useState([]);
  const [nuevaEvolucion, setNuevaEvolucion] = useState({ asunto: '', sintomas: '', descripcion: '' });
  
  // -- RECETARIO INTELIGENTE STATE --
  const [inventario, setInventario] = useState([]);
  const [busquedaMed, setBusquedaMed] = useState('');
  const [medicamentosRecetados, setMedicamentosRecetados] = useState([]);

  // -- TAREAS ENFERMERIA STATE --
  const [misTareas, setMisTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState({ 
    asunto: '', descripcion: '', tipo: 'General', plazoMinutos: 60,
    enfermerosAsignados: [], pacienteId: '', historialesPermitidos: []
  });
  const [listaPacientes, setListaPacientes] = useState([]);
  const [listaEnfermeros, setListaEnfermeros] = useState([]);
  const [historialPacienteTarea, setHistorialPacienteTarea] = useState([]);

  // INICIALIZACIÓN DE DATOS
  useEffect(() => {
    if (activeTab === 'disponibilidad') fetchHorarios();
    if (activeTab === 'citas') fetchCitas();
    if (activeTab === 'tareas') fetchTareas();
  }, [activeTab]);

  useEffect(() => {
    api.get('/pharmacy/inventario').then(res => setInventario(res.data)).catch(console.error);
    api.get('/users?rol=Paciente').then(res => setListaPacientes(res.data)).catch(console.error);
    api.get('/users?rol=Enfermero').then(res => setListaEnfermeros(res.data)).catch(console.error);
  }, []);

  // Fetch Historial when Patient is selected for Task
  useEffect(() => {
    if (nuevaTarea.pacienteId) {
      api.get(`/clinic/evoluciones/paciente/${nuevaTarea.pacienteId}`).then(res => setHistorialPacienteTarea(res.data)).catch(console.error);
    } else {
      setHistorialPacienteTarea([]);
    }
  }, [nuevaTarea.pacienteId]);

  // --- MÉTODOS DISPONIBILIDAD ---
  const fetchHorarios = async () => {
    try {
      const { data } = await api.get(`/clinic/horarios/${user._id || user.id}`);
      setHorarios(data);
    } catch (e) { console.error(e); }
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
    } catch (e) { alert('Error al guardar horario'); }
  };

  const handleEliminarHorario = async (id) => {
    if (!window.confirm('¿Eliminar este horario?')) return;
    try {
      await api.delete(`/clinic/horarios/${id}`);
      fetchHorarios();
    } catch (e) { alert('Error al eliminar horario'); }
  };

  // --- MÉTODOS CITAS Y CONSULTA ---
  const fetchCitas = async () => {
    try {
      const { data } = await api.get(`/clinic/citas/medico/${user._id || user.id}`);
      setMisCitas(data);
    } catch (e) { console.error(e); }
  };

  const abrirConsulta = async (cita) => {
    setConsultaActiva(cita);
    setNuevaEvolucion({ asunto: '', sintomas: cita.sintomasPrevios || '', descripcion: '' });
    setMedicamentosRecetados([]);
    
    // Obtener historial del paciente
    try {
      const { data } = await api.get(`/clinic/evoluciones/paciente/${cita.pacienteId._id}`);
      setEvolucionesPrevias(data);
    } catch (e) { console.error(e); }
  };

  const cerrarConsulta = () => setConsultaActiva(null);

  // --- MÉTODOS RECETARIO ---
  const medicamentosFiltrados = inventario.filter(m => 
    m.nombre?.toLowerCase().includes(busquedaMed.toLowerCase()) || 
    m.principioActivo?.toLowerCase().includes(busquedaMed.toLowerCase())
  );

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

  const handleSolicitudFarmacia = async (med) => {
    try {
      await api.post('/pharmacy/solicitudes', {
        medicoId: user._id,
        medicamentoId: med._id,
        cantidadSugerida: 20,
        motivo: 'Stock agotado en consulta médica'
      });
      alert('Solicitud enviada a Farmacia');
    } catch (error) { alert('Error al solicitar'); }
  };

  // Guardar consulta (Evolución + Receta + Cita a Atendida)
  const concluirCita = async () => {
    if (!nuevaEvolucion.asunto || !nuevaEvolucion.descripcion) {
      return alert('Asunto y Descripción son obligatorios');
    }

    try {
      if (medicamentosRecetados.length > 0) {
        const sinDosis = medicamentosRecetados.some(m => !m.dosis);
        if (sinDosis) return alert('Todos los medicamentos recetados deben tener una dosis indicada.');
      }

      // Crear Evolución PRIMERO
      const resEvo = await api.post('/clinic/evoluciones', {
        pacienteId: consultaActiva.pacienteId._id,
        medicoId: user._id || user.id,
        citaId: consultaActiva._id,
        asunto: nuevaEvolucion.asunto,
        sintomas: nuevaEvolucion.sintomas,
        descripcion: nuevaEvolucion.descripcion
      });

      // Crear Receta (si hay)
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
      cerrarConsulta();
      fetchCitas();

    } catch (e) {
      console.error(e);
      alert('Error al guardar la consulta');
    }
  };

  // --- MÉTODOS TAREAS ---
  const fetchTareas = async () => {
    try {
      const { data } = await api.get(`/nursing/tareas/medico/${user._id || user.id}`);
      setMisTareas(data);
    } catch (e) { console.error(e); }
  };

  const handleCrearTarea = async () => {
    try {
      const plazoLimite = new Date(Date.now() + nuevaTarea.plazoMinutos * 60000);
      await api.post('/nursing/tareas', {
        asunto: nuevaTarea.asunto,
        descripcion: nuevaTarea.descripcion,
        tipo: nuevaTarea.tipo,
        medicoId: user._id || user.id,
        plazoLimite,
        enfermerosAsignados: nuevaTarea.tipo === 'Especifica' ? nuevaTarea.enfermerosAsignados : [],
        pacienteId: nuevaTarea.pacienteId || null,
        historialesPermitidos: nuevaTarea.historialesPermitidos
      });
      alert('Tarea enviada a Enfermería');
      setNuevaTarea({ asunto: '', descripcion: '', tipo: 'General', plazoMinutos: 60, enfermerosAsignados: [], pacienteId: '', historialesPermitidos: [] });
      fetchTareas();
    } catch (e) { alert('Error al crear tarea'); }
  };

  const handleAuditarTarea = async (id, estado) => {
    try {
      await api.put(`/nursing/tareas/${id}/auditar`, { estado });
      fetchTareas();
    } catch (e) { alert('Error al auditar'); }
  };



  // --- RENDER SI HAY CONSULTA ACTIVA (Split View) ---
  if (consultaActiva) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
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

        <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-76px)]">
          {/* LADO IZQUIERDO: Historial del Paciente */}
          <section className="w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-extrabold text-gray-800 border-b pb-2 flex items-center gap-2">
              <FileText className="text-blue-600" /> Historial Clínico Previo
            </h2>
            {evolucionesPrevias.length === 0 ? (
              <p className="text-gray-500 text-center py-10 italic">No hay historial clínico previo para este paciente.</p>
            ) : (
              <div className="space-y-4 pr-2">
                {evolucionesPrevias.map(evo => (
                  <div key={evo._id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">{evo.asunto}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">{new Date(evo.fechaHora).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1"><strong>Médico:</strong> Dr. {evo.medicoId?.nombre} ({evo.medicoId?.especialidad?.join(', ')})</p>
                    {evo.sintomas && <p className="text-xs text-gray-600 mb-1"><strong>Síntomas:</strong> {evo.sintomas}</p>}
                    <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 mt-2"><strong>Descripción:</strong> {evo.descripcion}</p>
                    
                    {evo.recetaId && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 p-2 rounded">
                        <p className="text-xs font-bold text-emerald-800 mb-1">Receta Emitida:</p>
                        <ul className="list-disc list-inside text-xs text-emerald-700">
                          {evo.recetaId.medicamentos?.map((m, i) => (
                            <li key={i}>{m.medicamentoId?.nombreComercial} ({m.dosis}) - x{m.cantidad}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LADO DERECHO: Nueva Consulta y Recetario */}
          <section className="w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto">
            
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
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
              <h2 className="text-lg font-extrabold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <Clipboard className="text-blue-600" /> Recetario Inteligente (Inventario en Vivo)
              </h2>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="text-gray-400" size={18} /></div>
                <input
                  type="text" placeholder="Buscar en Farmacia..."
                  value={busquedaMed} onChange={(e) => setBusquedaMed(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-sm"
                />
                
                {busquedaMed.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {medicamentosFiltrados.map(med => {
                      // Calcular stock total disponible simulado basado en lotes no vencidos (En un caso real la API enviaría el agregado, sumaremos todos los lotes o confiaremos en un campo stock)
                      // Como la API de inventario trae medicamentos sin el stock agregado directamente, mockearemos >0 para simplificar o usaremos un flag
                      const hasStock = true; // Asumimos true por ahora si existe en inventario
                      return (
                      <div key={med._id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50 transition">
                        <div>
                          <div className={`font-bold text-sm ${hasStock ? 'text-gray-800' : 'text-red-600 line-through'}`}>{med.nombreComercial}</div>
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

              <button onClick={concluirCita} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2">
                <Check size={20} /> Concluir Consulta y Guardar
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }


  // --- RENDER DASHBOARD PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex flex-col md:flex-row justify-between items-center border-b gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><Stethoscope size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Panel Médico</h1>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dr. {user?.nombre} {user?.apellido}</p>
          </div>
        </div>
        
        {/* Tabs de Navegación del Dashboard */}
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
          <button onClick={() => setActiveTab('citas')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'citas' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Agenda Citas</button>
          <button onClick={() => setActiveTab('disponibilidad')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'disponibilidad' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Mi Horario</button>
          <button onClick={() => setActiveTab('tareas')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'tareas' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Tareas Enfermería</button>
        </div>

        <button onClick={logout} className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition font-medium">
          <LogOut size={20} />
        </button>
      </nav>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        
        {/* --- TAB: CITAS (Agenda) --- */}
        {activeTab === 'citas' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b-2 border-blue-600 inline-block pr-8 pb-2">Agenda de Citas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Citas Pendientes */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="text-blue-500" /> Próximos Pacientes</h3>
                <div className="space-y-4">
                  {misCitas.filter(c => c.estado === 'Pendiente').length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4">No tienes pacientes en espera.</p>
                  ) : (
                    misCitas.filter(c => c.estado === 'Pendiente').map(cita => (
                      <div key={cita._id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">{cita.pacienteId?.nombre} {cita.pacienteId?.apellido}</p>
                          <p className="text-xs text-gray-500">{new Date(cita.fecha).toLocaleDateString()} a las <strong>{cita.hora}</strong></p>
                        </div>
                        <button 
                          onClick={() => abrirConsulta(cita)}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-200 transition active:scale-95"
                        >
                          Atender
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Citas Atendidas */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 opacity-80">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Check className="text-green-500" /> Citas Atendidas</h3>
                <div className="space-y-3">
                  {misCitas.filter(c => c.estado === 'Atendida').map(cita => (
                    <div key={cita._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                      <p className="font-semibold text-gray-700 text-sm">{cita.pacienteId?.nombre} {cita.pacienteId?.apellido}</p>
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">{cita.hora}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: DISPONIBILIDAD --- */}
        {activeTab === 'disponibilidad' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b-2 border-blue-600 inline-block pr-8 pb-2">Configurar Disponibilidad</h2>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Día de la Semana</label>
                  <select 
                    value={selectedDia} onChange={e => setSelectedDia(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 font-medium"
                  >
                    {diasSemana.map((dia, idx) => <option key={idx} value={idx}>{dia}</option>)}
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={activoDia} onChange={e => setActivoDia(e.target.checked)} className="w-6 h-6 text-blue-600 rounded" />
                    <span className="font-bold text-gray-700">Atiendo este día</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Inicio</label>
                  <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl p-3 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Fin</label>
                  <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl p-3 font-medium" />
                </div>
              </div>
              <button onClick={handleGuardarHorario} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition">Guardar Horario</button>
            </div>

            <h3 className="font-bold text-gray-800 mb-4">Mis Horarios Registrados</h3>
            <div className="grid gap-3">
              {horarios.map(h => (
                <div key={h._id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="font-bold text-gray-700 block">{diasSemana[h.diaSemana]}</span>
                    {h.activo ? (
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full mt-1 inline-block">{h.horaInicio} a {h.horaFin} (Citas 30m)</span>
                    ) : (
                      <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full mt-1 inline-block">Inactivo</span>
                    )}
                  </div>
                  <button onClick={() => handleEliminarHorario(h._id)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition"><X size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: TAREAS --- */}
        {activeTab === 'tareas' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b-2 border-blue-600 inline-block pr-8 pb-2">Delegación a Enfermería</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Send className="text-blue-500" /> Crear Nueva Tarea</h3>
                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Asunto (Ej. Tomar presión, Vía)" value={nuevaTarea.asunto}
                    onChange={e => setNuevaTarea({...nuevaTarea, asunto: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  />
                  <textarea 
                    placeholder="Descripción de la orden..." rows="3" value={nuevaTarea.descripcion}
                    onChange={e => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-medium text-sm resize-none"
                  ></textarea>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Tarea</label>
                      <select
                        value={nuevaTarea.tipo}
                        onChange={e => setNuevaTarea({...nuevaTarea, tipo: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700"
                      >
                        <option value="General">General (Cualquier Enfermero)</option>
                        <option value="Especifica">Específica (Seleccionar)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Tiempo Límite (Minutos)</label>
                      <input 
                        type="number" min="10" value={nuevaTarea.plazoMinutos}
                        onChange={e => setNuevaTarea({...nuevaTarea, plazoMinutos: parseInt(e.target.value)})}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700"
                      />
                    </div>
                  </div>

                  {nuevaTarea.tipo === 'Especifica' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Asignar a (Selecciona uno o más)</label>
                      <select 
                        multiple
                        value={nuevaTarea.enfermerosAsignados}
                        onChange={e => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setNuevaTarea({...nuevaTarea, enfermerosAsignados: values});
                        }}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 h-24"
                      >
                        {listaEnfermeros.map(enf => (
                          <option key={enf._id} value={enf._id}>{enf.nombre} {enf.apellido}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">Presiona Ctrl o Cmd para seleccionar varios.</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Delegar Atención de Paciente (Opcional)</label>
                    <select 
                      value={nuevaTarea.pacienteId}
                      onChange={e => setNuevaTarea({...nuevaTarea, pacienteId: e.target.value, historialesPermitidos: []})}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 mb-4"
                    >
                      <option value="">-- Ninguno --</option>
                      {listaPacientes.map(pac => (
                        <option key={pac._id} value={pac._id}>{pac.nombre} {pac.apellido} (CI: {pac.ci})</option>
                      ))}
                    </select>

                    {nuevaTarea.pacienteId && historialPacienteTarea.length > 0 && (
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                        <label className="block text-xs font-bold text-blue-800 mb-2">Compartir Registros de Historial Clínico</label>
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                          {historialPacienteTarea.map(evo => (
                            <label key={evo._id} className="flex items-center gap-2 text-xs bg-white p-2 rounded shadow-sm border border-blue-50 cursor-pointer hover:bg-blue-50 transition">
                              <input 
                                type="checkbox"
                                checked={nuevaTarea.historialesPermitidos.includes(evo._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNuevaTarea({...nuevaTarea, historialesPermitidos: [...nuevaTarea.historialesPermitidos, evo._id]});
                                  } else {
                                    setNuevaTarea({...nuevaTarea, historialesPermitidos: nuevaTarea.historialesPermitidos.filter(id => id !== evo._id)});
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-gray-700">{evo.asunto} - {new Date(evo.fechaHora).toLocaleDateString()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={handleCrearTarea} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition">
                    Despachar al Pool General
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clipboard className="text-blue-500" /> Auditoría de Tareas</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {misTareas.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No has delegado tareas.</p>
                  ) : (
                    misTareas.map(tarea => (
                      <div key={tarea._id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800 text-sm">{tarea.asunto}</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                            tarea.estado === 'Cumplida' ? 'bg-green-100 text-green-700' : 
                            tarea.estado === 'En_Revision' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {tarea.estado.replace('_', ' ')}
                          </span>
                        </div>
                        {tarea.estado === 'En_Revision' && (
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                            <p className="text-xs font-bold text-yellow-800 mb-2">Requiere tu Auditoría</p>
                            <button onClick={() => handleAuditarTarea(tarea._id, 'Cumplida')} className="w-full bg-green-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-600 transition">
                              Aprobar y Marcar Cumplida
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DoctorDashboard;
