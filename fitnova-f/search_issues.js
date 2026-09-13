const https = require('https');

https.get('https://api.github.com/search/issues?q="Couldn%27t+find+a+navigation+context"+repo:react-navigation/react-navigation', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const issues = JSON.parse(data).items.slice(0, 3);
      issues.forEach(i => console.log(`- ${i.title} (${i.state}): ${i.html_url}\n  ${i.body.substring(0, 200)}...\n`));
    } catch (e) { console.error(e); }
  });
}).on('error', console.error);
