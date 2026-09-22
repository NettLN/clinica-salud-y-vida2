const mongoose = require('mongoose');

const MedicamentoSchema = new mongoose.Schema({
  nombreComercial: { type: String, required: true },
  principioActivo: { type: String, required: true },
  presentacion: { type: String, required: true },
  stockMinimo: { type: Number, default: 10 },
  precioUnitario: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicamento', MedicamentoSchema);
