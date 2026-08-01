const assert = require('node:assert/strict');
const AnalysisService = require('./src/services/analysis.service');

(async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.OPENAI_API_KEY;

  process.env.OPENAI_API_KEY = 'test-key';
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify({
            rankedArticles: [{ title: '백신 안전성 논란', press: '연합뉴스', stance: '반박', reason: '직접적인 반박 기사' }],
            insights: ['반박 기사가 핵심 맥락을 잘 설명합니다.']
          })
        }
      }]
    })
  });

  try {
    const plan = await AnalysisService.buildAnalysisPlan('백신 부작용', [{ title: '백신 안전성 논란', description: '백신 안전성 논란이 제기됐다.', press: '연합뉴스' }]);
    assert.equal(plan.articles[0].title, '백신 안전성 논란');
    assert.equal(plan.articles[0].stance, '반박');
    assert.equal(plan.insights[0], '반박 기사가 핵심 맥락을 잘 설명합니다.');
    console.log('analysis plan verification passed');
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
