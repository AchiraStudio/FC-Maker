import https from 'https';
https.get('https://www.transfermarkt.com/indonesia/kader/nationalmannschaft/13958/saison_id/2026/plus/1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Location:', res.headers.location);
}).on('error', (e) => {
  console.error(e);
});
