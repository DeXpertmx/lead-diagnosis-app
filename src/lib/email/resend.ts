import { Resend } from 'resend';

// Lazy initialization
let resend: Resend | null = null;
const getResend = () => {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error('[Resend] API Key missing');
            return null;
        }
        resend = new Resend(apiKey);
    }
    return resend;
};

export interface EmailTemplateData {
    nombre: string;
    dolorPrincipal: string;
    procesoActual: string;
    objetivoNegocio: string;
    planesIA: string;
    linkAgenda: string;
}

/**
 * Send the personalized diagnosis email to the client using Resend
 * Now with a high-impact Senior Consultant visual template.
 */
export async function sendPostDiagnosisEmail(to: string, data: EmailTemplateData) {
    const client = getResend();
    if (!client) throw new Error('Resend client not initialized');

    // Convert Markdown segments to basic HTML for the email
    const planesHtml = data.planesIA
        .replace(/\n/g, '<br/>')
        .replace(/### (.*)/g, '<h3 style="color: #2563eb; margin-top: 20px;">$1</h3>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');

    return client.emails.send({
        from: 'Volkern AI <diagnostico@dimensionexpert.com>',
        to: [to],
        subject: `Hoja de Ruta Estratégica: Transformación para ${data.nombre}`,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <div style="background-color: #111827; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ANÁLISIS DE TRANSFORMACIÓN IA</h1>
                    <p style="color: #9ca3af; margin-top: 10px;">Volkern Business Diagnosis Engine</p>
                </div>
                
                <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p>Hola <strong>${data.nombre}</strong>,</p>
                    
                    <p>He completado el análisis de tu situación operativa. Basado en la información compartida, hemos identificado una oportunidad crítica para reducir el <strong>"impuesto a la ineficiencia"</strong> que hoy frenan tus objetivos de <strong>${data.objetivoNegocio}</strong>.</p>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #2563eb; margin: 25px 0;">
                        <h2 style="font-size: 16px; margin-top: 0; color: #111827;">DIAGNÓSTICO TÉCNICO</h2>
                        <ul style="padding-left: 20px; margin-bottom: 0;">
                            <li><strong>Desafío Crítico:</strong> ${data.dolorPrincipal}</li>
                            <li><strong>Situación Actual:</strong> ${data.procesoActual}</li>
                            <li><strong>Visión:</strong> Escalamiento mediante arquitectura de automatización.</li>
                        </ul>
                    </div>

                    <h2 style="font-size: 20px; color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-top: 40px;">TU HOJA DE RUTA ESTRATÉGICA</h2>
                    <div style="margin-top: 20px;">
                        ${planesHtml}
                    </div>

                    <div style="text-align: center; margin: 45px 0;">
                        <p style="margin-bottom: 25px; font-weight: 500;">El siguiente paso es validar la viabilidad técnica de esta hoja de ruta.</p>
                        <a href="${data.linkAgenda}" style="background-color: #2563eb; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">AGENDAR SESIÓN ESTRATÉGICA (20 MIN)</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">
                        Este análisis ha sido generado mediante inteligencia de negocios para asistir en la toma de decisiones estratégicas.<br/>
                        © 2026 Dimension Expert | Volkern AI
                    </p>
                </div>
            </div>
        `
    });
}

export interface InternalNotificationData {
    nombre: string;
    empresa: string;
    prioridad: string;
    dolorPrincipal: string;
    leadId: string;
}

/**
 * Send an internal alert to the consultant
 */
export async function sendInternalNotificationEmail(data: InternalNotificationData) {
    const client = getResend();
    if (!client) return;

    const volkernLeadUrl = `https://volkern.app/leads/${data.leadId}`;

    return client.emails.send({
        from: 'Volkern Alerts <alertas@dimensionexpert.com>',
        to: [process.env.CONSULTANT_EMAIL || 'hvcab@hotmail.com'],
        subject: `🚀 NUEVO LEAD CALIFICADO: ${data.empresa} (${data.prioridad}/10)`,
        html: `
            <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                <h2>Nuevo Lead desde Diagnóstico IA</h2>
                <p>Se ha registrado un nuevo lead con alta intención operativa.</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.nombre}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Empresa:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.empresa}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Dolor Principal:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.dolorPrincipal}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Prioridad:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.prioridad}/10</td>
                    </tr>
                </table>
                <div style="margin-top: 25px;">
                    <a href="${volkernLeadUrl}" style="background-color: #111827; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">📂 VER LEAD EN VOLKERN</a>
                </div>
            </div>
        `
    });
}

export interface ProposalEmailData {
    nombre: string;
    empresa: string;
    mode: 'conservative' | 'aggressive';
    proposalPreview: string;
}

/**
 * Send the commercial proposal email
 */
export async function sendProposalEmail(to: string, data: ProposalEmailData) {
    const client = getResend();
    if (!client) throw new Error('Resend client not initialized');

    const subject = data.mode === 'aggressive'
        ? `Propuesta de Alto Impacto: Transformación con IA para ${data.empresa}`
        : `Propuesta de Eficiencia: Optimización para ${data.empresa}`;

    return client.emails.send({
        from: 'Volkern AI <diagnostico@dimensionexpert.com>',
        to: [to],
        subject: subject,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <div style="background-color: #2563eb; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">PROPUESTA COMERCIAL</h1>
                    <p style="color: #bfdbfe; margin-top: 10px;">Volkern Strategy & Automation</p>
                </div>
                
                <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p>Hola <strong>${data.nombre}</strong>,</p>
                    
                    <p>Adjunto a este correo encontrarás la propuesta detallada para la transformación operativa de <strong>${data.empresa}</strong> que discutimos.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #bae6fd;">
                        <p style="margin: 0; font-weight: 500; color: #0369a1;">${data.proposalPreview}</p>
                    </div>

                    <p>Esta propuesta ha sido diseñada para maximizar el retorno de inversión mediante la implementación estratégica de IA en sus procesos críticos.</p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/propuestas/view?email=${encodeURIComponent(to)}" style="background-color: #111827; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">REVISAR PROPUESTA COMPLETA</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">
                        Si tienes alguna duda técnica o comercial, responde directamente a este email.<br/>
                        © 2026 Dimension Expert | Volkern AI
                    </p>
                </div>
            </div>
        `
    });
}

/**
 * Generic email sender
 */
export async function sendEmail({ to, subject, html, from }: { to: string | string[], subject: string, html: string, from?: string }) {
    const client = getResend();
    if (!client) throw new Error('Resend client not initialized');

    return client.emails.send({
        from: from || 'Volkern AI <diagnostico@dimensionexpert.com>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html
    });
}
