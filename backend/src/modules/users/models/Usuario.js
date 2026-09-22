const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  ci: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String },
  password: { type: String, required: true }, // Almacenada con bcrypt
  
  // Referencia al Rol en lugar de un string estático o discriminador
  rolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Rol', 
    required: true 
  },

  // Sub-documentos opcionales para reemplazar los discriminadores
  datosMedico: {
    matriculaProfesional: { type: String },
    especialidad: { type: [String], default: [] }
  },
  
  datosEnfermero: {
    matriculaProfesional: { type: String },
    especialidad: { type: [String], default: [] },
    turno: { type: String, enum: ['Mañana', 'Tarde', 'Noche'] },
    disponible: { type: Boolean, default: true }
  },
  
  datosPaciente: {
    fechaNacimiento: { type: Date },
    direccion: { type: String }
  }
}, { 
  collection: 'usuarios', 
  timestamps: true 
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = { Usuario };
