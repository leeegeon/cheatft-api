const db = require('../config/db.config');

exports.findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return rows[0]; // 데이터가 없으면 undefined 반환
};

exports.findById = async (id) => {
  const query = `
    SELECT id, email, nickname, level, user_title, created_at
    FROM users
    WHERE id = $1
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

exports.createUser = async (email, password, nickname) => {
  const query = `
    INSERT INTO users (email, password, nickname) 
    VALUES ($1, $2, $3) 
    RETURNING id, email, nickname, level, user_title, created_at
  `;
  const { rows } = await db.query(query, [email, password, nickname]);
  return rows[0]; // 방금 생성된 유저 정보 반환 (비밀번호 제외)
};