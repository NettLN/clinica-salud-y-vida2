const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser, updateUser } = require('../controllers/user.controller');
<<<<<<< HEAD
const { authMiddleware, validarPermiso } = require('../../../middleware/auth.middleware');
=======
const { authMiddleware, roleMiddleware } = require('../../../middleware/auth.middleware');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2

// Requieren autenticación base
router.use(authMiddleware);

router.get('/', getUsers);
<<<<<<< HEAD
router.post('/', validarPermiso(['USUARIOS_GESTIONAR']), createUser);
router.put('/:id', validarPermiso(['USUARIOS_GESTIONAR']), updateUser);
router.delete('/:id', validarPermiso(['USUARIOS_GESTIONAR']), deleteUser);
=======
router.post('/', roleMiddleware(['Administrador']), createUser);
router.put('/:id', roleMiddleware(['Administrador']), updateUser);
router.delete('/:id', roleMiddleware(['Administrador']), deleteUser);
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2

module.exports = router;
