const instances = [
    'https://search.rhscz.eu',
    'https://searx.tiekoetter.com',
    'https://search.privacyredirect.com',
    'https://search.hbubli.cc',
    'https://searx.oloke.xyz',
    'https://searxng.site',
    'https://search.bladerunn.in',
    'https://searxng.website',
    'https://etsi.me',
    'https://searx.mbuf.net',
    'https://searx.ro'
];

async function testSearXNG() {
    const query = 'solar panels company pvt ltd india';
    
    for (const instance of instances) {
        console.log(`Testing instance: ${instance}...`);
        try {
            const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            console.log(`Status for ${instance}:`, res.status);
            if (res.ok) {
                const data = await res.json();
                console.log(`Results length for ${instance}:`, data.results ? data.results.length : 'no results property');
                if (data.results && data.results.length > 0) {
                    console.log('Sample result:', data.results[0].title, '-', data.results[0].url);
                }
            } else {
                console.log(`Failed with status: ${res.status}`);
            }
        } catch (e) {
            console.error(`Error for ${instance}:`, e.message);
        }
    }
}

testSearXNG();
