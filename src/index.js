require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');

// 라우터 불러오기
const authRoutes = require('./routes/auth.routes');
const analysisRoutes = require('./routes/analysis.routes');
// const dummyRoutes = require('./routes/dummy.routes'); // 나중에 더미 라우터 추가 시 사용

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// DB 연결 테스트
db.pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL 데이터베이스 연결 성공!');
    client.release();
  })
  .catch(err => console.error('❌ 데이터베이스 연결 실패:', err.message));

// 라우터 등록
app.use('/api', authRoutes);         // /api/login, /api/signup
app.use('/api/analysis', analysisRoutes); // /api/analysis, /api/analysis/:id

// 기본 상태 확인 라우트
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: "서버가 정상적으로 작동 중입니다." });
});

app.listen(port, () => {
  console.log(`🚀 CheatF/T API Server running at http://localhost:${port}`);
});