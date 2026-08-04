// src/controllers/posts.controller.js
const PostsService = require('../services/posts.service');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ status: 401, message: '로그인이 필요한 서비스입니다.' });
    }

    if (!title || !content || !category) {
      return res.status(400).json({ status: 400, message: "필수 항목(제목, 본문, 카테고리)이 누락되었습니다." });
    }

    const allowedCategories = ['정보 공유 커뮤니티', '정정 요청', '토론 게시판']; 

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ 
        status: 400, 
        message: `유효하지 않은 게시판입니다. 허용된 게시판: ${allowedCategories.join(', ')}` 
      });
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
    const { category, keyword } = req.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
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

exports.updatePost = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const postId = req.params.id;
    const { title, content, category, tags } = req.body;

    const updatedPost = await PostsService.updatePost(postId, userId, title, content, category, tags);

    if (!updatedPost) {
      return res.status(403).json({ status: 403, message: "수정 권한이 없거나 존재하지 않는 게시글입니다." });
    }

    res.status(200).json({ status: 200, message: "게시글이 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error("게시글 수정 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const postId = req.params.id;

    const deletedPost = await PostsService.deletePost(postId, userId);

    if (!deletedPost) {
      return res.status(403).json({ status: 403, message: "삭제 권한이 없거나 존재하지 않는 게시글입니다." });
    }

    res.status(200).json({ status: 200, message: "게시글이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("게시글 삭제 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};

exports.createComment = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const postId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ status: 400, message: "댓글 내용이 비어있습니다." });
    }

    const newComment = await PostsService.createComment(postId, userId, content);

    res.status(201).json({ status: 201, message: "댓글이 작성되었습니다.", data: newComment });
  } catch (error) {
    console.error("댓글 작성 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const commentId = req.params.commentId;

    const isDeleted = await PostsService.deleteComment(commentId, userId);

    if (!isDeleted) {
      return res.status(403).json({ status: 403, message: "삭제 권한이 없거나 존재하지 않는 댓글입니다." });
    }

    res.status(200).json({ status: 200, message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};

exports.getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const postDetail = await PostsService.getPostDetail(postId);

    if (!postDetail) {
      return res.status(404).json({ status: 404, message: "존재하지 않는 게시글입니다." });
    }

    res.status(200).json({
      status: 200,
      message: "Success",
      data: postDetail
    });
  } catch (error) {
    console.error("게시글 상세 조회 에러:", error);
    res.status(500).json({ status: 500, message: "서버 내부 오류가 발생했습니다." });
  }
};