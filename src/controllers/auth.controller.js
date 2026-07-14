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
    res.status(500).json({ status: 500, message: error.message || "서버 오류가 발생했습니다." });
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