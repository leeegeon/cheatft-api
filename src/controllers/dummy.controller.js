const summaryData = {
  todayStats: {
    requests: 1248,
    completed: 842,
    accuracyRate: 91
  },
  recentChecks: [
    {
      id: 1,
      title: '"OOO 백신 부작용 사망자 급증?"',
      result: 'FALSE',
      timeAgo: '2시간 전'
    },
    {
      id: 1,
      title: '"지구온난화는 인위적인 조작이다?"',
      result: 'TRUE',
      timeAgo: '5시간 전'
    },
    {
      id: 1,
      title: '"OOO 식물이 암을 치료한다?"',
      result: 'FALSE',
      timeAgo: '1일 전'
    },
    
  ],
  biasStatus: {
    overallScore: 32,
    categories: [
      { name: '정치', score: 28, level: '보통' },
      { name: '사회', score: 45, level: '다소 높음' }
    ]
  }
};

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

const reportsData = {
  totalStats: {
    searchedTopics: 18,
    analyzedArticles: 216,
    averageReliability: 3.2
  },
  reports: [
    {
      id: 501,
      topic: '기후변화는 인간의 영향이 아니다?',
      searchTime: '2024-05-20T14:30:00Z',
      status: '분석 완료',
      relatedCount: 15,
      counterCount: 11,
      averageReliability: 2.6,
      mainPresses: [7, 4, 2],
      summary: '다수의 과학적 연구는 최근 기후변화의 주요 원인이 인간 활동에 의한 것임을 지지하고 있습니다.'
    }
  ],
  pagination: { currentPage: 1, totalPages: 2, totalItems: 18 }
};

const postsData = {
  communityStats: {
    todayPosts: 128,
    todayComments: 342,
    totalMembers: 2845
  },
  posts: [
    {
      id: 1001,
      category: '정보 공유',
      title: '백신 부작용 사망자 급증? 관련 추가 자료 공유합니다.',
      author: 'user_123',
      createdAt: '2024-05-20T14:30:00Z',
      views: 1245,
      commentCount: 23
    }
  ],
  pagination: { currentPage: 1, totalPages: 15, totalItems: 145 }
};

const profileData = {
  userInfo: {
    nickname: '사용자 님',
    level: 4,
    userTitle: '신뢰 탐색자',
    joinDate: '2024-04-12'
  },
  myContribution: {
    opinionShareCount: 23,
    editRequestCount: 7,
    knowledgeCommunityAnswerCount: 15,
    totalLikesReceived: 128
  },
  streakReward: {
    currentStreakDays: 7,
    targetStreakDays: 14,
    rewardMessage: '14일 연속 시 뱃지 지급!'
  },
  personalDashboard: {
    totalSearch: { count: 58, changeRate: 16, direction: 'up' },
    checkedArticles: { count: 42, changeRate: 22, direction: 'up' },
    factCheckReports: { count: 19, changeRate: 19, direction: 'up' },
    communityActivities: { count: 31, changeRate: 8, direction: 'up' },
    averageReliabilityScore: { score: 3.2, changeRate: 0.4, direction: 'up' }
  },
  infoConsumptionBias: {
    biasDistribution: {
      positiveRatio: 71,
      neutralRatio: 14,
      negativeRatio: 0
    },
    alertMessage: '현재 긍정적인 정보가 다소 많습니다. 다양한 관점의 정보를 확인해보세요.',
    categoryBiasDistribution: [
      { category: '정치', positive: 8, neutral: 2, negative: 0 },
      { category: '경제', positive: 6, neutral: 1, negative: 0 },
      { category: '사회', positive: 5, neutral: 1, negative: 0 },
      { category: '과학/기술', positive: 4, neutral: 0, negative: 0 },
      { category: '국제', positive: 3, neutral: 3, negative: 0 }
    ]
  },
  reliabilityDistribution: {
    trustworthy4_5: { count: 18, ratio: 42 },
    reliable3: { count: 15, ratio: 36 },
    normal2: { count: 7, ratio: 17 },
    caution1: { count: 2, ratio: 5 },
    untrustworthy0: { count: 0, ratio: 0 }
  },
  interestTopicsTop5: [
    { rank: 1, category: '정치', searchCount: 25, ratio: 43 },
    { rank: 2, category: '경제', searchCount: 18, ratio: 31 },
    { rank: 3, category: '사회', searchCount: 12, ratio: 21 },
    { rank: 4, category: '과학/기술', searchCount: 7, ratio: 12 },
    { rank: 5, category: '국제', searchCount: 5, ratio: 9 }
  ],
  earnedBadges: [
    { name: '신뢰 탐색자', level: 'Lv. 4', condition: '' },
    { name: '팩트 체크 마스터', level: null, condition: '10회 검증' },
    { name: '소통 전문가', level: null, condition: '20회 참여' },
    { name: '지식 공유자', level: null, condition: '15회 기여' }
  ],
  recentActivities: [
    { title: '백신 부작용 사망자 급증?', date: '2024.05.20', score: 3.1 },
    { title: '기후변화는 인간의 영향이 아니다?', date: '2024.05.18', score: 2.6 },
    { title: 'AI가 일자리를 대체한다?', date: '2024.05.15', score: 3.4 },
    { title: '일본 후쿠시마 오염수 방류 안전하다?', date: '2024.05.12', score: 2.9 },
    { title: '우크라이나 전쟁, 미국의 개입이 원인?', date: '2024.05.10', score: 3.0 }
  ],
  monthlySummary: {
    yearMonth: '2024.05',
    searchCount: { count: 22, changeRate: 10, direction: 'up' },
    checkedArticles: { count: 16, changeRate: 14, direction: 'up' },
    communityActivities: { count: 9, changeRate: 13, direction: 'up' },
    averageReliabilityScore: { score: 3.2, changeRate: 0.3, direction: 'up' }
  }
};

exports.getSummary = (req, res) => {
  res.status(200).json({ status: 200, message: 'Success', data: summaryData });
};

exports.getReports = (req, res) => {
  res.status(200).json({ status: 200, message: 'Success', data: reportsData });
};

exports.getPosts = (req, res) => {
  res.status(200).json({ status: 200, message: 'Success', data: postsData });
};

exports.createPost = (req, res) => {
  res.status(201).json({
    status: 201,
    message: 'Post created successfully',
    data: {
      id: 1002,
      title: req.body?.title || '새 게시글',
      category: req.body?.category || '정보 공유'
    }
  });
};

exports.getProfile = (req, res) => {
  res.status(200).json({ status: 200, message: 'Success', data: profileData });
};
