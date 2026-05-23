const cheerio = require('cheerio');

async function checkHTML() {
    const r = await fetch('https://html.duckduckgo.com/html/', { 
        method: 'POST', 
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://duckduckgo.com',
            'Referer': 'https://duckduckgo.com/'
        },
        body: 'q=solar panels company pvt ltd india' 
    });
    const t = await r.text();
    const $ = cheerio.load(t);
    const result = $('.result').first();
    console.log("Title:", result.find('.result__title').text().trim());
    console.log("URL:", result.find('.result__url').text().trim());
    console.log("Snippet:", result.find('.result__snippet').text().trim());
    console.log("HTML:", result.html());
}

checkHTML();
