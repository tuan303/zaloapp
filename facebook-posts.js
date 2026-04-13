const FACEBOOK_GRAPH_BASE_URL = 'https://graph.facebook.com/v22.0';
const DEFAULT_PAGE_PATH = 'ngoisaohoangmai';

const formatVietnamDate = value => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return '';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(parsed));
};

const truncateText = (value, limit) => {
  if (!value) {
    return '';
  }

  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trimEnd()}…`;
};

const extractImageFromAttachments = attachments => {
  const data = attachments?.data;
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  for (const attachment of data) {
    if (attachment?.media?.image?.src) {
      return attachment.media.image.src;
    }

    const subattachments = attachment?.subattachments?.data;
    if (Array.isArray(subattachments)) {
      for (const subattachment of subattachments) {
        if (subattachment?.media?.image?.src) {
          return subattachment.media.image.src;
        }
      }
    }
  }

  return '';
};

export async function fetchFacebookPosts(options = {}) {
  const accessToken =
    options.accessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = options.pageId || process.env.FACEBOOK_PAGE_ID || DEFAULT_PAGE_PATH;
  const pagePath = options.pagePath || process.env.FACEBOOK_PAGE_PATH || DEFAULT_PAGE_PATH;
  const limit = options.limit || 5;

  if (!accessToken) {
    const error = new Error('Missing Facebook Page access token.');
    error.code = 'MISSING_FACEBOOK_TOKEN';
    throw error;
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    fields:
      'id,message,story,created_time,permalink_url,full_picture,attachments{media,image,subattachments}',
    limit: String(limit),
  });

  const response = await fetch(`${FACEBOOK_GRAPH_BASE_URL}/${pageId}/posts?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || payload.error) {
    const error = new Error(payload?.error?.message || 'Unable to fetch Facebook posts.');
    error.code = payload?.error?.code;
    error.subcode = payload?.error?.error_subcode;
    throw error;
  }

  const posts = Array.isArray(payload.data) ? payload.data : [];

  return posts
    .filter(post => post?.message || post?.story || post?.attachments?.data?.length)
    .slice(0, limit)
    .map(post => {
      const content = post.message || post.story || 'Bài viết mới từ Fanpage Ngôi Sao Hoàng Mai';
      const image = post.full_picture || extractImageFromAttachments(post.attachments);

      return {
        id: post.id,
        title: truncateText(content.replace(/\s+/g, ' ').trim(), 110),
        date: formatVietnamDate(post.created_time),
        publishedAt: post.created_time,
        tag: 'Fanpage',
        img: image,
        url: post.permalink_url || `https://www.facebook.com/${pagePath}/posts/${post.id.split('_')[1] || ''}`,
        desc: truncateText(content.replace(/\s+/g, ' ').trim(), 220),
        views: 0,
      };
    });
}
