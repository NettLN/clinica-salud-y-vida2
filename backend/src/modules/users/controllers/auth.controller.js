const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/Usuario');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Usuario.findOne({ email }).populate('rolId');
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const rolNombre = user.rolId ? user.rolId.nombre : null;
    const permisos = user.rolId ? user.rolId.permisos : [];

    // Crear el Payload del JWT
    const payload = {
      _id: user._id, 
      id: user._id,
      rol: rolNombre,
      permisos: permisos,
      nombre: user.nombre,
      apellido: user.apellido
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

const refresh = async (req, res) => {
  try {
    // El usuario ya viene del authMiddleware, usamos su id
    const user = await Usuario.findById(req.user.id).populate('rolId');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const rolNombre = user.rolId ? user.rolId.nombre : null;
    const permisos = user.rolId ? user.rolId.permisos : [];

    const payload = {
      _id: user._id, 
      id: user._id,
      rol: rolNombre,
      permisos: permisos,
      nombre: user.nombre,
      apellido: user.apellido
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error al refrescar token');
  }
};

module.exports = { login, refresh };
