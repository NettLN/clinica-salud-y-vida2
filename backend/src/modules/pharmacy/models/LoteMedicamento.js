const mongoose = require('mongoose');

const LoteMedicamentoSchema = new mongoose.Schema({
  medicamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento', required: true },
  numeroLote: { type: String, required: true },
  cantidadActual: { type: Number, required: true },
  fechaVencimiento: { type: Date, required: true },
  estado: { 
    type: String, 
    enum: ['Activo', 'Vencido', 'Agotado'],
    default: 'Activo'
  }
}, { timestamps: true });

module.exports = mongoose.model('LoteMedicamento', LoteMedicamentoSchema);
