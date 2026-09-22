const mongoose = require('mongoose');

<<<<<<< HEAD
=======
// Opciones base para permitir discriminadores polimórficos
const baseOptions = { discriminatorKey: 'rol', collection: 'usuarios', timestamps: true };

>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  ci: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String },
  password: { type: String, required: true }, // Almacenada con bcrypt
<<<<<<< HEAD
  
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
=======
}, baseOptions);

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Discriminadores
const Paciente = Usuario.discriminator('Paciente', new mongoose.Schema({
  fechaNacimiento: { type: Date, required: true },
  direccion: { type: String }
}));

const Medico = Usuario.discriminator('Medico', new mongoose.Schema({
  matriculaProfesional: { type: String, required: true },
  especialidad: { type: [String], default: ['Medicina General'] }
}));

const Enfermero = Usuario.discriminator('Enfermero', new mongoose.Schema({
  matriculaProfesional: { type: String, required: true },
  especialidad: { type: [String], default: ['Enfermería General'] },
  turno: { type: String, enum: ['Mañana', 'Tarde', 'Noche'], required: true },
  disponible: { type: Boolean, default: true }
}));

const Administrador = Usuario.discriminator('Administrador', new mongoose.Schema({}));
const Recepcionista = Usuario.discriminator('Recepcionista', new mongoose.Schema({}));

module.exports = { Usuario, Paciente, Medico, Enfermero, Administrador, Recepcionista };
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
