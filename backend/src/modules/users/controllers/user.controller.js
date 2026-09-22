<<<<<<< HEAD
const { Usuario } = require('../models/Usuario');
const Rol = require('../models/Rol');
=======
const { Usuario, Medico, Enfermero, Recepcionista, Paciente } = require('../models/Usuario');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
const bcrypt = require('bcrypt');

const getUsers = async (req, res) => {
  try {
    const filter = {};
<<<<<<< HEAD
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
=======
    if (req.query.rol) {
      filter.rol = req.query.rol;
    }
    const users = await Usuario.find(filter).select('-password');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    res.json(users);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

const createUser = async (req, res) => {
<<<<<<< HEAD
  const { nombre, apellido, ci, email, telefono, password, rolId, datosMedico, datosEnfermero, datosPaciente } = req.body;
=======
  const { nombre, apellido, ci, email, telefono, password, rol, ...extraData } = req.body;
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2

  try {
    let user = await Usuario.findOne({ $or: [{ email }, { ci }] });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe (email o CI duplicado)' });
    }

<<<<<<< HEAD
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
=======
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { nombre, apellido, ci, email, telefono, password: hashedPassword };

    // Dependiendo del rol, usamos el discriminador adecuado
    if (rol === 'Medico') {
      user = new Medico({ ...userData, ...extraData });
    } else if (rol === 'Enfermero') {
      user = new Enfermero({ ...userData, ...extraData });
    } else if (rol === 'Recepcionista') {
      user = new Recepcionista(userData);
    } else if (rol === 'Paciente') {
      user = new Paciente({ ...userData, ...extraData });
    } else {
      return res.status(400).json({ message: 'Rol inválido para creación desde el panel' });
    }

    await user.save();
    res.status(201).json({ message: 'Usuario creado exitosamente', user: { _id: user._id, nombre, rol } });
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2

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
<<<<<<< HEAD
=======
    // Si envían password, lo encriptamos
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
<<<<<<< HEAD
    const updatedUser = await Usuario.findByIdAndUpdate(id, updateData, { new: true }).populate('rolId', 'nombre');
=======
    // updateData puede contener arrays como especialidad
    const updatedUser = await Usuario.findByIdAndUpdate(id, updateData, { new: true });
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
    
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
