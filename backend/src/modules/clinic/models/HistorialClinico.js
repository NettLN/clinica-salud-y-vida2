const mongoose = require('mongoose');

const HistorialClinicoSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  grupoSanguineo: { type: String },
  alergias: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('HistorialClinico', HistorialClinicoSchema);
