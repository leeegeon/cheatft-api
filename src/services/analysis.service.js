const AnalysisModel = require('../models/analysis.model');

exports.createAnalysis = async (userId, keyword, period) => {
  // 실제 서비스라면 여기서 크롤러나 AI API를 호출하여 기사를 수집하고 분석해야 합니다.
  // 현재는 데이터베이스 연동 및 흐름 테스트를 위해 임의의 로직(가짜 데이터 생성)을 태웁니다.
  const stats = { positive: 10, neutral: 2, negative: 0, score: 80 };
  
  const analysis = await AnalysisModel.createAnalysis(userId, keyword, period, stats);
  const analysisId = analysis.id;

  await AnalysisModel.addArticle(analysisId, '연합뉴스', '전문가 "백신과 사망 간 연관성 매우 낮아"', '긍정');
  await AnalysisModel.addArticle(analysisId, '서울경제', '"백신 부작용 사망 급증" 주장은 사실과 달라', '반박');
  
  await AnalysisModel.addInsight(analysisId, '관련 뉴스 중 긍정/중도 성향의 기사가 다수를 차지합니다.');
  await AnalysisModel.addInsight(analysisId, '반박 기사는 주로 "인과성 부족"을 근거로 반박하고 있습니다.');

  return { id: analysisId };
};

exports.getAnalysisData = async (id) => {
  const data = await AnalysisModel.getAnalysisById(id);
  if (!data) return null;

  const { analysis, articles, insights } = data;

  return {
    analysisId: analysis.id,
    keyword: analysis.keyword,
    biasAnalysis: {
      positiveCount: analysis.positive_count,
      neutralCount: analysis.neutral_count,
      negativeCount: analysis.negative_count,
      biasScore: analysis.bias_score
    },
    insights: insights.map(i => i.content), // 텍스트 배열로 변환
    relatedArticles: articles.filter(a => a.stance !== '반박'),
    counterArticles: articles.filter(a => a.stance === '반박'),
    summaryStats: {
      collectedArticles: articles.length,
      pressCount: new Set(articles.map(a => a.press)).size, // 중복 제거된 언론사 수
      averageReliability: 3.2 // 임시값
    },
    pagination: { currentPage: 1, totalPages: 1, totalItems: articles.length }
  };
};