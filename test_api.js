const fetch = require('node-fetch');
(async () => {
  const res = await fetch('http://localhost:3001/api/ai-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'search', payload: { item: 'example company' } })
  });
  const data = await res.json();
  console.log('Response:', data);
})();
