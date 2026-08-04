const express = require('express');
const router = express.Router();
const DummyController = require('../controllers/dummy.controller');

router.get('/summary', DummyController.getSummary);
router.get('/posts', DummyController.getPosts);
router.post('/posts', DummyController.createPost);

module.exports = router;
