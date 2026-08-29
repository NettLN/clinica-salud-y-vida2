const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/Usuario');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Crear el Payload del JWT
    const payload = {
      _id: user._id, // Agregado para compatibilidad frontend
      id: user._id,
      rol: user.rol,
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

module.exports = { login };
