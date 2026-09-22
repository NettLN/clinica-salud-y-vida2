const express = require('express');
const router = express.Router();
const { 
  getRoles, 
  createRol, 
  updateRol, 
  deleteRol, 
  reassignAndDelete 
} = require('../controllers/rol.controller');
const { authMiddleware, validarPermiso } = require('../../../middleware/auth.middleware');

router.use(authMiddleware);
router.use(validarPermiso(['ROLES_GESTIONAR']));

router.get('/', getRoles);
router.post('/', createRol);
router.put('/:id', updateRol);
router.delete('/:id', deleteRol);
router.post('/reasignar-y-eliminar', reassignAndDelete);

module.exports = router;
