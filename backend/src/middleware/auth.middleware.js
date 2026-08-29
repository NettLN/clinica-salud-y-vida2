const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  try {
    // El token normalmente viene como "Bearer <token>"
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded; // Adjuntamos los datos del usuario al request (id, rol)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no es válido' });
  }
};

const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
