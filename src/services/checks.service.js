// src/services/checks.service.js
const ChecksModel = require('../models/checks.model');

const PRESS_MAPPING = {
  '001': '연합뉴스',
  '002': '프레시안',
  '003': '뉴시스',
  '005': '국민일보',
  '008': '머니투데이',
  '009': '매일경제',
  '011': '서울경제',
  '014': '파이낸셜뉴스',
  '015': '한국경제',
  '016': '헤럴드경제',
  '018': '이데일리',
  '020': '동아일보',
  '021': '문화일보',
  '022': '세계일보',
  '023': '조선일보',
  '024': '매경이코노미',
  '025': '중앙일보',
  '028': '한겨레',
  '029': '디지털타임스',
  '030': '전자신문',
  '031': '아이뉴스24',
  '032': '경향신문',
  '036': '한겨레21',
  '047': '오마이뉴스',
  '050': '한경비즈니스',
  '052': 'YTN',
  '053': '주간조선',
  '055': 'SBS',
  '056': 'KBS',
  '057': 'MBN',
  '076': '스포츠조선',
  '079': '노컷뉴스',
  '081': '서울신문',
  '082': '부산일보',
  '088': '매일신문',
  '092': 'ZDNet Korea',
  '108': '스타뉴스',
  '109': 'OSEN',
  '119': '데일리안',
  '123': '조세일보',
  '138': '디지털데일리',
  '144': '스포츠경향',
  '214': 'MBC',
  '215': '한국경제TV',
  '241': '일간스포츠',
  '243': '이코노미스트',
  '277': '아시아경제',
  '296': '코메디닷컴',
  '366': '조선비즈',
  '374': 'SBS Biz',
  '382': '스포츠동아',
  '408': 'MBC연예',
  '410': 'MK스포츠',
  '417': '동행미디어 시대',
  '421': '뉴스1',
  '422': '연합뉴스TV',
  '437': 'JTBC',
  '448': 'TV조선',
  '449': '채널A',
  '468': '스포츠서울',
  '469': '한국일보',
  '609': '뉴스엔',
  '629': '더팩트',
  '648': '비즈워치',
  '654': '강원도민일보',
  '656': '대전일보',
  '658': '국제신문',
  '659': '전주MBC',
  '666': '경기일보',
};

const stripTags = (value = '') => value.replace(/<[^>]*>?/gm, '');

const decodeHtmlEntities = (value = '') => String(value)
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));

const normalizeText = (value = '') => decodeHtmlEntities(stripTags(value));

const getPressFromLink = (link = '') => {
  const match = link.match(/(?:article\/|oid=)(\d+)/);
  if (!match || !match[1]) return '기타 언론사';

  const pressId = match[1];
  return PRESS_MAPPING[pressId] || `언론사(${pressId})`;
};

const buildFallbackArticles = (content) => {
  const title = `${content} 관련 기사 예시`;
  return [
    {
      press: '연합뉴스',
      title,
      description: `${content} 관련 대표 기사 예시입니다.`,
      url: 'https://example.com/news/1',
      pubDate: new Date().toISOString()
    }
  ];
};

const EXAMPLE_ARTICLE = {
  title: '삼전닉스 레버리지 보완 첫날, 거래대금 75% ‘뚝’',
  content: '[데일리안 = 서진주 기자] 단일종목 레버리지 상품의 기본예탁금 상향(1000만원→3000만원)이 처음 적용된 31일, 거래대금과 거래량이 큰 폭으로 감소했다.\n\n31일 한국거래소에 따르면 삼성전자와 SK하이닉스를 기초자산으로 하는 단일종목 레버리지·인버스 16종목의 거래대금은 약 3조원으로 집계됐다...',
  press: '데일리안',
  reporter: '서진주',
  inputTime: '2026.07.31. 오후 6:28',
  topic: '경제',
  url: 'https://n.news.naver.com/article/119/0003117138?cds=news_media_pc&type=editn'
};

exports.getArticleFromUrl = async (url) => {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  const isNaverNewsUrl = /^https:\/\/n\.news\.naver\.com\/article\/\d+\/\d+([?#].*)?$/.test(trimmed);

  if (!isNaverNewsUrl) {
    throw new Error('네이버 뉴스 링크만 지원합니다.');
  }

  return EXAMPLE_ARTICLE;
};

exports.processCheckRequest = async (userId, type, content) => {
  const checkId = await ChecksModel.createCheck(userId, type, content);

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const fallbackArticles = buildFallbackArticles(content);
    for (const article of fallbackArticles) {
      await ChecksModel.saveArticle(checkId, article.press, article.title, article.description, article.url, article.pubDate);
    }
    return { checkId };
  }

  try {
    const url = new URL('https://openapi.naver.com/v1/search/news.json');
    url.searchParams.set('query', content);
    url.searchParams.set('display', '12');
    url.searchParams.set('sort', 'sim');

    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    for (const item of items) {
      const cleanTitle = normalizeText(item.title || '');
      const cleanDescription = normalizeText(item.description || '');
      const press = getPressFromLink(item.link || '');

      await ChecksModel.saveArticle(
        checkId,
        press,
        cleanTitle,
        cleanDescription,
        item.link,
        item.pubDate
      );
    }

    return { checkId };
  } catch (error) {
    console.error('네이버 API 호출 실패:', error.message);
    const fallbackArticles = buildFallbackArticles(content);
    for (const article of fallbackArticles) {
      await ChecksModel.saveArticle(checkId, article.press, article.title, article.description, article.url, article.pubDate);
    }
    return { checkId };
  }
};

exports.getCheckData = async (id) => {
  const data = await ChecksModel.getCheckById(id);
  if (!data) return null;

  const { check, articles } = data;

  return {
    checkId: check.id,
    query: check.content,
    searchTime: check.created_at,
    totalArticles: articles.length,
    articles: articles.map((a) => ({
      articleId: a.id,
      press: a.press,
      title: normalizeText(a.title),
      description: normalizeText(a.description),
      date: new Date(a.pub_date).toISOString().split('T')[0],
      url: a.url
    }))
  };
};