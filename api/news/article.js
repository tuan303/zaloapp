import {extractArticleDetail} from '../../news-scraper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = typeof req.query.url === 'string' ? req.query.url : '';
  if (!url) {
    return res.status(400).json({message: 'Missing article URL.'});
  }

  try {
    const article = await extractArticleDetail(url);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article detail:', error);
    return res.status(502).json({message: 'Unable to fetch article detail right now.'});
  }
}
