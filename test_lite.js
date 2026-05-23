const cheerio = require('cheerio');

async function testDDGLite() {
    try {
        const query = 'solar panels manufacturers india';
        const response = await fetch('https://lite.duckduckgo.com/lite/', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://lite.duckduckgo.com',
                'Referer': 'https://lite.duckduckgo.com/'
            },
            body: `q=${encodeURIComponent(query)}`
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const results = [];
        $('.result-snippet').each((i, el) => {
            const tr = $(el).closest('tr').prev('tr');
            const title = tr.find('.result-title').text().trim();
            const link = tr.find('.result-url').text().trim();
            const snippet = $(el).text().trim();
            if (title) results.push({title, snippet, link});
        });
        
        console.log("Lite Results:", results.length);
        if (results.length > 0) {
            console.log(results.slice(0, 2));
        } else {
            console.log(html.substring(0, 200));
        }
    } catch(e) {
        console.error(e);
    }
}

testDDGLite();
