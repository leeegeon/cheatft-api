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
  | `sort` | String | Query | X | 기사 정렬 방식 |
  | `page` | Number | Query | X | 페이지 번호 (기본값: 1) |
  | `limit` | Number | Query | X | 페이지당 항목 수 (기본값: 10) |

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
        "press": "연합뉴스",
        "title": "전문가 \"백신과 사망 간 연관성 매우 낮아\"",
        "stance": "긍정"
      }
    ],
    "counterArticles": [
      {
        "articleId": 301,
        "press": "서울경제",
        "title": "\"백신 부작용 사망 급증\" 주장은 사실과 달라",
        "stance": "반박"
      }
    ],
    "summaryStats": {
      "collectedArticles": 21,
      "pressCount": 15,
      "averageReliability": 3.2
    },
    "pagination": { "currentPage": 1, "totalPages": 2, "totalItems": 21 }
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
  | `date` | String | Query | X | 날짜 필터 (예: "last7days") |
  | `score` | Number | Query | X | 평균 신뢰도 이상 필터 |
  | `sort` | String | Query | X | 정렬 (예: "latest") |
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
        "status": "분석 완료",
        "relatedCount": 15,
        "counterCount": 11,
        "averageReliability": 2.6,
        "mainPresses": ["BBC 코리아", "사이언스타임즈", "자유일보"],
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
  | `sort` | String | Query | X | 정렬 방식 ("latest", "popular") |
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
      "joinDate": "2024-04-12"
    },
    "monthlySummary": {
      "searchCount": 58,
      "checkedArticles": 42,
      "reportsCreated": 19,
      "averageReliability": 3.2
    },
    "biasAnalysis": {
      "positiveRatio": 71,
      "neutralRatio": 14,
      "negativeRatio": 0,
      "warning": "현재 긍정적인 정보가 다소 많습니다."
    },
    "badges": [
      "신뢰 탐색자", "팩트체크 마스터", "소통 전문가"
    ],
    "recentActivities": [
      {
        "type": "check",
        "title": "백신 부작용 사망자 급증?",
        "date": "2024-05-20",
        "score": 3.1
      }
    ]
  }
}
```
