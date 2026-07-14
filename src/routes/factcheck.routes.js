const express = require('express');
const router = express.Router();
const FactCheckController = require('../controllers/factcheck.controller');
const { optionalVerifyToken } = require('../middlewares/auth.middleware');

router.post('/checks', optionalVerifyToken, FactCheckController.createCheck);
router.get('/checks/:id', optionalVerifyToken, FactCheckController.getCheckById);

module.exports = router;
