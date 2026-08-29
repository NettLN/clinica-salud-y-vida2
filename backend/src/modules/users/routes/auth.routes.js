const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');

// @route   POST api/auth/login
// @desc    Autenticar usuario y conseguir token
// @access  Public
router.post('/login', login);

module.exports = router;
