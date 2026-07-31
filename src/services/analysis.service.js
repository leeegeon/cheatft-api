const AnalysisModel = require('../models/analysis.model');

const DEFAULT_KEYWORDS = [
  '백신 부작용',
  '사망 인과성',
  '질병관리청 발표',
  '코로나 백신 안전성',
  '이상 반응'
];

const parseKeywordResponse = (content) => {
  if (!content) return [];

  const trimmed = content.trim();
  const match = trimmed.match(/\[(.*?)\]/s);

  if (match) {
    return match[1]
      .split(',')
      .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return trimmed
    .split(/\n|,/) 
    .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
};

exports.getKeywordRecommendations = async (content = '') => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('추천된 키워드가 없습니다.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that recommends up to 5 relevant Korean keywords for fact-checking or bias analysis.'
          },
          {
            role: 'user',
            content: `다음 문장이나 단어를 바탕으로 사실검증/편향성 분석에 적합한 한국어 키워드를 최대 5개까지 JSON 배열 형식으로만 반환해줘: ${content || '백신 부작용'}`
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content || '';
    const parsed = parseKeywordResponse(output);

    if (parsed.length > 0) {
      return parsed.slice(0, 5);
    }
  } catch (error) {
    console.error('OpenAI 키워드 추천 실패:', error.message);
    throw new Error('추천된 키워드가 없습니다.');
  }

  throw new Error('추천된 키워드가 없습니다.');
};

exports.createAnalysis = async (userId, keyword, period) => {
  const stats = { positive: 10, neutral: 2, negative: 0, score: 80 };

  const analysis = await AnalysisModel.createAnalysis(userId, keyword, period, stats);
  const analysisId = analysis?.id ?? analysis?.rows?.[0]?.id;

  if (!analysisId) {
    throw new Error('분석 생성 결과를 확인할 수 없습니다.');
  }

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