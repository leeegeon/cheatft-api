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

exports.getPosts = async (category, keyword, limit, offset) => {
  let query = `
    SELECT p.id, p.category, p.title, u.nickname AS author, p.created_at, p.views, p.comment_count
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