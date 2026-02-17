import { DiagnosisState } from '../../diagnosis/orchestrator';

export function getDiagnosisEmailHtml(state: DiagnosisState, executiveDiagnosis: string, actionPlans: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://diagnosis.dimension.expert';

    // Format the text for HTML
    const formattedExecutive = executiveDiagnosis.replace(/\n/g, '<br/>');
    const formattedActionPlans = actionPlans.replace(/\n/g, '<br/>');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Diagnóstico de Automatización - Dimension Expert</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .header { background: #0f172a; padding: 40px 20px; text-align: center; }
        .header img { max-width: 200px; height: auto; }
        .content { padding: 40px 30px; }
        h1 { color: #0f172a; font-size: 24px; margin-bottom: 20px; text-align: center; }
        h2 { color: #2563eb; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .diagnosis-box { background: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; font-style: italic; margin-bottom: 20px; }
        .action-plans { white-space: pre-wrap; font-size: 14px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .cta-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center; }
        .cta-box p { margin: 0; font-weight: 600; color: #1e40af; }
        .unsubscribe { margin-top: 20px; display: block; color: #94a3b8; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${appUrl}/images/DeXpert%20Logo.png" alt="Dimension Expert Logo">
        </div>
        <div class="content">
            <h1>Hola, ${state.nombre}</h1>
            <p>Gracias por completar tu diagnóstico de automatización con <strong>Dimension Expert</strong>. Hemos analizado tu situación en <strong>${state.empresa}</strong> y aquí tienes los resultados preliminares.</p>
            
            <div class="cta-box">
                <p>🚀 Un especialista revisará este informe y se pondrá en contacto contigo en las próximas 24 horas.</p>
            </div>

            <h2>Diagnóstico Ejecutivo</h2>
            <div class="diagnosis-box">
                ${formattedExecutive}
            </div>

            <h2>Planes de Acción Propuestos</h2>
            <div class="action-plans">
                ${formattedActionPlans}
            </div>

            <p>Estamos listos para ayudarte a transformar tus procesos operativos con IA y automatización avanzada.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Dimension Expert. Todos los derechos reservados.</p>
            <p>Este correo se envía en cumplimiento con los términos y condiciones aceptados al realizar el diagnóstico. Puedes consultar nuestra política de privacidad en nuestro sitio web.</p>
            <a href="#" class="unsubscribe">Gestionar suscripción / Desuscribirse</a>
        </div>
    </div>
</body>
</html>
    `;
}
