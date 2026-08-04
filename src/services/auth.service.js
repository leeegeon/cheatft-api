const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

exports.createUser = async (email, password, nickname) => {
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    const error = new Error('이미 사용 중인 이메일입니다.');
    error.status = 409;
    throw error;
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

exports.getUserProfile = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  return user;
};

const PasswordResetModel = require('../models/passwordReset.model');
const mailer = require('../utils/mailer');

exports.sendPasswordResetCode = async (email) => {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const error = new Error('가입되지 않은 이메일 주소입니다.');
    error.status = 404;
    throw error;
  }

  const latest = await PasswordResetModel.findLatestByEmail(email);
  if (latest && (new Date() - new Date(latest.created_at)) < 60000) {
    const error = new Error('60초 이내에 이미 인증번호가 발송되었습니다. 잠시 후 다시 시도해주세요.');
    error.status = 429;
    throw error;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 유효

  await PasswordResetModel.createResetCode(email, code, expiresAt);
  await mailer.sendVerificationEmail(email, code);

  return true;
};

exports.verifyPasswordResetCode = async (email, code) => {
  const latest = await PasswordResetModel.findLatestByEmail(email);

  if (!latest) {
    const error = new Error('유효한 인증번호가 존재하지 않거나 만료되었습니다.');
    error.status = 400;
    throw error;
  }

  if (latest.attempts >= 5) {
    const error = new Error('인증 시도 횟수를 초과했습니다. 인증번호를 다시 요청해주세요.');
    error.status = 400;
    throw error;
  }

  if (latest.code !== String(code).trim()) {
    await PasswordResetModel.incrementAttempts(latest.id);
    const error = new Error('인증번호가 일치하지 않습니다.');
    error.status = 400;
    throw error;
  }

  await PasswordResetModel.markAsVerified(latest.id);

  const resetToken = jwt.sign(
    { email, purpose: 'password_reset' },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '15m' }
  );

  return { resetToken };
};

exports.resetPasswordWithToken = async (resetToken, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback_secret_key');
  } catch (err) {
    const error = new Error('유효하지 않거나 만료된 재설정 토큰입니다.');
    error.status = 401;
    throw error;
  }

  if (decoded.purpose !== 'password_reset' || !decoded.email) {
    const error = new Error('유효하지 않은 요청 토큰입니다.');
    error.status = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 8) {
    const error = new Error('비밀번호는 최소 8자 이상이어야 합니다.');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await UserModel.updatePasswordByEmail(decoded.email, hashedPassword);
  await PasswordResetModel.deleteByEmail(decoded.email);

  return true;
};