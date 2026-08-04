const db = require('../config/db.config');

const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      attempts INT DEFAULT 0,
      is_verified BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
};

// 모듈 로드 시 자동 테이블 생성 시도
initTable().catch(err => console.error('password_resets 테이블 생성 실패:', err.message));

exports.findLatestByEmail = async (email) => {
  const query = `
    SELECT * FROM password_resets
    WHERE email = $1 AND expires_at > CURRENT_TIMESTAMP
    ORDER BY id DESC
    LIMIT 1
  `;
  const { rows } = await db.query(query, [email]);
  return rows[0] || null;
};

exports.createResetCode = async (email, code, expiresAt) => {
  const query = `
    INSERT INTO password_resets (email, code, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, email, code, expires_at
  `;
  const { rows } = await db.query(query, [email, code, expiresAt]);
  return rows[0];
};

exports.incrementAttempts = async (id) => {
  const query = `
    UPDATE password_resets
    SET attempts = attempts + 1
    WHERE id = $1
    RETURNING attempts
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0]?.attempts || 0;
};

exports.markAsVerified = async (id) => {
  const query = `
    UPDATE password_resets
    SET is_verified = TRUE
    WHERE id = $1
  `;
  await db.query(query, [id]);
};

exports.deleteByEmail = async (email) => {
  const query = `DELETE FROM password_resets WHERE email = $1`;
  await db.query(query, [email]);
};
