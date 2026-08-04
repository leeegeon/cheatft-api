// src/controllers/posts.controller.js
const PostsService = require('../services/posts.service');

exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ status: 400, message: "필수 항목(제목, 본문, 카테고리)이 누락되었습니다." });
    }

    const newPost = await PostsService.createPost(userId, title, content, category, tags);

    res.status(201).json({
      status: 201,
      message: "Post created successfully",
      data: {
        id: newPost.id,
        title: newPost.title,
        category: newPost.category
      }
    });
  } catch (error) {
    console.error("게시글 작성 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category, keyword, page, limit } = req.query;
    
    const data = await PostsService.getPostsList(category, keyword, page, limit);

    res.status(200).json({
      status: 200,
      message: "Success",
      data
    });
  } catch (error) {
    console.error("게시글 조회 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};