// src/routes/posts.routes.js
const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/posts.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', PostsController.getPosts);
router.get('/:id', PostsController.getPost);

router.post('/', verifyToken, PostsController.createPost);
router.put('/:id', verifyToken, PostsController.updatePost);
router.delete('/:id', verifyToken, PostsController.deletePost);

router.post('/:id/comments', verifyToken, PostsController.createComment);
router.delete('/:id/comments/:commentId', verifyToken, PostsController.deleteComment);

module.exports = router;