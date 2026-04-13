import {fetchFacebookPosts} from '../facebook-posts.js';

export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (_req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const posts = await fetchFacebookPosts();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    return res.status(502).json({message: 'Unable to fetch Facebook posts right now.'});
  }
}
