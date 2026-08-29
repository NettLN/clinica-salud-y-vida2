const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser, updateUser } = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../../../middleware/auth.middleware');

// Requieren autenticación base
router.use(authMiddleware);

router.get('/', getUsers);
router.post('/', roleMiddleware(['Administrador']), createUser);
router.put('/:id', roleMiddleware(['Administrador']), updateUser);
router.delete('/:id', roleMiddleware(['Administrador']), deleteUser);

module.exports = router;
