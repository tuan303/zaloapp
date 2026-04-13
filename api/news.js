import {extractNewsList} from '../news-scraper.js';

export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (_req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const news = await extractNewsList();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(news);
  } catch (error) {
    console.error('Error fetching news from school website:', error);
    return res.status(502).json({message: 'Unable to fetch news right now.'});
  }
}
