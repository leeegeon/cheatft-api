// src/routes/posts.routes.js
const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/posts.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.get('/', PostsController.getPosts);

router.post('/', authenticateToken, PostsController.createPost);

module.exports = router;