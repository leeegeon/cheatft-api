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
홈 화면의 대시보드 요약 정보(검증 통계, 최근 분석 리포트)를 조회합니다.

* **Parameters:** None
* **Notes:**
  - 인증 토큰 없이도 조회할 수 있습니다.
  - 응답의 `recentChecks` 배열은 서비스 전체의 최근 분석 리포트 목록을 기준으로 구성됩니다.
  - 서비스 전체의 최근 분석 결과와 통계를 기준으로 응답합니다.
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
      },
      {
        "id": 2,
        "title": "\"미세먼지가 백신 부작용을 유발한다?\"",
        "result": "UNVERIFIED",
        "timeAgo": "5시간 전"
      },
      {
        "id": 3,
        "title": "\"유전자 변형 식품이 암을 일으킨다?\"",
        "result": "FALSE",
        "timeAgo": "1일 전"
      }
    ]
  }
}
```

---

## 2. 인증 (Auth)

### `POST` /api/signup
신규 회원가입을 처리합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `email` | String | Body | O | 사용자 이메일 |
  | `password` | String | Body | O | 비밀번호 |
  | `nickname` | String | Body | O | 사용할 닉네임 |

* **Response:**
```json
{
  "status": 201,
  "message": "회원가입 성공",
  "data": {
    "id": 1,
    "email": "test1@example.com",
    "nickname": "첫테스터",
    "level": 1,
    "user_title": "신규 사용자",
    "created_at": "2026-07-14T13:56:55.862Z"
  }
}
```

### `POST` /api/login
로그인을 처리하고 인증 토큰을 발급합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `email` | String | Body | O | 사용자 이메일 |
  | `password` | String | Body | O | 비밀번호 |

* **Response:**
```json
{
  "status": 200,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "userId": 1,
    "nickname": "신뢰탐색자"
  }
}
```

### `GET` /api/me
로그인된 사용자의 기본 정보를 조회합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Response:**
```json
{
  "status": 200,
  "message": "사용자 정보 조회 성공",
  "data": {
    "id": 1,
    "email": "test1@example.com",
    "nickname": "첫테스터",
    "level": 1,
    "user_title": "신규 사용자",
    "created_at": "2026-07-14T13:56:55.862Z"
  }
}
```

### `POST` /api/password/code
사용자 이메일로 비밀번호 재설정용 6자리 인증번호를 발송합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `email` | String | Body | O | 가입된 사용자 이메일 |

* **Notes:**
  - 60초 이내 중복 재발송 요청 시 429 에러가 발생합니다.

* **Response:**
```json
{
  "status": 200,
  "message": "인증번호가 이메일로 발송되었습니다."
}
```

### `POST` /api/password/verify
발송된 6자리 인증번호를 검증하고, 비밀번호 재설정용 1회용 토큰(`resetToken`)을 발급합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `email` | String | Body | O | 사용자 이메일 |
  | `code` | String | Body | O | 6자리 인증번호 |

* **Notes:**
  - 인증번호 유효 시간은 5분입니다.
  - 5회 이상 오입력 시 해당 인증번호는 무효화됩니다.

* **Response:**
```json
{
  "status": 200,
  "message": "이메일 인증이 완료되었습니다.",
  "data": {
    "resetToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### `POST` /api/password/reset
발급받은 `resetToken`을 사용하여 새로운 비밀번호로 변경합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `resetToken` | String | Body | O | `/api/password/verify`에서 발급받은 재설정 토큰 |
  | `newPassword` | String | Body | O | 변경할 신규 비밀번호 (최소 8자 이상) |

* **Response:**
```json
{
  "status": 200,
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

---

## 3. 검증하기 (Fact-Check)

### `POST` /api/checks
입력된 문장이나 키워드를 기반으로 새로운 팩트체크 검증을 요청합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `content` | String | Body | O | 검증할 문장 또는 키워드 |
  | `Authorization` | String | Header | X | `Bearer {token}` 형식의 인증 토큰 (선택) |

* **Notes:**
  - 로그인 여부와 관계없이 검증 요청을 보낼 수 있습니다.
  - 로그인한 사용자의 경우 인증 토큰을 헤더에 포함할 수 있습니다.

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

### `POST` /api/article
네이버 뉴스 URL을 받아 기사 정보를 예시 형식으로 반환합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `url` | String | Body | O | 네이버 뉴스 링크만 허용 |

* **Notes:**
  - 인증 토큰은 필요 없습니다.
  - 오직 `https://n.news.naver.com/article/...` 형식의 네이버 뉴스 링크만 허용됩니다.

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "title": "삼전닉스 레버리지 보완 첫날, 거래대금 75% ‘뚝’",
    "content": "[데일리안 = 서진주 기자] 단일종목 레버리지 상품의 기본예탁금 상향(1000만원→3000만원)이 처음 적용된 31일, 거래대금과 거래량이 큰 폭으로 감소했다.\n\n31일 한국거래소에 따르면 삼성전자와 SK하이닉스를 기초자산으로 하는 단일종목 레버리지·인버스 16종목의 거래대금은 약 3조원으로 집계됐다...",
    "press": "데일리안",
    "reporter": "서진주",
    "inputTime": "2026.07.31. 오후 6:28",
    "topic": "경제",
    "url": "https://n.news.naver.com/article/119/0003117138?cds=news_media_pc&type=editn"
  }
}
```

### `GET` /api/checks/{id}
특정 검증 요청에 대한 분석 결과(신뢰성 등급, 기사 목록)를 조회합니다.

* **Notes:**
  - 로그인 여부와 관계없이 검증 결과를 조회할 수 있습니다.
  - 로그인한 사용자의 경우 인증 토큰을 헤더에 포함할 수 있습니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 검증 ID |
  | `Authorization` | String | Header | X | `Bearer {token}` 형식의 인증 토큰 (선택) |

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
        "press": "연합뉴스",
        "title": "질병청 \"백신 접종 후 사망 사례, 인과성 확인 안돼\"",
        "description":"기사 내용",
        "url": "https://..."
      }
    ]
  }
}
```

---

## 4. 알고리즘 분석 (Algorithm Analysis)

### `POST` /api/keywords
입력된 문장이나 단어를 분석하여, 알고리즘 분석에 적합한 연관 키워드를 최대 5개까지 추출하여 추천합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `content` | String | Body | O | 분석할 문장 또는 단어 |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰  |

* **Response:**
```json
{
  "status": 200,
  "message": "Keywords recommended successfully",
  "data": {
    "keywords": [
      "백신 부작용",
      "사망 인과성",
      "질병관리청 발표",
      "코로나 백신 안전성",
      "이상 반응"
    ]
  }
}
```

### `POST` /api/analysis
특정 주제나 키워드에 대한 알고리즘 편향성 분석을 요청합니다. `/api/keywords`를 통해 추천된 키워드 중 하나를 선택하여 요청하는 것을 권장합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `keyword` | String | Body | O | 분석할 주제/키워드 |
  | `period` | Number | Body | O | 분석 기간 (단위: 달, 예: `1` = 1개월) |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰  |

* **Response:**
```json
{
  "status": 202,
  "message": "분석이 성공적으로 요청되었습니다.",
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
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

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
        "stance": "긍정",
        "url": "https://example.com/articles/201"
      }
    ],
    "counterArticles": [
      {
        "articleId": 301,
        "press": "YTN",
        "title": "\"백신 부작용 사망 급증\" 주장은 사실과 달라",
        "stance": "반박",
        "url": "https://example.com/articles/301"
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
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Response:**
```json
{
  "status": 200,
  "message": "성공",
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

### `DELETE` /api/reports/{id}
리포트 ID를 통해 특정 팩트체크 리포트를 삭제합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 삭제할 리포트 ID |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Response:**
```json
{
  "status": 200,
  "message": "성공",
  "data": {
    "message": "팩트체크 리포트가 삭제되었습니다.",
    "deletedReportId": 501
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
  | `category` | String | Query | X | 카테고리 (예: `"정보 공유 커뮤니티"`, `"정정 요청"`, `"토론 게시판"`) |
  | `keyword` | String | Query | X | 검색어 (제목 또는 본문) |
  | `page` | Number | Query | X | 페이지 번호 (기본값: 1) |
  | `limit` | Number | Query | X | 페이지당 항목 수 (기본값: 10, 최대: 100) |

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
        "category": "정보 공유 커뮤니티",
        "title": "백신 부작용 사망자 급증? 관련 추가 자료 공유합니다.",
        "preview": "최근 논란이 되고 있는 이슈에 대한 객관적인 데이터를 공유합니다...",
        "author": "신뢰탐색자",
        "createdAt": "2026-05-20T14:30:00Z",
        "views": 1245,
        "commentCount": 23
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 15, "totalItems": 145 }
  }
}
```

### `GET` /api/posts/{id}
특정 게시글의 상세 내용과 작성된 댓글 목록을 조회합니다. 조회 시 게시글의 조회수(`views`)가 1 증가합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 조회할 게시글 ID |

* **Notes:**
  - 인증 토큰 없이도 조회할 수 있습니다.

* **Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 1001,
    "category": "정보 공유 커뮤니티",
    "title": "백신 부작용 사망자 급증? 관련 추가 자료 공유합니다.",
    "content": "최근 논란이 되고 있는 이슈에 대한 객관적인 데이터를 공유합니다...",
    "tags": ["백신", "부작용", "팩트체크"],
    "views": 1246,
    "commentCount": 2,
    "createdAt": "2026-05-20T14:30:00Z",
    "author": "신뢰탐색자",
    "comments": [
      {
        "id": 1,
        "content": "좋은 정보 감사합니다. 참고하겠습니다.",
        "created_at": "2026-05-20T15:00:00Z",
        "author": "검증러"
      },
      {
        "id": 2,
        "content": "추가 출처는 어디서 확인할 수 있나요?",
        "created_at": "2026-05-20T15:10:00Z",
        "author": "팩트인사이트"
      }
    ]
  }
}
```

### `POST` /api/posts
새로운 게시글을 작성합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `title` | String | Body | O | 게시글 제목 |
  | `content` | String | Body | O | 게시글 본문 |
  | `category` | String | Body | O | 허용 카테고리: `"정보 공유 커뮤니티"`, `"정정 요청"`, `"토론 게시판"` |
  | `tags` | Array | Body | X | 태그 목록 (예: `["백신", "건강"]`) |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Notes:**
  - 로그인한 사용자만 등록 가능하며, 지정된 카테고리만 허용됩니다.

* **Response:**
```json
{
  "status": 201,
  "message": "Post created successfully",
  "data": {
    "id": 1002,
    "title": "새 게시글 제목",
    "category": "정정 요청"
  }
}
```

### `PUT` /api/posts/{id}
자신이 작성한 게시글의 정보(제목, 본문, 카테고리, 태그)를 수정합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 수정할 게시글 ID |
  | `title` | String | Body | O | 게시글 제목 |
  | `content` | String | Body | O | 게시글 본문 |
  | `category` | String | Body | O | 허용 카테고리: `"정보 공유 커뮤니티"`, `"정정 요청"`, `"토론 게시판"` |
  | `tags` | Array | Body | X | 태그 목록 (예: `["백신", "수정"]`) |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Notes:**
  - 게시글 작성자 본인만 수정할 수 있습니다.

* **Response:**
```json
{
  "status": 200,
  "message": "게시글이 성공적으로 수정되었습니다."
}
```

### `DELETE` /api/posts/{id}
자신이 작성한 게시글을 삭제합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 삭제할 게시글 ID |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Notes:**
  - 게시글 작성자 본인만 삭제할 수 있습니다.

* **Response:**
```json
{
  "status": 200,
  "message": "게시글이 성공적으로 삭제되었습니다."
}
```

### `POST` /api/posts/{id}/comments
특정 게시글에 새로운 댓글을 작성합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 댓글을 작성할 게시글 ID |
  | `content` | String | Body | O | 댓글 내용 |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Response:**
```json
{
  "status": 201,
  "message": "댓글이 작성되었습니다.",
  "data": {
    "id": 15,
    "content": "좋은 정보 감사합니다. 참고하겠습니다.",
    "created_at": "2026-08-04T14:00:00.000Z"
  }
}
```

### `DELETE` /api/posts/{id}/comments/{commentId}
자신이 작성한 댓글을 삭제합니다.

* **Parameters:**
  | Name | Type | In | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `id` | Number | Path | O | 해당 댓글이 작성된 게시글 ID |
  | `commentId` | Number | Path | O | 삭제할 댓글 ID |
  | `Authorization` | String | Header | O | `Bearer {token}` 형식의 인증 토큰 |

* **Notes:**
  - 댓글 작성자 본인만 삭제할 수 있습니다.

* **Response:**
```json
{
  "status": 200,
  "message": "댓글이 삭제되었습니다."
}
```