const https = require('https');
const fs = require('fs');

// Basic env parser
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const API_KEY = env.VOLKERN_API_KEY;
const BASE_URL = env.VOLKERN_BASE_URL || 'https://volkern.app/api';

async function debugInteractions() {
    console.log('🔍 Probando endpoint de Interacciones en Volkern...');

    // 1. Obtener un lead de prueba o crear uno
    const leadPayload = {
        nombre: "Debug Interactions Lead",
        email: "debug-int-" + Date.now() + "@test.com",
        canal: "web"
    };

    try {
        console.log('--- Pasos: ---');
        console.log('1. Creando/Buscando Lead...');
        const leadRes = await request('POST', '/leads', leadPayload);
        const leadId = leadRes.lead?.id || leadRes.id;
        console.log(`✅ Lead ID: ${leadId}`);

        console.log('\n2. Intentando registrar interacción (POST /leads/{id}/interactions)...');
        try {
            const intPayload = {
                tipo: 'nota',
                contenido: 'Prueba de nota interna desde script de debug',
                resultado: 'neutral'
            };
            const intRes = await request('POST', `/leads/${leadId}/interactions`, intPayload);
            console.log('✅ Interacción registrada exitosamente:', JSON.stringify(intRes, null, 2));
        } catch (e) {
            console.error('❌ Error al registrar interacción:', e.message);

            console.log('\n3. Intentando fallback: POST /leads/{id}/notes...');
            try {
                const noteRes = await request('POST', `/leads/${leadId}/notes`, { contenido: 'Prueba de nota vía /notes' });
                console.log('✅ Nota registrada vía /notes:', JSON.stringify(noteRes, null, 2));
            } catch (e2) {
                console.error('❌ Error en /notes:', e2.message);

                console.log('\n4. Intentando fallback: POST /interactions (general)...');
                try {
                    const genIntRes = await request('POST', '/interactions', { leadId, tipo: 'nota', contenido: 'Prueba general' });
                    console.log('✅ Interacción registrada vía /interactions general:', JSON.stringify(genIntRes, null, 2));
                } catch (e3) {
                    console.error('❌ Error fatal: Todos los endpoints de notas/interacciones fallaron.');
                }
            }
        }

    } catch (error) {
        console.error('❌ Error general en debug:', error.message);
    }
}

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            method,
            hostname: url.hostname,
            path: url.pathname,
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

debugInteractions();
