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