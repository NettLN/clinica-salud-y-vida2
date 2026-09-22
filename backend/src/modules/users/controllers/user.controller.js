const { Usuario } = require('../models/Usuario');
const Rol = require('../models/Rol');
const bcrypt = require('bcrypt');

const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.rolId) {
      filter.rolId = req.query.rolId;
    }
    if (req.query.rol) {
      const rolEncontrado = await Rol.findOne({ nombre: req.query.rol });
      if (rolEncontrado) {
        filter.rolId = rolEncontrado._id;
      } else {
        return res.json([]); // Si el rol no existe, retorna array vacío
      }
    }
    const users = await Usuario.find(filter).populate('rolId', 'nombre').select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

const createUser = async (req, res) => {
  const { nombre, apellido, ci, email, telefono, password, rolId, datosMedico, datosEnfermero, datosPaciente } = req.body;

  try {
    let user = await Usuario.findOne({ $or: [{ email }, { ci }] });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe (email o CI duplicado)' });
    }

    const rol = await Rol.findById(rolId);
    if (!rol) {
       return res.status(400).json({ message: 'El rol referenciado no existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { 
      nombre, 
      apellido, 
      ci, 
      email, 
      telefono, 
      password: hashedPassword,
      rolId,
      datosMedico,
      datosEnfermero,
      datosPaciente
    };

    user = new Usuario(userData);
    await user.save();
    
    res.status(201).json({ message: 'Usuario creado exitosamente', user: { _id: user._id, nombre, rolId } });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};

const deleteUser = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { password, ...updateData } = req.body;
  
  try {
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const updatedUser = await Usuario.findByIdAndUpdate(id, updateData, { new: true }).populate('rolId', 'nombre');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario actualizado', user: updatedUser });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).send('Error al actualizar usuario');
  }
};

module.exports = { getUsers, createUser, deleteUser, updateUser };
