const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// POST /api/signup
router.post('/signup', AuthController.signup);

// POST /api/login
router.post('/login', AuthController.login);

// GET /api/me
router.get('/me', verifyToken, AuthController.getMe);

module.exports = router;