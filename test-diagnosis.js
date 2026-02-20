const http = require('http');

const data = JSON.stringify({
    nombre: "Test User",
    email: "test_new_email123@dimensionexpert.com",
    telefono: "5551234567",
    empresa: "Test Corp",
    industria: "Tecnología",
    procesoActual: "Manual excel",
    procesosManuales: "Muchos",
    dolorPrincipal: "Pérdida de tiempo",
    perdidasActuales: "1000 USD",
    consecuencia6Meses: "Quiebra",
    objetivoNegocio: "Automatizar todo",
    prioridad: "10"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/diagnosis/complete',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
