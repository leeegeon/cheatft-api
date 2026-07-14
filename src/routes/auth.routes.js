const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// POST /api/signup
router.post('/signup', AuthController.signup);

// POST /api/login
router.post('/login', AuthController.login);

module.exports = router;