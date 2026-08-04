const AnalysisModel = require('../models/analysis.model');

exports.getSummary = async () => {
  return AnalysisModel.getSummary();
};

exports.getUserReports = async (userId, filters = {}) => {
  return AnalysisModel.getUserReports(userId, filters);
};

exports.deleteUserReport = async (userId, reportId) => {
  return AnalysisModel.deleteUserReport(userId, reportId);
};
