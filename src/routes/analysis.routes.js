// src/routes/analysis.routes.js
const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysis.controller');
const { optionalVerifyToken } = require('../middlewares/auth.middleware');

router.post('/', optionalVerifyToken, AnalysisController.requestAnalysis);
router.get('/:id', optionalVerifyToken, AnalysisController.getAnalysisResult);

module.exports = router;