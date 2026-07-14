// src/models/checks.model.js
const db = require('../config/db.config');

exports.createCheck = async (userId, type, content) => {
  const query = `
    INSERT INTO checks (user_id, check_type, content) 
    VALUES ($1, $2, $3) RETURNING id
  `;
  const { rows } = await db.query(query, [userId, type, content]);
  return rows[0].id;
};

// 매개변수에 description 추가 및 쿼리 업데이트
exports.saveArticle = async (checkId, press, title, description, url, pubDate) => {
  const query = `
    INSERT INTO check_articles (check_id, press, title, description, url, pub_date)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await db.query(query, [checkId, press, title, description, url, pubDate]);
};

exports.getCheckById = async (id) => {
  const checkQuery = 'SELECT * FROM checks WHERE id = $1';
  const { rows: checkRows } = await db.query(checkQuery, [id]);
  
  if (checkRows.length === 0) return null;

  const articlesQuery = 'SELECT * FROM check_articles WHERE check_id = $1 ORDER BY id ASC';
  const { rows: articles } = await db.query(articlesQuery, [id]);

  return { check: checkRows[0], articles };
};