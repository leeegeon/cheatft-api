const AnalysisModel = require('../models/analysis.model');
const ChecksService = require('./checks.service');

const DEFAULT_KEYWORDS = [
  '백신 부작용',
  '사망 인과성',
  '질병관리청 발표',
  '코로나 백신 안전성',
  '이상 반응'
];

const createFallbackPlan = (keyword) => ({
  articles: [
    { title: `${keyword} 관련 핵심 기사`, press: 'AI', stance: '중립', reason: '기본 정렬' },
    { title: `${keyword} 관련 반박 기사`, press: 'AI', stance: '반박', reason: '반박 관점 정리' },
    { title: `${keyword} 관련 긍정 기사`, press: 'AI', stance: '긍정', reason: '긍정 관점 정리' }
  ],
  insights: [
    `${keyword} 관련 기사들을 종합적으로 살펴보면 핵심 논점이 분명하게 드러납니다.`,
    '반박 및 중립 관점의 기사도 함께 확인하는 것이 좋습니다.'
  ]
});

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
            content: `다음 문장이나 단어와 관련된 사실검증/편향성 분석에 적합한 한국어 키워드를 최대 5개까지 JSON 배열 형식으로만 반환해줘: ${content}. 추천할 때에는 중복되지 않도록 하고, 너무 일반적인 단어는 피하고, 구체적이고 분석에 적합한 키워드를 선택해줘.`
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

const buildArticlePrompt = (keyword, articles) => {
  const articleContext = articles
    .map((article, index) => `기사 ${index + 1}: 언론사=${article.press || '미상'}; 제목=${article.title || ''}; 내용=${article.description || ''}`)
    .join('\n');

  return `당신은 사실검증/편향성 분석 전문가입니다. 사용자가 선택한 키워드와 기사 목록을 바탕으로 가장 관련성 높은 기사 순서를 정렬하고, 핵심 인사이트를 생성해야 합니다. 인사이트에는 해당 키워드와 관련된 중요한 정보 및 해당 키워드가 사실인지 거짓인지에 대한 판단이 포함되어야 합니다. 관련이 없거나 중요하지 않은 기사는 제외하되, 긍정 / 중립 / 반박 기사가 골고루 포함되도록 기사를 최대 10개 내외로 선정하세요.\n키워드: ${keyword}\n기사 목록:\n${articleContext}\n\n다음 JSON 형식으로만 응답하세요: {"rankedArticles":[{"title":"...","press":"...","stance":"긍정|중립|반박","reason":"..."}],"insights":["...","..."]}`;
};

exports.buildAnalysisPlan = async (keyword, articles) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않아 분석 계획을 생성할 수 없습니다.');
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
            content: 'You are a careful analyst that ranks relevant news articles and writes concise insights.'
          },
          {
            role: 'user',
            content: buildArticlePrompt(keyword, articles)
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

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (parseError) {
      throw new Error('OpenAI 응답 형식이 올바르지 않습니다.');
    }

    const rankedArticles = Array.isArray(parsed.rankedArticles) ? parsed.rankedArticles : [];
    const insights = Array.isArray(parsed.insights) ? parsed.insights : [];

    if (rankedArticles.length === 0 || insights.length === 0) {
      throw new Error('OpenAI 응답에 분석 데이터가 포함되지 않았습니다.');
    }

    return {
      articles: rankedArticles.slice(0, 10).map((article) => ({
        title: article.title,
        press: article.press,
        stance: article.stance || '중립',
        reason: article.reason || ''
      })),
      insights: insights.slice(0, 5)
    };
  } catch (error) {
    console.error('OpenAI 분석 플랜 생성 실패:', error.message);
    throw error;
  }
};

exports.createAnalysis = async (userId, keyword, period) => {
  const articles = await ChecksService.processCheckRequest(userId, 'text', keyword);
  const articleData = await ChecksService.getCheckData(articles.checkId);
  const extractedArticles = (articleData?.articles || []).slice(0, 20).map((article) => ({
    title: article.title,
    description: article.description,
    press: article.press
  }));

  const plan = await exports.buildAnalysisPlan(keyword, extractedArticles);

  const stanceCounts = plan.articles.reduce((counts, article) => {
    if (article.stance === '반박') {
      counts.negative += 1;
    } else if (article.stance === '긍정') {
      counts.positive += 1;
    } else {
      counts.neutral += 1;
    }
    return counts;
  }, { positive: 0, neutral: 0, negative: 0 });

  const totalArticles = plan.articles.length || 1;
  const biasScore = Math.max(0, Math.min(100, Math.round(((stanceCounts.positive * 1 + stanceCounts.neutral * 0.5 - stanceCounts.negative * 0.5) / totalArticles) * 100)));

  const stats = {
    positive: stanceCounts.positive,
    neutral: stanceCounts.neutral,
    negative: stanceCounts.negative,
    score: biasScore
  };

  const analysis = await AnalysisModel.createAnalysis(userId, keyword, period, stats);
  const analysisId = analysis?.id ?? analysis?.rows?.[0]?.id;

  if (!analysisId) {
    throw new Error('분석 생성 결과를 확인할 수 없습니다.');
  }

  for (const article of plan.articles) {
    await AnalysisModel.addArticle(analysisId, article.press || 'AI', article.title, article.stance, article.url || null);
  }

  for (const insight of plan.insights) {
    await AnalysisModel.addInsight(analysisId, insight);
  }

  return { analysisId };
};

exports.getAnalysisData = async (id, limit = 4) => {
  const data = await AnalysisModel.getAnalysisById(id);
  if (!data) return null;

  const parsedLimit = Number.isFinite(Number(limit)) ? Math.max(1, parseInt(limit, 10)) : 4;
  const { analysis, articles, insights } = data;
  const relatedArticles = articles
    .filter((article) => article.stance !== '반박')
    .slice(0, parsedLimit)
    .map((article) => ({
      articleId: article.articleId ?? article.id,
      press: article.press,
      title: article.title,
      stance: article.stance,
      url: article.url || null
    }));
  const counterArticles = articles
    .filter((article) => article.stance === '반박')
    .slice(0, parsedLimit)
    .map((article) => ({
      articleId: article.articleId ?? article.id,
      press: article.press,
      title: article.title,
      stance: article.stance,
      url: article.url || null
    }));

  return {
    analysisId: analysis.id,
    keyword: analysis.keyword,
    biasAnalysis: {
      positiveCount: analysis.positive_count,
      neutralCount: analysis.neutral_count,
      negativeCount: analysis.negative_count,
      biasScore: analysis.bias_score
    },
    insights: insights.map((insight) => insight.content),
    relatedArticles,
    counterArticles,
    summaryStats: {
      collectedArticles: articles.length,
      pressCount: new Set(articles.map((article) => article.press)).size,
      averageReliability: 3.2
    },
    limit: parsedLimit
  };
};