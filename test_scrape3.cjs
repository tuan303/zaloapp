const cheerio = require('cheerio');
const https = require('https');

https.get('https://hoangmaistarschool.edu.vn/blog', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const firstItem = $('.inner-news-item').eq(2).html();
    console.log(firstItem);
  });
}).on('error', console.error);
