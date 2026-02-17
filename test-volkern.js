const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually load .env.local if available
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    console.log('Raw file length:', envConfig.length);

    envConfig.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const separatorIndex = trimmedLine.indexOf('=');
        if (separatorIndex > 0) {
            const key = trimmedLine.substring(0, separatorIndex).trim();
            let value = trimmedLine.substring(separatorIndex + 1).trim();

            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }

            console.log(`Found key in file: ${key}`);
            if (!process.env[key]) process.env[key] = value;
        }
    });
    console.log('Loaded .env.local');
} else {
    console.log('No .env.local found');
}

// Configuration
const API_KEY = process.env.VOLKERN_API_KEY;
const BASE_URL = process.env.VOLKERN_BASE_URL || 'https://volkern.app/api';

if (!API_KEY) {
    console.error('ERROR: VOLKERN_API_KEY environment variable is not set.');
    console.error('Please ensure .env.local exists and contains VOLKERN_API_KEY');
    process.exit(1);
}

console.log('--- Testing Volkern API Connection ---');
console.log(`URL: ${BASE_URL}`);
console.log(`Key: ${API_KEY.substring(0, 5)}...`);

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            method,
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json',
            },
        };

        console.log(`\n[${method}] ${url.toString()}`);
        if (body) console.log('Body:', JSON.stringify(body, null, 2));

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log('Response:', data);

                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request Error:', e);
            reject(e);
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    try {
        // 1. First, try to LIST leads to verify auth and endpoint
        console.log('\n1. Testing GET /leads (List leads)...');
        try {
            await request('GET', '/leads?limit=1');
        } catch (e) {
            console.log("GET /leads failed, proceeding...");
        }

        // 2. Try to CREATE a test lead (using EXISTING email to test upsert/404)
        console.log('\n2. Testing POST /leads (Create lead with EXISTING email)...');
        const testLead = {
            nombre: "Test User Upsert",
            email: "bruno@hvcavbaim.com", // Keeping the email that caused 404
            empresa: "Test Corp",
            canal: "web",
            estado: "nuevo",
            etiquetas: ["test-api-upsert"],
            contextoProyecto: "Test de upsert/conflicto"
        };
        const leadResult = await request('POST', '/leads', testLead);

        if (leadResult.status === 200 || leadResult.status === 201) {
            console.log("✅ Lead created/updated successfully!");
            // Extract from nested structure
            const leadId = leadResult.data.lead?.id || leadResult.data.id;

            // 3. Try to register interactions
            if (leadId) {
                console.log(`\nUsing Lead ID: ${leadId}`);

                console.log('\n3a. Testing Interaction: Executive Diagnosis...');
                const res1 = await request('POST', `/leads/${leadId}/interactions`, {
                    tipo: 'nota',
                    contenido: 'TEST: Diagnóstico Ejecutivo en nota separada',
                    resultado: 'positivo'
                });
                if (res1.status === 200 || res1.status === 201) console.log('✅ Interaction 3a OK');

                console.log('\n3b. Testing Interaction: Action Plan...');
                const res2 = await request('POST', `/leads/${leadId}/interactions`, {
                    tipo: 'nota',
                    contenido: 'TEST: Plan de Acción en nota separada',
                    resultado: 'positivo'
                });
                if (res2.status === 200 || res2.status === 201) console.log('✅ Interaction 3b OK');

                console.log('\n4. Testing POST /tasks (Create task)...');
                const taskPayload = {
                    leadId: leadId,
                    tipo: 'llamada',
                    titulo: 'Test Task Call Reminder 24h',
                    descripcion: 'Test task description for call reminder',
                    fechaVencimiento: new Date(Date.now() + 86400000).toISOString()
                };
                const res3 = await request('POST', `/tasks`, taskPayload);
                if (res3.status === 200 || res3.status === 201) console.log('✅ Task 4 OK');
            }
        } else {
            console.error("❌ Lead creation failed.");
        }

    } catch (error) {
        console.error('Test Suite Error:', error);
    }
}

runTests();
