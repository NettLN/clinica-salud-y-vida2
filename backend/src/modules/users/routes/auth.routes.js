const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { login, refresh } = require('../controllers/auth.controller');
const { authMiddleware } = require('../../../middleware/auth.middleware');
=======
const { login } = require('../controllers/auth.controller');
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2

// @route   POST api/auth/login
// @desc    Autenticar usuario y conseguir token
// @access  Public
router.post('/login', login);

<<<<<<< HEAD
// @route   POST api/auth/refresh
// @desc    Refrescar token para obtener permisos actualizados
// @access  Private
router.post('/refresh', authMiddleware, refresh);

=======
>>>>>>> 222267355ac9746cf00d90f0764db6173cbacbc2
module.exports = router;
