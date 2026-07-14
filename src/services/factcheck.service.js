const checkDetailData = {
  checkId: 452,
  query: '"백신 부작용 사망자 급증?"',
  searchTime: '2024-05-20T14:30:00Z',
  totalArticles: 12,
  articles: [
    {
      articleId: 1001,
      press: 1,
      title: '질병청 "백신 접종 후 사망 사례, 인과성 확인 안돼"',
      url: 'https://example.com/article/1001'
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 2,
    totalItems: 12
  }
};

exports.createCheck = () => ({
  checkId: 452
});

exports.getCheckById = (id) => ({
  ...checkDetailData,
  checkId: Number(id) || 452
});
