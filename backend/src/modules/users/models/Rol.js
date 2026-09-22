const mongoose = require('mongoose');

const RolSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  descripcion: { 
    type: String 
  },
  esRolSistema: { 
    type: Boolean, 
    default: false 
  },
  permisos: { 
    type: [String], 
    default: [] 
  }
}, { 
  timestamps: true 
});

const Rol = mongoose.model('Rol', RolSchema);

module.exports = Rol;
