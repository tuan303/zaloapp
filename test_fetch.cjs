const https = require('https');
https.get('https://hoangmaistarschool.edu.vn/blog', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data.substring(0, 500)));
}).on('error', console.error);
