import { NextRequest, NextResponse } from 'next/server';
import {
    DiagnosisState,
    generateExecutiveDiagnosis,
    generateContextoProyecto,
    generateConsultantExecutiveSummary,
    generateStrategicSessionScript,
    generateClosingChecklist,
    generateCommercialProposal
} from '@/lib/diagnosis/orchestrator';
import { registerLead, registerLeadInteraction } from '@/lib/volkern/leads';
import { sendPostDiagnosisEmail, sendInternalNotificationEmail } from '@/lib/email/resend';

const N8N_RELAY_URL = 'https://n8n.dimension.expert/webhook/volkern-diagnostico-relay-v1';

export async function POST(req: NextRequest) {
    try {
        const state: DiagnosisState = await req.json();

        if (!state.email || !state.nombre) {
            return NextResponse.json({ error: 'Faltan datos requeridos (email, nombre)' }, { status: 400 });
        }

        console.log(`[Diagnosis] Finalizing for ${state.email}...`);

        // 1. CRM Lead Registration (Senior Version)
        const lead = await registerLead({
            nombre: state.nombre,
            email: state.email,
            telefono: state.telefono,
            empresa: state.empresa,
            contextoProyecto: generateContextoProyecto(state),
            canal: 'web',
            estado: 'nuevo'
        });

        const leadId = lead.id;
        console.log(`[Volkern] Lead registered/updated: ${leadId}`);

        // 2. Generate Senior Narrative Assets
        const executiveDiagnosis = generateExecutiveDiagnosis(state);
        const formalProposal = generateCommercialProposal(state, { mode: 'aggressive' });
        const script = generateStrategicSessionScript(state);
        const briefing = generateConsultantExecutiveSummary(state);
        const checklist = generateClosingChecklist(state);

        // 3. Register Assets as CRM Internal Notes (Sequential)
        console.log('[Volkern] Registering analytical assets...');
        const assets = [
            { tipo: 'Plan de Automatización ABC', contenido: executiveDiagnosis },
            { tipo: 'Propuesta Técnica Senior', contenido: formalProposal },
            { tipo: 'Guion de Sesión Estratégica', contenido: script },
            { tipo: 'Briefing para Consultor', contenido: briefing },
            { tipo: 'Checklist de Cierre', contenido: checklist }
        ];

        for (const asset of assets) {
            await registerLeadInteraction(leadId, {
                tipo: 'nota',
                contenido: `[${asset.tipo}]\n\n${asset.contenido}`
            });
        }

        // 4. Email Delivery via Resend (Unified approach)
        let emailSent = false;
        try {
            console.log('[Resend] Sending diagnosis email...');

            await sendPostDiagnosisEmail(state.email, {
                nombre: state.nombre,
                dolorPrincipal: state.dolorPrincipal || 'No especificado',
                procesoActual: state.procesoActual || 'No especificado',
                objetivoNegocio: state.objetivoNegocio || 'No especificado',
                planesIA: executiveDiagnosis,
                linkAgenda: process.env.LINK_AGENDA || 'https://calendly.com/dimensionexpert/sesion-estrategica'
            });

            // Send internal notification alert
            await sendInternalNotificationEmail({
                nombre: state.nombre,
                empresa: state.empresa || 'N/A',
                prioridad: state.prioridad?.toString() || '5',
                dolorPrincipal: state.dolorPrincipal || 'No especificado',
                leadId: leadId
            });

            emailSent = true;
            console.log('[Resend] Emails sent successfully');
        } catch (emailError) {
            console.error('[Resend] Error sending emails:', emailError);
        }

        return NextResponse.json({
            success: true,
            leadId,
            emailSent,
            message: 'Diagnóstico completado y registrado correctamente.'
        });

    } catch (error) {
        console.error('[Diagnosis Error]', error);
        return NextResponse.json({
            error: 'Error al procesar el diagnóstico',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
