const mongoose = require('mongoose');

// Opciones base para permitir discriminadores polimórficos
const baseOptions = { discriminatorKey: 'rol', collection: 'usuarios', timestamps: true };

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  ci: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String },
  password: { type: String, required: true }, // Almacenada con bcrypt
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
