const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) env[k.trim()] = v.trim().replace(/^['"]|['"]$/g, '');
    });
}

const API_KEY = env.VOLKERN_API_KEY;
const BASE_URL = env.VOLKERN_BASE_URL || 'https://volkern.app/api';

function request(method, path, body) {
    return new Promise((resolve) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            method,
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' }
        };
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, data }); }
            });
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log('--- FINAL VERIFICATION v2.2 ---');

    // 1. Lead
    const leadRes = await request('POST', '/leads', { nombre: "Test v2.2", email: "test22@volkern.com" });
    const leadId = leadRes.data.lead?.id || leadRes.data.id;
    console.log(`Step 1 (Lead): ${leadRes.status} - ID: ${leadId}`);

    if (leadId) {
        // 2. Interaction 1
        const int1 = await request('POST', `/leads/${leadId}/interactions`, { tipo: 'nota', contenido: 'Diag Exec', resultado: 'positivo' });
        console.log(`Step 2 (Int 1): ${int1.status}`);

        // 3. Interaction 2
        const int2 = await request('POST', `/leads/${leadId}/interactions`, { tipo: 'nota', contenido: 'Action Plan', resultado: 'positivo' });
        console.log(`Step 3 (Int 2): ${int2.status}`);

        // 4. Task
        const taskRes = await request('POST', `/leads/${leadId}/tasks`, { tipo: 'llamada', titulo: 'Test Call', fechaVencimiento: new Date(Date.now() + 86400).toISOString() });
        console.log(`Step 4 (Task): ${taskRes.status}`);
    }
}

run();
