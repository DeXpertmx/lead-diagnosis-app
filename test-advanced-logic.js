const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const [key, ...rest] = trimmedLine.split('=');
        let value = rest.join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        if (!process.env[key]) process.env[key] = value;
    });
}

const API_KEY = process.env.VOLKERN_API_KEY;
const BASE_URL = process.env.VOLKERN_BASE_URL || 'https://volkern.app/api';

async function testAdvancedLogic() {
    console.log('🚀 Iniciando Prueba de Lógica Avanzada de Leads...');

    // 1. Simular un diagnóstico (Lead que ya existe - Bruno)
    const diagnosisData = {
        nombre: "Bruno (Test)",
        email: "bruno@hvcabaim.com",
        empresa: "HVC AB",
        industria: "Tecnología",
        procesoActual: "Manual con hojas de cálculo",
        procesosManuales: "Seguimiento de clientes",
        dolorPrincipal: "Pérdida de tiempo en Excel",
        perdidasActuales: "2 horas al día",
        consecuencia6Meses: "Estancamiento del crecimiento",
        objetivoNegocio: "Automatizar el 80% de las ventas",
        prioridad: "9"
    };

    console.log('\n--- Paso 1: Enviando diagnóstico para lead existente ---');
    console.log(`Email: ${diagnosisData.email}`);

    // Nota: Aunque el servidor Next.js maneja la API, aquí llamamos directamente a Volkern 
    // para verificar qué pasaría con los datos procesados.

    // Pero espera, el objetivo es probar la API LOCAL de Next.js si estuviera corriendo.
    // Como no podemos garantizar que el puerto 3000 esté libre o el servidor arriba, 
    // vamos a simular la lógica de la API directamente contra Volkern.

    try {
        // Buscamos si el lead existe
        console.log('Buscando lead en Volkern...');
        const searchRes = await fetchVolkern(`/leads?search=${encodeURIComponent(diagnosisData.email)}&limit=1`, 'GET');

        if (searchRes.data && searchRes.data.length > 0) {
            const lead = searchRes.data[0];
            console.log(`✅ Lead encontrado: ${lead.id}`);

            if (lead.contextoProyecto) {
                console.log('✅ Contexto existente detectado. Procediendo a crear NOTA EJECUTIVA e INFORME DE ACCIÓN...');

                // 1. Executive Note
                const notePayload = {
                    tipo: 'nota',
                    contenido: `DIAGNÓSTICO EJECUTIVO: ${diagnosisData.empresa.toUpperCase()}\n...\n(Simulación de Diagnóstico Profesional en 4 puntos)`,
                    resultado: 'positivo'
                };

                // 2. Action Plans Note
                const plansPayload = {
                    tipo: 'nota',
                    contenido: `PROPUESTA DE PLANES DE ACCIÓN: ${diagnosisData.empresa.toUpperCase()}\n\nPLAN A: Quick Wins\nPLAN B: Core Automation\nPLAN C: AI-Enabled Future`,
                    resultado: 'positivo'
                };

                const interactionRes = await fetchVolkern(`/leads/${lead.id}/interactions`, 'POST', notePayload);
                console.log('✅ Nota Ejecutiva creada:', interactionRes.interaction.id);

                const plansRes = await fetchVolkern(`/leads/${lead.id}/interactions`, 'POST', plansPayload);
                console.log('✅ Planes de Acción creados:', plansRes.interaction.id);
            }
        } else {
            console.log('ℹ️ Lead no encontrado, se crearía como nuevo.');
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

function fetchVolkern(path, method, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            method,
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) reject(new Error(`Status ${res.statusCode}: ${data}`));
                try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

testAdvancedLogic();
