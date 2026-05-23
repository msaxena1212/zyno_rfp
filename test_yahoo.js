const cheerio = require('cheerio');

async function testYahoo() {
    try {
        const query = 'solar panels manufacturers india';
        const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const results = [];
        $('.algo').each((i, el) => {
            const title = $(el).find('h3.title a').text().trim();
            const snippet = $(el).find('.compTitle + div').text().trim() || $(el).find('.fz-ms').text().trim();
            const link = $(el).find('h3.title a').attr('href') || '';
            if (title) results.push({title, snippet, link});
        });
        
        console.log("Yahoo Results:", results.length);
        if (results.length > 0) {
            console.log(results.slice(0, 3));
        } else {
            console.log(html.substring(0, 200));
        }
    } catch(e) {
        console.error(e);
    }
}

testYahoo();
