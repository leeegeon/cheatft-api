const AnalysisModel = require('../models/analysis.model');

exports.getUserReports = async (userId, filters = {}) => {
  return AnalysisModel.getUserReports(userId, filters);
};
