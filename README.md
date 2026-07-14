# CheatF/T API Specification

본 문서는 CheatF/T 서비스의 백엔드 API 명세서입니다. 프론트엔드 연동 및 테스트를 위한 더미 데이터(Dummy Data) 형식을 포함하고 있습니다.

## 공통 응답 포맷 (Common Response Format)
모든 API 응답은 아래와 같은 일관된 JSON 구조를 가집니다.

```json
{
  "status": 200,
  "message": "Success",
  "data": { } 
}
```

### 인증 토큰 사용 안내
로그인이 필요한 API는 요청 헤더에 인증 토큰을 포함해야 정상적으로 동작합니다. 일반적으로 `Authorization` 헤더에 `Bearer {token}` 형식으로 전달합니다.

```javascript
// 프론트엔드(React, Vue 등)에서 보내는 요청 예시
fetch('http://localhost:3002/api/analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 이렇게 헤더에 토큰을 실어 보냅니다!
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5c... (생략)'
  },
  body: JSON.stringify({
    keyword: '백신 부작용',
    period: 1
  })
})
```

로그인이 필요한 기능에 대한 API를 호출할 때에는 위와 같이 헤더에 로그인 시 제공되는 토큰을 포함해야 정상적으로 작동됩니다. 토큰은 생성 후 24시간 동안 유효합니다.

---

## 1. 홈 (Home)

### `GET` /api/summary
홈 화면의 대시보드 요약 정보(검증 통계, 최신 팩트체크, 편향성 현황)를 조회합니다.

* **Parameters:** None
* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "todayStats": {
      "requests": 1248,
      "completed": 842,
      "accuracyRate": 91
    },
    "recentChecks": [
      {
        "id": 1,
        "title": "\"OOO 백신 부작용 사망자 급증?\"",
        "result": "FALSE",
        "timeAgo": "2시간 전"
      }
    ],
    "biasStatus": {
      "overallScore": 32,
      "categories": [
        { "name": "정치", "score": 28, "level": "보통" },
        { "name": "사회", "score": 45, "level": "다소 높음" }
      ]
    }
  }
}
```

---

## 2. 인증 (Auth)

### `POST` /api/signup
신규 회원가입을 처리합니다.

* **Parameters (Body):**
  | Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | O | 사용자 이메일 |
  | `password` | String | O | 비밀번호 |
  | `nickname` | String | O | 사용할 닉네임 |

* **Response:**
```json
{
  "status": 201,
  "message": "User created successfully",
  "data": {
    "userId": 101,
    "nickname": "신뢰탐색자"
  }
}
```

### `POST` /api/login
로그인을 처리하고 인증 토큰을 발급합니다.

* **Parameters (Body):**
  | Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | O | 사용자 이메일 |
  | `password` | String | O | 비밀번호 |

* **Response:**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "userId": 101
  }
}
```

---

## 3. 검증하기 (Fact-Check)

### `POST` /api/checks
텍스트나 URL을 기반으로 새로운 팩트체크 검증을 요청합니다.

* **Parameters (Body):**
  | Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `type` | String | O | `"text"` 또는 `"url"` |
  | `content` | String | O | 검증할 문장 또는 기사 링크 |

* **Response:**
```json
{
  "status": 202,
  "message": "Check requested successfully",
  "data": {
    "checkId": 452
  }
}
```

### `GET` /api/checks/{id}
특정 검증 요청에 대한 분석 결과(신뢰성 등급, 기사 목록)를 조회합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 검증 ID |
  | `page` | Number | Query | X | 페이지 번호 (기본값: 1) |
  | `limit` | Number | Query | X | 페이지당 항목 수 (기본값: 10) |

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "checkId": 452,
    "query": "\"백신 부작용 사망자 급증?\"",
    "searchTime": "2024-05-20T14:30:00Z",
    "totalArticles": 12,
    "articles": [
      {
        "articleId": 1001,
        "press": 1,
        "title": "질병청 \"백신 접종 후 사망 사례, 인과성 확인 안돼\"",
        "url": "https://..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12
    }
  }
}
```

언론사 넘버는 https://news.naver.com/main/officeList.naver에 나와있는 순서대로 처음부터 0번입니다.

---

## 4. 알고리즘 분석 (Algorithm Analysis)

### `POST` /api/analysis
특정 주제나 키워드에 대한 알고리즘 편향성 분석을 요청합니다.

* **Parameters (Body):**
  | Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `keyword` | String | O | 분석할 주제/키워드 |
  | `period` | Number | O | 분석 기간 (단위: 달, 예: `1` = 1개월) |

* **Response:**
```json
{
  "status": 202,
  "message": "Analysis requested successfully",
  "data": {
    "analysisId": 89
  }
}
```

### `GET` /api/analysis/{id}
분석이 완료된 성향 지수, 관련/반박 기사, 주요 인사이트를 조회합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 분석 ID |
  | `limit` | Number | Query | X | 최대 항목 수 (기본값: 4) |

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "analysisId": 89,
    "keyword": "\"백신 부작용 사망자 급증?\"",
    "biasAnalysis": {
      "positiveCount": 10,
      "neutralCount": 2,
      "negativeCount": 0,
      "biasScore": 80
    },
    "insights": [
      "관련 뉴스 중 긍정/중도 성향의 기사가 다수를 차지합니다.",
      "반박 기사는 주로 '인과성 부족'을 근거로 반박하고 있습니다."
    ],
    "relatedArticles": [
      {
        "articleId": 201,
        "press": 4,
        "title": "전문가 \"백신과 사망 간 연관성 매우 낮아\"",
        "stance": "긍정"
      }
    ],
    "counterArticles": [
      {
        "articleId": 301,
        "press": 8,
        "title": "\"백신 부작용 사망 급증\" 주장은 사실과 달라",
        "stance": "반박"
      }
    ],
    "summaryStats": {
      "collectedArticles": 21,
      "pressCount": 15,
      "averageReliability": 3.2
    },
    "limit": 4
  }
}
```

---

## 5. 팩트체크 리포트 (Reports)

### `GET` /api/reports
전체 팩트체크 리포트 목록을 페이지네이션하여 조회합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `keyword` | String | Query | X | 주제 검색어 |
  | `date` | Number | Query | X | 날짜 필터 (단위: 일, 예: `1` = 1일) |
  | `score` | Number | Query | X | 평균 신뢰도 이상 필터 |
  | `page` | Number | Query | X | 페이지 번호 (기본값: 1) |
  | `limit` | Number | Query | X | 페이지당 항목 수 (기본값: 10) |

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "totalStats": {
      "searchedTopics": 18,
      "analyzedArticles": 216,
      "averageReliability": 3.2
    },
    "reports": [
      {
        "id": 501,
        "topic": "기후변화는 인간의 영향이 아니다?",
        "searchTime": "2024-05-20T14:30:00Z",
        "status": "분석 완료",
        "relatedCount": 15,
        "counterCount": 11,
        "averageReliability": 2.6,
        "mainPresses": [7, 4, 2],
        "summary": "다수의 과학적 연구는 최근 기후변화의 주요 원인이 인간 활동에 의한 것임을 지지하고 있습니다."
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 2, "totalItems": 18 }
  }
}
```

---

## 6. 커뮤니티 (Community)

### `GET` /api/posts
게시판의 글 목록과 우측 참여 현황 통계를 조회합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `category` | String | Query | X | 카테고리 (예: "정보공유", "정정요청") |
  | `keyword` | String | Query | X | 검색어 |
  | `page` | Number | Query | X | 페이지 번호 (기본값: 1) |
  | `limit` | Number | Query | X | 페이지당 항목 수 (기본값: 10) |

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "communityStats": {
      "todayPosts": 128,
      "todayComments": 342,
      "totalMembers": 2845
    },
    "posts": [
      {
        "id": 1001,
        "category": "정보 공유",
        "title": "백신 부작용 사망자 급증? 관련 추가 자료 공유합니다.",
        "author": "user_123",
        "createdAt": "2024-05-20T14:30:00Z",
        "views": 1245,
        "commentCount": 23
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 15, "totalItems": 145 }
  }
}
```

### `POST` /api/posts
새로운 게시글을 작성합니다.

* **Parameters (Body):**
  | Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `title` | String | O | 게시글 제목 |
  | `content` | String | O | 게시글 본문 |
  | `category` | String | O | 카테고리 |
  | `tags` | Array | X | 태그 목록 (예: `["백신", "건강"]`) |

---

## 7. 마이페이지 (Profile)

### `GET` /api/profile
사용자의 개인 분석 통계, 획득 배지, 성향 분포 등을 조회합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `period` | Number | Query | X | 분석 기간 필터 (단위: 달, 예: `1` = 최근 1개월) |

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "userInfo": {
      "nickname": "사용자 님",
      "level": 4,
      "userTitle": "신뢰 탐색자",
      "joinDate": "2024-04-12"
    },
    "myContribution": {
      "opinionShareCount": 23,
      "editRequestCount": 7,
      "knowledgeCommunityAnswerCount": 15,
      "totalLikesReceived": 128
    },
    "streakReward": {
      "currentStreakDays": 7,
      "targetStreakDays": 14,
      "rewardMessage": "14일 연속 시 뱃지 지급!"
    },
    "personalDashboard": {
      "totalSearch": { "count": 58, "changeRate": 16, "direction": "up" },
      "checkedArticles": { "count": 42, "changeRate": 22, "direction": "up" },
      "factCheckReports": { "count": 19, "changeRate": 19, "direction": "up" },
      "communityActivities": { "count": 31, "changeRate": 8, "direction": "up" },
      "averageReliabilityScore": { "score": 3.2, "changeRate": 0.4, "direction": "up" }
    },
    "infoConsumptionBias": {
      "biasDistribution": {
        "positiveRatio": 71,
        "neutralRatio": 14,
        "negativeRatio": 0
      },
      "alertMessage": "현재 긍정적인 정보가 다소 많습니다. 다양한 관점의 정보를 확인해보세요.",
      "categoryBiasDistribution": [
        { "category": "정치", "positive": 8, "neutral": 2, "negative": 0 },
        { "category": "경제", "positive": 6, "neutral": 1, "negative": 0 },
        { "category": "사회", "positive": 5, "neutral": 1, "negative": 0 },
        { "category": "과학/기술", "positive": 4, "neutral": 0, "negative": 0 },
        { "category": "국제", "positive": 3, "neutral": 3, "negative": 0 }
      ]
    },
    "reliabilityDistribution": {
      "trustworthy4_5": { "count": 18, "ratio": 42 },
      "reliable3": { "count": 15, "ratio": 36 },
      "normal2": { "count": 7, "ratio": 17 },
      "caution1": { "count": 2, "ratio": 5 },
      "untrustworthy0": { "count": 0, "ratio": 0 }
    },
    "interestTopicsTop5": [
      { "rank": 1, "category": "정치", "searchCount": 25, "ratio": 43 },
      { "rank": 2, "category": "경제", "searchCount": 18, "ratio": 31 },
      { "rank": 3, "category": "사회", "searchCount": 12, "ratio": 21 },
      { "rank": 4, "category": "과학/기술", "searchCount": 7, "ratio": 12 },
      { "rank": 5, "category": "국제", "searchCount": 5, "ratio": 9 }
    ],
    "earnedBadges": [
      { "name": "신뢰 탐색자", "level": "Lv. 4", "condition": "" },
      { "name": "팩트 체크 마스터", "level": null, "condition": "10회 검증" },
      { "name": "소통 전문가", "level": null, "condition": "20회 참여" },
      { "name": "지식 공유자", "level": null, "condition": "15회 기여" }
    ],
    "recentActivities": [
      { "title": "백신 부작용 사망자 급증?", "date": "2024.05.20", "score": 3.1 },
      { "title": "기후변화는 인간의 영향이 아니다?", "date": "2024.05.18", "score": 2.6 },
      { "title": "AI가 일자리를 대체한다?", "date": "2024.05.15", "score": 3.4 },
      { "title": "일본 후쿠시마 오염수 방류 안전하다?", "date": "2024.05.12", "score": 2.9 },
      { "title": "우크라이나 전쟁, 미국의 개입이 원인?", "date": "2024.05.10", "score": 3.0 }
    ],
    "monthlySummary": {
      "yearMonth": "2024.05",
      "searchCount": { "count": 22, "changeRate": 10, "direction": "up" },
      "checkedArticles": { "count": 16, "changeRate": 14, "direction": "up" },
      "communityActivities": { "count": 9, "changeRate": 13, "direction": "up" },
      "averageReliabilityScore": { "score": 3.2, "changeRate": 0.3, "direction": "up" }
    }
  }
}
```
아마 badges 부분에 대해서는 사전에 badge 목록을 만들어 두고 index만 반환하는 형식이 올바를 것 같습니다.
