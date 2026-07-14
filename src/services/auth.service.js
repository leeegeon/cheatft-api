const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

exports.createUser = async (email, password, nickname) => {
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new Error('이미 사용 중인 이메일입니다.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.createUser(email, hashedPassword, nickname);
  return newUser;
};

exports.loginUser = async (email, password) => {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new Error('가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.');
  }

  // 3. JWT 토큰 발급 (.env의 JWT_SECRET 사용, 24시간 유효)
  const token = jwt.sign(
    { userId: user.id, email: user.email }, 
    process.env.JWT_SECRET || 'fallback_secret_key', 
    { expiresIn: '24h' }
  );

  return {
    accessToken: token,
    userId: user.id,
    nickname: user.nickname
  };
};