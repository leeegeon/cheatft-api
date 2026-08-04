// src/models/posts.model.js
const db = require('../config/db.config');

exports.createPost = async (userId, title, content, category, tags) => {
  const query = `
    INSERT INTO posts (user_id, title, content, category, tags)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, category, created_at
  `;
  const { rows } = await db.query(query, [userId, title, content, category, tags]);
  return rows[0];
};

exports.countPosts = async (category, keyword) => {
  let query = `SELECT COUNT(*) FROM posts WHERE 1=1`;
  const values = [];
  let valueIndex = 1;

  if (category) {
    query += ` AND category = $${valueIndex}`;
    values.push(category);
    valueIndex++;
  }

  if (keyword) {
    query += ` AND (title ILIKE $${valueIndex} OR content ILIKE $${valueIndex})`;
    values.push(`%${keyword}%`);
    valueIndex++;
  }

  const { rows } = await db.query(query, values);
  return parseInt(rows[0].count, 10);
};

exports.getCommunityStats = async () => {
  const todayQuery = `SELECT COUNT(*) FROM posts WHERE created_at >= CURRENT_DATE`;
  const usersQuery = `SELECT COUNT(*) FROM users`;
  
  const { rows: todayPosts } = await db.query(todayQuery);
  const { rows: totalUsers } = await db.query(usersQuery);

  return {
    todayPosts: parseInt(todayPosts[0].count, 10),
    todayComments: 0,
    totalMembers: parseInt(totalUsers[0].count, 10)
  };
};

exports.getPosts = async (category, keyword, limit, offset) => {
  let query = `
    SELECT p.id, p.category, p.title, 
           LEFT(p.content, 100) AS content_preview, -- 본문 앞 100자 미리보기
           u.nickname AS author, p.created_at, p.views, p.comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const values = [];
  let valueIndex = 1;

  if (category) {
    query += ` AND p.category = $${valueIndex}`;
    values.push(category);
    valueIndex++;
  }

  if (keyword) {
    query += ` AND (p.title ILIKE $${valueIndex} OR p.content ILIKE $${valueIndex})`;
    values.push(`%${keyword}%`);
    valueIndex++;
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
  values.push(limit, offset);

  const { rows } = await db.query(query, values);
  return rows;
};

exports.updatePost = async (postId, userId, title, content, category, tags) => {
  const query = `
    UPDATE posts
    SET title = $1, content = $2, category = $3, tags = $4
    WHERE id = $5 AND user_id = $6
    RETURNING id
  `;
  const { rows } = await db.query(query, [title, content, category, tags, postId, userId]);
  return rows[0];
};

exports.deletePost = async (postId, userId) => {
  const query = `DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id`;
  const { rows } = await db.query(query, [postId, userId]);
  return rows[0];
};

exports.createComment = async (postId, userId, content) => {
  const commentQuery = `
    INSERT INTO comments (post_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, content, created_at
  `;
  const { rows } = await db.query(commentQuery, [postId, userId, content]);
  
  await db.query(`UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`, [postId]);
  return rows[0];
};

exports.deleteComment = async (commentId, userId) => {
  const deleteQuery = `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING post_id`;
  const { rows } = await db.query(deleteQuery, [commentId, userId]);

  if (rows.length > 0) {
    await db.query(`UPDATE posts SET comment_count = comment_count - 1 WHERE id = $1`, [rows[0].post_id]);
    return true; // 성공
  }
  return false; // 권한 없음 또는 존재하지 않는 댓글
};

exports.incrementViewCount = async (postId) => {
  await db.query(`UPDATE posts SET views = views + 1 WHERE id = $1`, [postId]);
};

exports.getPostById = async (postId) => {
  const query = `
    SELECT p.id, p.category, p.title, p.content, p.tags, p.views, p.comment_count, p.created_at, u.nickname AS author
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
  `;
  const { rows } = await db.query(query, [postId]);
  return rows[0];
};

exports.getCommentsByPostId = async (postId) => {
  const query = `
    SELECT c.id, c.content, c.created_at, u.nickname AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `;
  const { rows } = await db.query(query, [postId]);
  return rows;
};