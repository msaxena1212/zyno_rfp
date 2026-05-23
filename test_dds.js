const { search } = require('duck-duck-scrape');

async function testDDG() {
    try {
        const results = await search('solar panels company pvt ltd india');
        console.log("Results found:", results.results.length);
        if (results.results.length > 0) {
            console.log(results.results.slice(0, 3));
        }
    } catch(e) {
        console.error(e);
    }
}

testDDG();
