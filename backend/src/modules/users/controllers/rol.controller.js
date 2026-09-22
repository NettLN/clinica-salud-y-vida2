const Rol = require('../models/Rol');
const { Usuario } = require('../models/Usuario');
const io = require('../../../config/socket');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Rol.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles', error: error.message });
  }
};

exports.createRol = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;

    const rolExistente = await Rol.findOne({ nombre });
    if (rolExistente) {
      return res.status(400).json({ message: 'El rol ya existe' });
    }

    const nuevoRol = new Rol({
      nombre,
      descripcion,
      permisos: permisos || []
    });

    await nuevoRol.save();
    res.status(201).json(nuevoRol);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el rol', error: error.message });
  }
};

exports.updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;

    const rol = await Rol.findById(id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    if (rol.esRolSistema && nombre !== rol.nombre) {
      return res.status(403).json({ message: 'No se puede cambiar el nombre de un rol del sistema' });
    }

    rol.nombre = nombre || rol.nombre;
    rol.descripcion = descripcion || rol.descripcion;
    rol.permisos = permisos || rol.permisos;

    await rol.save();
    
    // Emitir evento para que el frontend actualice permisos en tiempo real
    io.emit('role_updated', { rolNombre: rol.nombre });

    res.json(rol);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
  }
};

exports.deleteRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findById(id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    if (rol.esRolSistema) {
      return res.status(403).json({ message: 'No se puede eliminar un rol del sistema' });
    }

    const usuariosConRol = await Usuario.countDocuments({ rolId: id });
    if (usuariosConRol > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el rol porque tiene usuarios asignados. Reasigna los usuarios primero.',
        usuariosAfectados: usuariosConRol
      });
    }

    await rol.deleteOne();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el rol', error: error.message });
  }
};

exports.reassignAndDelete = async (req, res) => {
  try {
    const { rolIdEliminar, rolIdReasignar } = req.body;

    if (rolIdEliminar === rolIdReasignar) {
      return res.status(400).json({ message: 'Los roles origen y destino deben ser diferentes' });
    }

    const rolEliminar = await Rol.findById(rolIdEliminar);
    const rolReasignar = await Rol.findById(rolIdReasignar);

    if (!rolEliminar || !rolReasignar) {
      return res.status(404).json({ message: 'Uno de los roles no existe' });
    }

    if (rolEliminar.esRolSistema) {
      return res.status(403).json({ message: 'No se puede eliminar un rol del sistema' });
    }

    // Reasignar usuarios
    await Usuario.updateMany({ rolId: rolIdEliminar }, { $set: { rolId: rolIdReasignar } });

    // Eliminar rol
    await rolEliminar.deleteOne();

    res.json({ message: 'Usuarios reasignados y rol eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en la reasignación de rol', error: error.message });
  }
};
