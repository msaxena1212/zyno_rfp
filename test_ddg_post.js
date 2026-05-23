const cheerio = require('cheerio');

async function testDDG() {
    console.log('Testing DDG HTML POST');
    try {
        const params = new URLSearchParams();
        params.append('q', 'solar panels manufacturers india');
        
        const r = await fetch('https://html.duckduckgo.com/html/', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml',
                'Origin': 'https://duckduckgo.com',
                'Referer': 'https://duckduckgo.com/'
            },
            body: params.toString()
        });
        console.log('Status:', r.status);
        const t = await r.text();
        const $ = cheerio.load(t);
        const results = [];
        $('.result').each((i, el) => {
            const title = $(el).find('.result__title').text().trim();
            const url = $(el).find('.result__url').text().trim();
            if (title) results.push({title, url});
        });
        console.log('Results found:', results.length);
        if (results.length > 0) {
            console.log(results.slice(0, 3));
        } else {
            console.log('Sample HTML:', t.substring(0, 500));
        }
    } catch(e) { console.error(e); }
}

testDDG();
