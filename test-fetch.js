const data = {
    nombre: "Test User From Backend",
    email: "test_new_email999@dimensionexpert.com",
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
};

fetch('http://localhost:3000/api/diagnosis/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
