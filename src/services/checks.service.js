// src/services/checks.service.js
const cheerio = require('cheerio');
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
  '445': 'MHN스포츠',
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

const SECTION_MAPPING = {
  '100': '정치',
  '101': '경제',
  '102': '사회',
  '103': '생활/문화',
  '104': '세계',
  '105': 'IT/과학',
  '108': '연예',
  '109': '스포츠',
  '110': '오피니언',
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

exports.getArticleFromUrl = async (url) => {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  const isNaverNewsUrl = /^https:\/\/(n\.|m\.|www\.)?news\.naver\.com\/(article|mnews\/article)\/\d+\/\d+([?#].*)?$/.test(trimmed) ||
                         /^https:\/\/(www\.)?news\.naver\.com\/main\/read\.naver.*$/.test(trimmed);

  const isNaverEntertainUrl = /^https:\/\/(m\.|www\.)?entertain\.naver\.com\/.*$/.test(trimmed);

  if (!isNaverNewsUrl && !isNaverEntertainUrl) {
    throw new Error('네이버 뉴스 및 네이버 연예 링크만 지원합니다.');
  }

  try {
    const response = await fetch(trimmed, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`뉴스 페이지를 불러올 수 없습니다 (HTTP ${response.status})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. 기사 제목
    const title = $('#title_area span').text().trim() ||
                  $('h2[class*="ArticleHead_article_title"]').text().trim() ||
                  $('h2.media_end_head_headline').text().trim() ||
                  $('#articleTitle').text().trim() ||
                  $('meta[property="og:title"]').attr('content')?.trim() || '';

    // 2. 언론사
    let press = $('.media_end_head_top_press').text().trim() ||
                $('.ofhd_float_title_text_press').text().trim() ||
                $('meta[property="og:article:author"]').attr('content')?.split('|')[0]?.trim() ||
                $('meta[name="twitter:creator"]').attr('content')?.trim() || '';

    if (!press) {
      press = getPressFromLink(trimmed);
    }

    // 3. 입력 시간
    const inputTime = $('._ARTICLE_DATE_TIME').first().text().trim() ||
                      $('.media_end_head_info_datestamp_time').first().text().trim() ||
                      $('[class*="DateInfo_info_item"] .date').first().text().trim() ||
                      $('meta[property="article:published_time"]').attr('content')?.trim() || '';

    // 4. 기사 주제
    let topic = isNaverEntertainUrl ? '연예' : ($('.media_end_categorize_item').text().trim() || $('.Nlist_item._LNB_ITEM.is_active .Nitem_link_menu').text().trim() || '');

    if (!topic) {
      const sectionMatch = html.match(/sectionId\s*:\s*["'](\d+)["']/);
      if (sectionMatch && sectionMatch[1]) {
        topic = SECTION_MAPPING[sectionMatch[1]] || '';
      }
    }

    if (isNaverEntertainUrl) {
      topic = '연예';
    }

    // 5. 기자 이름
    let reporter = $('.media_end_head_journalist_name').text().trim() ||
                   $('.byline').text().trim() ||
                   $('.journal_author').text().trim() ||
                   $('[class*="JournalistInfo_name"]').text().trim() || '';

    // 6. 기사 전문
    const $content = $('#comp_news_article, ._article_content, #dic_area, #articleBodyContents, #articeBody').first().clone();
    $content.find('script, style, .end_photo_org, iframe, .byline, .copyright').remove();
    $content.find('br').replaceWith('\n');
    $content.find('p, div, strong.media_end_summary').after('\n\n');

    let contentText = $content.text()
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .join('\n\n');

    if (!reporter) {
      const bylineMatch = contentText.match(/\[\s*[^=\]\s]+\s*=\s*([가-힣]{2,4})\s*(?:기자|특파원)?\s*\]/) ||
                          contentText.match(/\(\s*[^=\)\s]+\s*=?\s*([가-힣]{2,4})\s*(?:기자|특파원)\s*\)/) ||
                          contentText.match(/([가-힣]{2,4})\s*기자/);
      if (bylineMatch) {
        reporter = bylineMatch[1];
      }
    }

    if (reporter) {
      reporter = reporter.replace(/\s*기자$/, '').replace(/\s*특파원$/, '').trim();
    }

    return {
      title,
      content: contentText,
      press,
      reporter,
      inputTime,
      topic,
      url: trimmed
    };
  } catch (error) {
    if (error.message === '네이버 뉴스 및 네이버 연예 링크만 지원합니다.') {
      throw error;
    }
    console.error('기사 스크래핑 실패:', error.message);
    throw new Error(`기사 정보를 불러오는데 실패했습니다: ${error.message}`);
  }
};

exports.processCheckRequest = async (userId, param2, param3) => {
  const content = param3 !== undefined ? param3 : param2;
  const type = param3 !== undefined ? param2 : 'keyword';
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
    url.searchParams.set('display', '100');
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