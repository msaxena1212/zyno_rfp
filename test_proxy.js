const cheerio = require('cheerio');

async function testDDG() {
    try {
        const query = 'solar panels manufacturers india';
        const ddgUrl = encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
        const proxyUrl = `https://api.allorigins.win/get?url=${ddgUrl}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const html = data.contents;
        const $ = cheerio.load(html);
        
        const results = [];
        $('.result').each((i, el) => {
            const title = $(el).find('.result__title').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            const link = $(el).find('.result__url').text().trim();
            if (title) results.push({title, snippet, link});
        });
        
        console.log("Proxy Results:", results.length);
        if (results.length > 0) {
            console.log(results.slice(0, 2));
        } else {
            console.log(html.substring(0, 200));
        }
    } catch(e) {
        console.error(e);
    }
}

testDDG();
