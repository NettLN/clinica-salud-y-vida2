const mongoose = require('mongoose');

const SolicititudMedicamentoSchema = new mongoose.Schema({
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  medicamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento', required: true },
  cantidadSugerida: { type: Number, required: true },
  motivo: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Aprobada', 'Rechazada'],
    default: 'Pendiente'
  }
}, { timestamps: true });

module.exports = mongoose.model('SolicitudMedicamento', SolicititudMedicamentoSchema);
