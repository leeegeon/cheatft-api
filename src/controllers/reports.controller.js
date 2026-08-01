const ReportsService = require('../services/reports.service');

exports.getReports = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ status: 401, message: '로그인이 필요한 서비스입니다.' });
    }

    const filters = {
      keyword: req.query.keyword,
      date: req.query.date,
      score: req.query.score,
      page: req.query.page,
      limit: req.query.limit
    };

    const data = await ReportsService.getUserReports(userId, filters);

    res.status(200).json({
      status: 200,
      message: '성공',
      data
    });
  } catch (error) {
    console.error('리포트 조회 에러:', error);
    res.status(500).json({ status: 500, message: '서버 오류가 발생했습니다.' });
  }
};
