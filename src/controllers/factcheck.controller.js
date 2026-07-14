const FactCheckService = require('../services/factcheck.service');

exports.createCheck = (req, res) => {
  const result = FactCheckService.createCheck();
  res.status(202).json({
    status: 202,
    message: 'Check requested successfully',
    data: result
  });
};

exports.getCheckById = (req, res) => {
  const result = FactCheckService.getCheckById(req.params.id);
  res.status(200).json({
    status: 200,
    message: 'Success',
    data: result
  });
};
