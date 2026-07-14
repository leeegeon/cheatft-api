const ChecksService = require('../services/checks.service');

exports.createCheck = async (req, res) => {
  try {
    const { type, content } = req.body || {};

    if (!type || !content) {
      return res.status(400).json({ status: 400, message: 'type과 content를 모두 입력해주세요.' });
    }

    const userId = req.user?.userId ?? null;
    const result = await ChecksService.processCheckRequest(userId, type, content);

    res.status(202).json({
      status: 202,
      message: 'Check requested successfully',
      data: result
    });
  } catch (error) {
    console.error('검증 생성 에러:', error);
    res.status(500).json({ status: 500, message: error.message || '서버 오류가 발생했습니다.' });
  }
};

exports.getCheckById = async (req, res) => {
  try {
    const result = await ChecksService.getCheckData(req.params.id);

    if (!result) {
      return res.status(404).json({ status: 404, message: '해당 검증 결과를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      status: 200,
      message: 'Success',
      data: result
    });
  } catch (error) {
    console.error('검증 조회 에러:', error);
    res.status(500).json({ status: 500, message: error.message || '서버 오류가 발생했습니다.' });
  }
};
