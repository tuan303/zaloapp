const cheerio = require('cheerio');
const https = require('https');

https.get('https://hoangmaistarschool.edu.vn/blog', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    console.log("Title:", $('title').text());
    
    // Find all potential article containers
    const classes = new Set();
    $('div, article, section').each((i, el) => {
      const cls = $(el).attr('class');
      if (cls && (cls.includes('post') || cls.includes('blog') || cls.includes('item') || cls.includes('news'))) {
        classes.add(cls);
      }
    });
    console.log("Potential classes:", Array.from(classes).slice(0, 10));
    
    // Let's just look for h2 or h3 with links
    $('h2 a, h3 a').each((i, el) => {
      console.log("Found link:", $(el).text().trim(), $(el).attr('href'));
    });
  });
}).on('error', console.error);
