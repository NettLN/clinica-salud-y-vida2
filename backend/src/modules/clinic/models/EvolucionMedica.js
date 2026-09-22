const mongoose = require('mongoose');

const EvolucionMedicaSchema = new mongoose.Schema({
  historialClinicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'HistorialClinico', required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  citaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita' },
  fechaHora: { type: Date, default: Date.now },
  asunto: { type: String, required: true },
  sintomas: { type: String },
  descripcion: { type: String, required: true },
  recetaId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecetaMedica' }
}, { timestamps: true });

module.exports = mongoose.model('EvolucionMedica', EvolucionMedicaSchema);
