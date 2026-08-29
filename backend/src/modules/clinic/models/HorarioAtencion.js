const mongoose = require('mongoose');

const HorarioAtencionSchema = new mongoose.Schema({
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  diaSemana: { type: Number, required: true, min: 0, max: 6 }, // 0 = Domingo, 1 = Lunes...
  horaInicio: { type: String, required: true }, // Formato "HH:mm"
  horaFin: { type: String, required: true }, // Formato "HH:mm"
  duracionCitaMinutos: { type: Number, default: 30 },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HorarioAtencion', HorarioAtencionSchema);
