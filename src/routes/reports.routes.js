const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reports.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/summary', ReportsController.getSummary);
router.get('/reports', verifyToken, ReportsController.getReports);
router.delete('/reports/:id', verifyToken, ReportsController.deleteReport);

module.exports = router;
