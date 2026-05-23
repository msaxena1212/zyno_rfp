const fs = require('fs');

async function findInstances() {
    try {
        const filePath = 'C:\\Users\\mindz\\.gemini\\antigravity-ide\\brain\\ee8fb8e5-df6e-460d-98f6-482cd3ee6a75\\.system_generated\\steps\\139\\content.md';
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // The first few lines are headers, followed by JSON
        const jsonStart = fileContent.indexOf('{"metadata"');
        if (jsonStart === -1) {
            console.log("Could not find start of JSON");
            return;
        }
        
        const jsonStr = fileContent.substring(jsonStart);
        const data = JSON.parse(jsonStr);
        
        const jsonInstances = [];
        for (const [url, info] of Object.entries(data.instances)) {
            // Check if search success percentage is > 80
            const searchSuccess = info.timing && info.timing.search && info.timing.search.success_percentage;
            if (searchSuccess !== undefined && searchSuccess < 80) continue;
            
            // Check if HTML/ressources/link or standard checks are healthy
            if (info.http && info.http.status_code !== 200) continue;
            
            // Let's print out all instances that have relatively low response time or high search success
            jsonInstances.push({
                url,
                searchSuccess,
                timing: info.timing && info.timing.search && info.timing.search.all && info.timing.search.all.median
            });
        }
        
        // Sort by timing (median search response time)
        jsonInstances.sort((a, b) => (a.timing || 999) - (b.timing || 999));
        
        console.log("Top healthy instances:");
        console.log(jsonInstances.slice(0, 15));
    } catch (e) {
        console.error(e);
    }
}

findInstances();
