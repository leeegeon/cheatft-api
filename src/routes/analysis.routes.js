// src/routes/analysis.routes.js
const express = require('express');
const router = express.Router();
const { requestAnalysis, getAnalysisResult } = require('../controllers/analysis.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, requestAnalysis);
router.get('/:id', verifyToken, getAnalysisResult);

module.exports = router;