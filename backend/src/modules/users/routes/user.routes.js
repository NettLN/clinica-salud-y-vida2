const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser, updateUser } = require('../controllers/user.controller');
const { authMiddleware, validarPermiso } = require('../../../middleware/auth.middleware');

// Requieren autenticación base
router.use(authMiddleware);

router.get('/', getUsers);
router.post('/', validarPermiso(['USUARIOS_GESTIONAR']), createUser);
router.put('/:id', validarPermiso(['USUARIOS_GESTIONAR']), updateUser);
router.delete('/:id', validarPermiso(['USUARIOS_GESTIONAR']), deleteUser);

module.exports = router;
