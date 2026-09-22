const jwt = require('jsonwebtoken');
const Rol = require('../modules/users/models/Rol');
const { Usuario } = require('../modules/users/models/Usuario');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    
    // Buscar al usuario y popular su rol
    const user = await Usuario.findById(decoded.id).populate('rolId');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = {
      id: user._id,
      rol: user.rolId ? user.rolId.nombre : null,
      permisos: user.rolId ? user.rolId.permisos : []
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no es válido' });
  }
};

const validarPermiso = (permisosRequeridos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permisos) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    const tienePermiso = permisosRequeridos.some(permiso => req.user.permisos.includes(permiso));
    if (!tienePermiso) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes el rol necesario para esta acción' });
    }
    next();
  };
};

module.exports = { authMiddleware, validarPermiso, roleMiddleware };
