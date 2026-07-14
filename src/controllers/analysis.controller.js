const AnalysisService = require('../services/analysis.service');

exports.requestAnalysis = async (req, res) => {
  try {
    const { keyword, period } = req.body;
    
    const userId = req.user ? req.user.userId : null; 

    if (!keyword || !period) {
      return res.status(400).json({ status: 400, message: "키워드와 분석 기간을 입력해주세요." });
    }

    const analysisResult = await AnalysisService.createAnalysis(userId, keyword, period);

    res.status(202).json({
      status: 202,
      message: "분석이 성공적으로 요청되었습니다.",
      data: { analysisId: analysisResult.id }
    });
  } catch (error) {
    console.error("분석 요청 에러:", error);
    res.status(500).json({ status: 500, message: "서버 오류가 발생했습니다." });
  }
};

const getAnalysisResult = async (req, res) => {
  try {
    const analysisId = req.params.id;

    const data = await AnalysisService.getAnalysisData(analysisId);

    if (!data) {
      return res.status(404).json({ status: 404, message: "해당 분석 결과를 찾을 수 없습니다." });
    }

    res.status(200).json({
      status: 200,
      message: "Success",
      data: data
    });
  } catch (error) {
    console.error("분석 조회 에러:", error);
    res.status(500).json({ status: 500, message: "서버 오류가 발생했습니다." });
  }
};

module.exports = {
  requestAnalysis,
  getAnalysisResult
};