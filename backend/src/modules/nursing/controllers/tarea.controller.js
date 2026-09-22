const TareaEnfermeria = require('../models/TareaEnfermeria');

const crearTarea = async (req, res) => {
  try {
    const { 
      asunto, descripcion, tipo, medicoId, enfermerosAsignados, 
      pacienteId, historialesPermitidos, plazoLimite 
    } = req.body;
    
    const nuevaTarea = new TareaEnfermeria({
      asunto,
      descripcion,
      tipo,
      medicoId,
      enfermerosAsignados: tipo === 'Especifica' ? enfermerosAsignados : [],
      pacienteId,
      historialesPermitidos,
      plazoLimite,
      estado: tipo === 'Especifica' ? 'Pendiente_Asignada' : 'Pendiente_General'
    });

    await nuevaTarea.save();
    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getTareasPorMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;
    const tareas = await TareaEnfermeria.find({ medicoId }).populate('enfermeroEjecutor', 'nombre apellido');
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const auditarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // 'Cumplida'
    
    const tarea = await TareaEnfermeria.findByIdAndUpdate(id, { estado }, { new: true });
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getTareasEnfermeria = async (req, res) => {
  try {
    const { enfermeroId } = req.params;
    
    // Trae tareas Pendiente_General y Pendiente_Asignada (si está asignado), y En_Proceso (si él la tomó)
    const tareas = await TareaEnfermeria.find({
      $or: [
        { estado: 'Pendiente_General' },
        { estado: 'Pendiente_Asignada', enfermerosAsignados: enfermeroId },
        { estado: 'En_Proceso', enfermeroEjecutor: enfermeroId }
      ]
    })
    .populate('medicoId', 'nombre apellido')
    .populate('pacienteId', 'nombre apellido ci');
    
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const tomarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { enfermeroId } = req.body;
    
    const tarea = await TareaEnfermeria.findByIdAndUpdate(id, {
      estado: 'En_Proceso',
      enfermeroEjecutor: enfermeroId,
      fechaHoraInicio: new Date()
    }, { new: true });
    
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const finalizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { evidenciaFormato, notasEvidencia } = req.body;
    
    const tarea = await TareaEnfermeria.findByIdAndUpdate(id, {
      estado: 'En_Revision',
      fechaHoraFin: new Date(),
      evidenciaFormato,
      notasEvidencia
    }, { new: true });
    
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { crearTarea, getTareasPorMedico, auditarTarea, getTareasEnfermeria, tomarTarea, finalizarTarea };
