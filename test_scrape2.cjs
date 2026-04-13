const cheerio = require('cheerio');
const https = require('https');

https.get('https://hoangmaistarschool.edu.vn/blog', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    $('.inner-news-item').each((i, el) => {
      const $el = $(el);
      const title = $el.find('h3, h4, .title, a').text().trim().replace(/\s+/g, ' ');
      const link = $el.find('a').attr('href');
      const img = $el.find('img').attr('src');
      console.log(`Item ${i}: ${title} | ${link} | ${img}`);
    });
  });
}).on('error', console.error);
