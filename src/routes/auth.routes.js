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

// 비밀번호 재설정 관련 라우트
router.post('/password/code', AuthController.sendPasswordCode);
router.post('/password/verify', AuthController.verifyPasswordCode);
router.post('/password/reset', AuthController.resetPassword);

module.exports = router;