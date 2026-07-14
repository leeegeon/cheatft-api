// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, message: "로그인이 필요한 서비스입니다. (토큰 없음)" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    req.user = decoded;
    
    next(); 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 401, message: "토큰이 만료되었습니다. 다시 로그인해주세요." });
    }
    return res.status(403).json({ status: 403, message: "유효하지 않은 토큰입니다." });
  }
};

exports.optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      req.user = decoded;
    } catch (error) {
      console.log('선택적 인증: 유효하지 않은 토큰이므로 비회원 처리합니다.');
    }
  }
  
  next(); 
};