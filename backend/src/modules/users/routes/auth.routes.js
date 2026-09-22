const express = require('express');
const router = express.Router();
const { login, refresh } = require('../controllers/auth.controller');
const { authMiddleware } = require('../../../middleware/auth.middleware');

// @route   POST api/auth/login
// @desc    Autenticar usuario y conseguir token
// @access  Public
router.post('/login', login);

// @route   POST api/auth/refresh
// @desc    Refrescar token para obtener permisos actualizados
// @access  Private
router.post('/refresh', authMiddleware, refresh);

module.exports = router;
