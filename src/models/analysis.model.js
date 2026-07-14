const db = require('../config/db.config');

const createAnalysis = async (userId, keyword, period, stats) => {
  const query = `
    INSERT INTO analyses (user_id, keyword, period_months, positive_count, neutral_count, negative_count, bias_score)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
  const values = [userId, keyword, period, stats.positive, stats.neutral, stats.negative, stats.score];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const addArticle = async (analysisId, press, title, stance) => {
  const query = `INSERT INTO analysis_articles (analysis_id, press, title, stance) VALUES ($1, $2, $3, $4)`;
  await db.query(query, [analysisId, press, title, stance]);
};

const addInsight = async (analysisId, content) => {
  const query = `INSERT INTO analysis_insights (analysis_id, content) VALUES ($1, $2)`;
  await db.query(query, [analysisId, content]);
};

const getAnalysisById = async (id) => {
  const analysisQuery = 'SELECT * FROM analyses WHERE id = $1';
  const { rows: analysisRows } = await db.query(analysisQuery, [id]);

  if (analysisRows.length === 0) return null;

  const articlesQuery = 'SELECT id as "articleId", press, title, stance FROM analysis_articles WHERE analysis_id = $1';
  const { rows: articles } = await db.query(articlesQuery, [id]);

  const insightsQuery = 'SELECT content FROM analysis_insights WHERE analysis_id = $1 ORDER BY id ASC';
  const { rows: insights } = await db.query(insightsQuery, [id]);

  return { analysis: analysisRows[0], articles, insights };
};

module.exports = {
  createAnalysis,
  addArticle,
  addInsight,
  getAnalysisById
};