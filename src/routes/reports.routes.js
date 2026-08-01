const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reports.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/reports', verifyToken, ReportsController.getReports);

module.exports = router;
