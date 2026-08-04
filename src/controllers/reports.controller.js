const ReportsService = require('../services/reports.service');

exports.getSummary = async (req, res) => {
  try {
    const data = await ReportsService.getSummary();

    res.status(200).json({
      status: 200,
      message: '성공',
      data
    });
  } catch (error) {
    console.error('요약 조회 에러:', error);
    res.status(500).json({ status: 500, message: '서버 오류가 발생했습니다.' });
  }
};

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

exports.deleteReport = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ status: 401, message: '로그인이 필요한 서비스입니다.' });
    }

    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({ status: 400, message: '유효한 리포트 ID가 필요합니다.' });
    }

    const data = await ReportsService.deleteUserReport(userId, reportId);

    res.status(200).json({
      status: 200,
      message: '성공',
      data
    });
  } catch (error) {
    console.error('리포트 삭제 에러:', error);
    const statusCode = error.status === 404 ? 404 : 500;
    res.status(statusCode).json({ status: statusCode, message: error.message || '서버 오류가 발생했습니다.' });
  }
};
