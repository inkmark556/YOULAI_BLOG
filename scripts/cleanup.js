const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cleanup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log("Connecting to Phantom Server...");

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log("\n[SUCCESS] Cleanup Complete!");
                console.log("--------------------------------");
                console.log(`Deleted Files:   ${result.deleted.length}`);
                console.log(`Space Reclaimed: ${result.spaceReclaimed}`);
                console.log("--------------------------------");
                if (result.deleted.length > 0) {
                    console.log("Details:");
                    result.deleted.forEach(file => console.log(` - ${file}`));
                }
            } else {
                console.error("\n[ERROR] Server returned error:", result.message);
            }
        } catch (e) {
            console.error("\n[ERROR] Failed to parse response:", e.message);
            console.log("Raw response:", data);
        }
    });
});

req.on('error', (error) => {
    console.error("\n[ERROR] Connection failed:", error.message);
    console.error("Make sure the server is running (node server.js)");
});

req.end();
