const http = require('http');
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    console.log('\n--- ERROR RECEIVED FROM APP ---');
    console.log(body);
    console.log('-------------------------------\n');
    res.end('ok');
  });
});
server.listen(9999, () => console.log('Listening on 9999...'));
