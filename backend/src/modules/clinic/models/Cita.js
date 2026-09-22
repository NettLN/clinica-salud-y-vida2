const mongoose = require('mongoose');

const CitaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true }, // Formato "HH:mm"
  sintomasPrevios: { type: String },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Atendida', 'Cancelada_Medico', 'Cancelada_Paciente'],
    default: 'Pendiente'
  },
  fechaReprogramacionMax: { type: Date }, // límite de 3 días post-cita original
  historialReprogramaciones: [{
    fechaAnterior: { type: Date },
    horaAnterior: { type: String },
    fechaCambio: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cita', CitaSchema);
