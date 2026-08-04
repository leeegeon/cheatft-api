const db = require('../config/db.config');

const ensureAnalysisArticleUrlColumn = async () => {
  try {
    await db.query('ALTER TABLE analysis_articles ADD COLUMN IF NOT EXISTS url TEXT');
  } catch (error) {
    if (error?.message && /already exists|column/i.test(error.message)) {
      return;
    }
    throw error;
  }
};

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

const addArticle = async (analysisId, press, title, stance, url = null) => {
  await ensureAnalysisArticleUrlColumn();
  const query = `INSERT INTO analysis_articles (analysis_id, press, title, stance, url) VALUES ($1, $2, $3, $4, $5)`;
  await db.query(query, [analysisId, press, title, stance, url]);
};

const addInsight = async (analysisId, content) => {
  const query = `INSERT INTO analysis_insights (analysis_id, content) VALUES ($1, $2)`;
  await db.query(query, [analysisId, content]);
};

const getAnalysisById = async (id) => {
  await ensureAnalysisArticleUrlColumn();

  const analysisQuery = 'SELECT * FROM analyses WHERE id = $1';
  const { rows: analysisRows } = await db.query(analysisQuery, [id]);

  if (analysisRows.length === 0) return null;

  const articlesQuery = 'SELECT id as "articleId", press, title, stance, url FROM analysis_articles WHERE analysis_id = $1';
  const { rows: articles } = await db.query(articlesQuery, [id]);

  const insightsQuery = 'SELECT content FROM analysis_insights WHERE analysis_id = $1 ORDER BY id ASC';
  const { rows: insights } = await db.query(insightsQuery, [id]);

  return { analysis: analysisRows[0], articles, insights };
};

const getSummary = async () => {
  const { rows: analyses } = await db.query(
    `SELECT id, keyword, created_at, positive_count, neutral_count, negative_count, bias_score
     FROM analyses
     ORDER BY created_at DESC
     LIMIT 3`
  );

  const recentChecks = analyses.map((analysis) => ({
    id: analysis.id,
    title: analysis.keyword,
    result: analysis.bias_score >= 60 ? 'FALSE' : analysis.bias_score >= 40 ? 'UNVERIFIED' : 'TRUE',
    timeAgo: '최근 분석'
  }));

  const totalReports = analyses.length;
  const completed = analyses.length;
  const accuracyRate = totalReports > 0
    ? Math.round(analyses.reduce((sum, analysis) => sum + (analysis.bias_score >= 60 ? 100 : 80), 0) / totalReports)
    : 0;

  return {
    todayStats: {
      requests: totalReports,
      completed,
      accuracyRate
    },
    recentChecks
  };
};

const getUserReports = async (userId, filters = {}) => {
  const { keyword = '', date, score, page = 1, limit = 10 } = filters;
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.max(1, Number(limit) || 10);

  let query = `
    SELECT id, keyword, created_at, positive_count, neutral_count, negative_count, bias_score
    FROM analyses
    WHERE user_id = $1
  `;
  const values = [userId];
  let index = 2;

  if (keyword) {
    query += ` AND keyword ILIKE $${index}`;
    values.push(`%${keyword}%`);
    index += 1;
  }

  if (date) {
    query += ` AND created_at >= NOW() - ($${index} * INTERVAL '1 day')`;
    values.push(Number(date));
    index += 1;
  }

  query += ` ORDER BY created_at DESC`;

  const { rows: analyses } = await db.query(query, values);

  const reports = [];

  for (const analysis of analyses) {
    const articlesQuery = 'SELECT id, press, title, stance, url FROM analysis_articles WHERE analysis_id = $1';
    const { rows: articles } = await db.query(articlesQuery, [analysis.id]);

    const insightsQuery = 'SELECT content FROM analysis_insights WHERE analysis_id = $1 ORDER BY id ASC';
    const { rows: insights } = await db.query(insightsQuery, [analysis.id]);

    const relatedCount = articles.filter((article) => article.stance !== '반박').length;
    const counterCount = articles.filter((article) => article.stance === '반박').length;
    const averageReliability = Number((2.5 + (Number(analysis.bias_score || 0) / 100) * 1.2).toFixed(1));

    if (score && averageReliability < Number(score)) {
      continue;
    }

    reports.push({
      id: analysis.id,
      topic: analysis.keyword,
      searchTime: analysis.created_at,
      status: '분석 완료',
      relatedCount,
      counterCount,
      averageReliability,
      mainPresses: Object.values(articles.reduce((acc, article) => {
        const press = article.press || '미상';
        acc[press] = (acc[press] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b - a).slice(0, 3),
      summary: insights[0]?.content || `${analysis.keyword}에 대한 분석이 완료되었습니다.`
    });
  }

  const totalItems = reports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / parsedLimit));
  const currentPage = Math.min(parsedPage, totalPages);
  const startIndex = (currentPage - 1) * parsedLimit;
  const pagedReports = reports.slice(startIndex, startIndex + parsedLimit);

  return {
    totalStats: {
      searchedTopics: totalItems,
      analyzedArticles: reports.reduce((sum, report) => sum + report.relatedCount + report.counterCount, 0),
      averageReliability: totalItems > 0
        ? Number((reports.reduce((sum, report) => sum + report.averageReliability, 0) / totalItems).toFixed(1))
        : 0
    },
    reports: pagedReports,
    pagination: { currentPage, totalPages, totalItems }
  };
};

const deleteUserReport = async (userId, reportId) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT id FROM analyses WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );

    if (rows.length === 0) {
      const error = new Error('삭제할 리포트를 찾을 수 없습니다.');
      error.status = 404;
      throw error;
    }

    await client.query('DELETE FROM analysis_insights WHERE analysis_id = $1', [reportId]);
    await client.query('DELETE FROM analysis_articles WHERE analysis_id = $1', [reportId]);
    await client.query('DELETE FROM analyses WHERE id = $1 AND user_id = $2', [reportId, userId]);

    await client.query('COMMIT');

    return { deletedReportId: reportId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createAnalysis,
  addArticle,
  addInsight,
  getAnalysisById,
  getSummary,
  getUserReports,
  deleteUserReport
};