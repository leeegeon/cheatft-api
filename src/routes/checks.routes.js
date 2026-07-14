const express = require('express');
const router = express.Router();
const ChecksController = require('../controllers/checks.controller');
const { optionalVerifyToken } = require('../middlewares/auth.middleware');

router.post('/checks', optionalVerifyToken, ChecksController.createCheck);
router.get('/checks/:id', optionalVerifyToken, ChecksController.getCheckById);

module.exports = router;
