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


