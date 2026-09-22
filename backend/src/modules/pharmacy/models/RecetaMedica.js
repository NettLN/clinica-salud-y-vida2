const mongoose = require('mongoose');

const RecetaMedicaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  evolucionMedicaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EvolucionMedica', required: true },
  indicacionesGenerales: { type: String, required: true },
  medicamentos: [{
    medicamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento', required: true },
    dosis: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true }
  }],
  estadoPago: { 
    type: String, 
    enum: ['Pendiente', 'Pagado_Online', 'Pagado_Presencial'],
    default: 'Pendiente'
  },
  estadoEntrega: {
    type: String,
    enum: ['No_Entregado', 'Entregado'],
    default: 'No_Entregado'
  }
}, { timestamps: true });

module.exports = mongoose.model('RecetaMedica', RecetaMedicaSchema);
