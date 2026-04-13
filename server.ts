import express from 'express';
import {createServer as createViteServer} from 'vite';
import path from 'path';
import {fileURLToPath} from 'url';
import {fetchFacebookPosts} from './facebook-posts.js';
import {extractArticleDetail, extractNewsList} from './news-scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.get('/api/news', async (_req, res) => {
    try {
      const news = await extractNewsList();
      res.setHeader('Cache-Control', 'no-store');
      return res.json(news);
    } catch (error) {
      console.error('Error fetching news from school website:', error);
      return res.status(502).json({message: 'Unable to fetch news right now.'});
    }
  });

  app.get('/api/news/article', async (req, res) => {
    const url = typeof req.query.url === 'string' ? req.query.url : '';
    if (!url) {
      return res.status(400).json({message: 'Missing article URL.'});
    }

    try {
      const article = await extractArticleDetail(url);
      res.setHeader('Cache-Control', 'no-store');
      return res.json(article);
    } catch (error) {
      console.error('Error fetching article detail:', error);
      return res.status(502).json({message: 'Unable to fetch article detail right now.'});
    }
  });

  app.get('/api/facebook-posts', async (_req, res) => {
    try {
      const posts = await fetchFacebookPosts();
      res.setHeader('Cache-Control', 'no-store');
      return res.json(posts);
    } catch (error) {
      console.error('Error fetching Facebook posts:', error);
      return res.status(502).json({message: 'Unable to fetch Facebook posts right now.'});
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
