const mongoose = require('mongoose');

const TareaEnfermeriaSchema = new mongoose.Schema({
  asunto: { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['Especifica', 'General'],
    required: true
  },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  enfermerosAsignados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  enfermeroEjecutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  historialesPermitidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvolucionMedica' }],
  plazoLimite: { type: Date },
  estado: {
    type: String,
    enum: ['Pendiente_Asignada', 'Pendiente_General', 'En_Progreso', 'En_Revision', 'Cumplida'],
    default: 'Pendiente_General'
  },
  evidencia: {
    mensajeConfirmacion: { type: String },
    urlArchivo: { type: String },
    fechaEnvio: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('TareaEnfermeria', TareaEnfermeriaSchema);
