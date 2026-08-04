// src/services/posts.service.js
const PostsModel = require('../models/posts.model');

exports.createPost = async (userId, title, content, category, tags) => {
  const postTags = Array.isArray(tags) ? tags : [];
  const newPost = await PostsModel.createPost(userId, title, content, category, postTags);
  return newPost;
};

exports.getPostsList = async (category, keyword, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [posts, totalItems, stats] = await Promise.all([
    PostsModel.getPosts(category, keyword, limit, offset),
    PostsModel.countPosts(category, keyword),
    PostsModel.getCommunityStats()
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    communityStats: stats,
    posts: posts.map(post => ({
      id: post.id,
      category: post.category,
      title: post.title,
      preview: post.content_preview,
      author: post.author,
      createdAt: post.created_at,
      views: post.views,
      commentCount: post.comment_count
    })),
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalItems
    }
  };
};

exports.updatePost = async (postId, userId, title, content, category, tags) => {
  const postTags = Array.isArray(tags) ? tags : [];
  return await PostsModel.updatePost(postId, userId, title, content, category, postTags);
};

exports.deletePost = async (postId, userId) => {
  return await PostsModel.deletePost(postId, userId);
};

exports.createComment = async (postId, userId, content) => {
  return await PostsModel.createComment(postId, userId, content);
};

exports.deleteComment = async (commentId, postId, userId) => {
  return await PostsModel.deleteComment(commentId, postId, userId);
};

exports.getPostDetail = async (postId) => {
  const post = await PostsModel.getPostById(postId);
  
  if (!post) {
    return null;
  }

  await PostsModel.incrementViewCount(postId);

  const comments = await PostsModel.getCommentsByPostId(postId);

  return {
    ...post,
    views: post.views + 1,
    comments
  };
};