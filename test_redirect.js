fetch('https://www.transfermarkt.com/indonesia/kader/verein/13958/saison_id/2026/plus/1', { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => console.log('Status:', r.status, 'Location:', r.headers.get('location')))
  .catch(console.error);
