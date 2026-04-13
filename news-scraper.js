import * as cheerio from 'cheerio';

export const SITE_ORIGIN = 'https://hoangmaistarschool.edu.vn';
export const BLOG_URL = `${SITE_ORIGIN}/blog`;
export const FALLBACK_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmp0pra8FgPwn4a7TknxlEhMPqdIav7XOZBNgzGB3w2P4Og88NDdDNeL3e52jxPL1Q6-GRSYBkRRSWpCfytLFql3wHU28k9RjYAkF9vaXyodH_ZykLJQjHh_KP4nOVLEUzEJR9MqDZziu85tNthaJf4ENNeaaJRxKjILlWm7YyT0r2EMxUHqf395_kzg6xOnSNDY08aT5iE9NJ-Rd1INex8y6mMTzpo-D6l1ZtReCB4-iHmoTpYNj_4_Yvik13XxgJNkh2VLiLFtOk';

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
};

export const normalizeText = value =>
  (value || '').replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').trim();

export const toAbsoluteUrl = value => {
  if (!value) return '';
  try {
    return new URL(value, SITE_ORIGIN).toString();
  } catch {
    return value;
  }
};

export const parseDateParts = rawDate => {
  const normalized = normalizeText(rawDate);
  const isoMatch = normalized.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const publishedAt = `${year}-${month}-${day}T00:00:00+07:00`;
    return {
      date: `${day}/${month}/${year}`,
      publishedAt,
      sortValue: Date.parse(publishedAt),
    };
  }

  const match = normalized.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);

  if (!match) {
    const parsed = Date.parse(normalized);
    if (!Number.isNaN(parsed)) {
      const date = new Date(parsed);
      const day = `${date.getDate()}`.padStart(2, '0');
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const year = `${date.getFullYear()}`;
      return {
        date: `${day}/${month}/${year}`,
        publishedAt: `${year}-${month}-${day}T00:00:00+07:00`,
        sortValue: parsed,
      };
    }
  }

  if (!match) {
    return {
      date: normalized || new Date().toLocaleDateString('vi-VN'),
      publishedAt: undefined,
      sortValue: 0,
    };
  }

  const [, dayRaw, monthRaw, yearRaw] = match;
  const day = dayRaw.padStart(2, '0');
  const month = monthRaw.padStart(2, '0');
  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  const publishedAt = `${year}-${month}-${day}T00:00:00+07:00`;

  return {
    date: `${day}/${month}/${year}`,
    publishedAt,
    sortValue: Date.parse(publishedAt),
  };
};

const extractDateText = $scope =>
  normalizeText(
    $scope
      .find(
        '.inner-tag span:nth-child(2), .date, .time, time, .post-date, .inner-date, .entry-date',
      )
      .first()
      .text(),
  );

const extractTagText = $scope =>
  normalizeText(
    $scope
      .find('.inner-tag span:nth-child(1), .category, .post-category, .inner-category')
      .first()
      .text(),
  ) || 'Tin tức';

export const fetchHtml = async url => {
  const response = await fetch(url, {headers: REQUEST_HEADERS});
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with ${response.status}`);
  }
  return response.text();
};

export const extractNewsList = async () => {
  const html = await fetchHtml(BLOG_URL);
  const $ = cheerio.load(html);

  const selectors = [
    '.inner-news-item',
    '.blog-item',
    '.post-item',
    '.item-blog',
    '.news-item',
    'article',
  ];

  let items = null;
  for (const selector of selectors) {
    const found = $(selector);
    if (found.length > 0) {
      items = found;
      break;
    }
  }

  const news = [];

  items?.each((index, element) => {
    if (index >= 12) return;

    const $item = $(element);
    const title = normalizeText(
      $item.find('.inner-title, h1, h2, h3, .title, .entry-title').first().text(),
    );
    const link = toAbsoluteUrl($item.find('a').first().attr('href'));
    const image = toAbsoluteUrl(
      $item.find('img').first().attr('src') || $item.find('img').first().attr('data-src'),
    );
    const desc = normalizeText(
      $item.find('.excerpt, .entry-content, p, .description, .inner-desc').first().text(),
    );
    const tag = extractTagText($item);
    const dateParts = parseDateParts(extractDateText($item));

    if (!title || !link) return;

    news.push({
      id: `web-${index}-${Buffer.from(link).toString('base64').slice(0, 8)}`,
      title,
      date: dateParts.date,
      publishedAt: dateParts.publishedAt,
      tag,
      img: image || FALLBACK_IMAGE,
      url: link,
      desc: (desc || title).slice(0, 180),
      views: Math.floor(Math.random() * 500) + 100,
      sortValue: dateParts.sortValue || Math.max(1, 9999 - index),
    });
  });

  return news
    .sort((a, b) => b.sortValue - a.sortValue)
    .map(({sortValue, ...item}) => item);
};

export const extractArticleDetail = async articleUrl => {
  const safeUrl = toAbsoluteUrl(articleUrl);
  const parsed = new URL(safeUrl);

  if (parsed.hostname !== new URL(SITE_ORIGIN).hostname) {
    throw new Error('Article URL is outside the allowed domain.');
  }

  const html = await fetchHtml(safeUrl);
  const $ = cheerio.load(html);
  const articleRoot =
    $('.section-44 .inner-main').first().length > 0
      ? $('.section-44 .inner-main').first()
      : $('.page-content').first().length > 0
        ? $('.page-content').first()
        : $('.post-content, .entry-content, .article-content').first().length > 0
          ? $('.post-content, .entry-content, .article-content').first()
          : $('article').first();

  articleRoot
    .find(
      'script, style, noscript, iframe[src*="facebook"], form, .fb-comments, .fb-comments-count, .comment-list, .box-comment',
    )
    .remove();

  articleRoot.find('[src]').each((_, element) => {
    const current = $(element).attr('src');
    $(element).attr('src', toAbsoluteUrl(current));
  });

  articleRoot.find('[href]').each((_, element) => {
    const current = $(element).attr('href');
    $(element).attr('href', toAbsoluteUrl(current));
  });

  const title =
    normalizeText(
      $('.section-42 .inner-title, .page-intro__title, .post-title, .entry-title, h1')
        .first()
        .text(),
    ) || 'Chi tiết tin tức';

  let ldJsonDate = '';
  $('script[type="application/ld+json"]').each((_, element) => {
    if (ldJsonDate) return;

    const raw = $(element).html() || '';
    if (!raw.includes('NewsArticle')) return;

    try {
      const parsedJson = JSON.parse(raw);
      if (parsedJson['@type'] === 'NewsArticle' && parsedJson.datePublished) {
        ldJsonDate = parsedJson.datePublished;
      }
    } catch {
      // Ignore malformed JSON-LD blocks from the page.
    }
  });

  const dateParts = parseDateParts(
    ldJsonDate ||
      normalizeText(
        $('.section-42 .inner-tag span:nth-child(2), .inner-tag span:nth-child(2), .date, .time, time, .post-date, .inner-date')
          .first()
          .text(),
      ),
  );

  const tag =
    normalizeText($('.section-42 .inner-tag span:nth-child(1)').first().text()) ||
    extractTagText($('body'));
  const desc =
    normalizeText(
      $('meta[name="description"]').attr('content') ||
        articleRoot.find('p').first().text(),
    ) || title;

  const image = toAbsoluteUrl(
    $('meta[property="og:image"]').attr('content') ||
      articleRoot.find('img').first().attr('src'),
  );

  return {
    title,
    date: dateParts.date,
    publishedAt: dateParts.publishedAt,
    tag,
    img: image || FALLBACK_IMAGE,
    url: safeUrl,
    desc,
    html: articleRoot.html() || '<p>Nội dung bài viết đang được cập nhật.</p>',
  };
};
