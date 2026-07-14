const express = require('express');
const router = express.Router();
const DummyController = require('../controllers/dummy.controller');

router.get('/summary', DummyController.getSummary);
router.post('/checks', DummyController.createCheck);
router.get('/checks/:id', DummyController.getCheckById);
router.get('/reports', DummyController.getReports);
router.get('/posts', DummyController.getPosts);
router.post('/posts', DummyController.createPost);
router.get('/profile', DummyController.getProfile);

module.exports = router;
