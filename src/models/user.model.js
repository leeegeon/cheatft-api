const db = require('../config/db.config');

exports.findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

exports.createUser = async (email, password, nickname) => {
  const query = `
    INSERT INTO users (email, password, nickname) 
    VALUES ($1, $2, $3) 
    RETURNING id, email, nickname, level, user_title, created_at
  `;
  const { rows } = await db.query(query, [email, password, nickname]);
  return rows[0];
};

exports.findById = async (id) => {
  const query = 'SELECT id, email, nickname, level, user_title, created_at FROM users WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};