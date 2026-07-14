// src/routes/analysis.routes.js
const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysis.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, AnalysisController.requestAnalysis);
router.get('/:id', verifyToken, AnalysisController.getAnalysisResult);

module.exports = router;