// src/routes/analysis.routes.js
const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysis.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/keywords', verifyToken, AnalysisController.recommendKeywords);
router.post('/analysis', verifyToken, AnalysisController.requestAnalysis);
router.get('/analysis/:id', verifyToken, AnalysisController.getAnalysisResult);

module.exports = router;