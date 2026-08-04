const AuthService = require('../services/auth.service');

exports.signup = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    if (!email || !password || !nickname) {
      return res.status(400).json({ status: 400, message: "이메일, 비밀번호, 닉네임을 모두 입력해주세요." });
    }

    const newUser = await AuthService.createUser(email, password, nickname);
    
    res.status(201).json({
      status: 201,
      message: "회원가입 성공",
      data: newUser
    });
  } catch (error) {
    console.error("회원가입 에러:", error);
    const statusCode = error.status === 409 ? 409 : 500;
    res.status(statusCode).json({ status: statusCode, message: error.message || "서버 오류가 발생했습니다." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 400, message: "이메일과 비밀번호를 입력해주세요." });
    }

    const loginData = await AuthService.loginUser(email, password);

    res.status(200).json({
      status: 200,
      message: "로그인 성공",
      data: loginData
    });
  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(401).json({ status: 401, message: error.message || "로그인에 실패했습니다." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: 401, message: "로그인이 필요한 서비스입니다." });
    }

    const userData = await AuthService.getUserProfile(userId);

    res.status(200).json({
      status: 200,
      message: "사용자 정보 조회 성공",
      data: userData
    });
  } catch (error) {
    console.error("내 정보 조회 에러:", error);
    res.status(404).json({ status: 404, message: error.message || "사용자 정보를 찾을 수 없습니다." });
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.sendPasswordCode = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ status: 400, message: "유효한 이메일 주소를 입력해주세요." });
    }

    await AuthService.sendPasswordResetCode(email.trim());

    res.status(200).json({
      status: 200,
      message: "인증번호가 이메일로 발송되었습니다."
    });
  } catch (error) {
    console.error("인증번호 발송 에러:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ status: statusCode, message: error.message || "서버 오류가 발생했습니다." });
  }
};

exports.verifyPasswordCode = async (req, res) => {
  try {
    const { email, code } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({ status: 400, message: "이메일과 인증번호를 모두 입력해주세요." });
    }

    const result = await AuthService.verifyPasswordResetCode(email.trim(), code);

    res.status(200).json({
      status: 200,
      message: "이메일 인증이 완료되었습니다.",
      data: result
    });
  } catch (error) {
    console.error("인증번호 검증 에러:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ status: statusCode, message: error.message || "서버 오류가 발생했습니다." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body || {};

    if (!resetToken || !newPassword) {
      return res.status(400).json({ status: 400, message: "재설정 토큰과 새로운 비밀번호를 모두 입력해주세요." });
    }

    await AuthService.resetPasswordWithToken(resetToken, newPassword);

    res.status(200).json({
      status: 200,
      message: "비밀번호가 성공적으로 변경되었습니다."
    });
  } catch (error) {
    console.error("비밀번호 재설정 에러:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ status: statusCode, message: error.message || "서버 오류가 발생했습니다." });
  }
};