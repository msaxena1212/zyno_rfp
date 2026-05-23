const cheerio = require('cheerio');

async function testDDGWithVQD() {
    try {
        const query = 'solar panels manufacturers india';
        
        // 1. Get VQD Token
        console.log("Getting VQD token...");
        const initResponse = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const initHtml = await initResponse.text();
        const vqdMatch = initHtml.match(/vqd=['"](.*?)['"]/);
        
        if (!vqdMatch) {
            console.log("Failed to get VQD token. DDG might be blocking the initial page load.");
            return;
        }
        const vqd = vqdMatch[1];
        console.log("VQD Token:", vqd);

        // 2. Fetch HTML results using POST and VQD
        const params = new URLSearchParams();
        params.append('q', query);
        params.append('vqd', vqd);

        const response = await fetch('https://html.duckduckgo.com/html/', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://duckduckgo.com',
                'Referer': `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
            },
            body: params.toString()
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        
        const results = [];
        $('.result').each((i, el) => {
            const title = $(el).find('.result__title').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            const link = $(el).find('.result__url').text().trim();
            if (title) results.push({title, snippet, link});
        });
        
        console.log("Results found:", results.length);
        if (results.length > 0) {
            console.log(results.slice(0, 2));
        } else {
            console.log("No results. Blocked again.");
        }
    } catch(e) {
        console.error(e);
    }
}

testDDGWithVQD();
