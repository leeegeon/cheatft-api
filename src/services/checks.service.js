// src/services/checks.service.js
const ChecksModel = require('../models/checks.model');

const PRESS_MAPPING = {
  '001': '연합뉴스',
  '003': '뉴시스',
  '421': '뉴스1',
  '056': 'KBS',
  '214': 'MBC',
  '055': 'SBS',
  '052': 'YTN',
  '028': '한겨레',
  '032': '경향신문',
  '023': '조선일보',
  '025': '중앙일보',
  '020': '동아일보',
  '015': '한국경제',
  '009': '매일경제',
  '018': '이데일리',
  '119': '데일리안',
  '008': '머니투데이',
  '047': '오마이뉴스',
  '144': '스포츠경향',
};

const stripTags = (value = '') => value.replace(/<[^>]*>?/gm, '');

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
      const cleanTitle = stripTags(item.title || '');
      const cleanDescription = stripTags(item.description || '');
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
      title: a.title,
      description: a.description,
      date: new Date(a.pub_date).toISOString().split('T')[0],
      url: a.url
    })),
    pagination: { currentPage: 1, totalPages: 1, totalItems: articles.length }
  };
};