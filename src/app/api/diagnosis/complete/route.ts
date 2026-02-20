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
import { createTask } from '@/lib/volkern/tasks';
import { sendPostDiagnosisEmail, sendInternalNotificationEmail } from '@/lib/email/resend';

import OpenAI from 'openai';

const N8N_RELAY_URL = 'https://n8n.dimension.expert/webhook/volkern-diagnostico-relay-v1';

// Initialize OpenRouter Client (using OpenAI SDK compatibility)
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key-for-build',
});

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
        // The executiveDiagnosis is now strictly the System + User instructions mapping the form variables
        const executiveDiagnosisPrompt = generateExecutiveDiagnosis(state);

        let finalAIExecutiveDiagnosis = "No se pudo generar el diagnóstico con IA en este momento.";

        try {
            console.log('[OpenRouter] Requesting Executive Diagnosis generation...');

            const completion = await openai.chat.completions.create({
                model: 'nvidia/nemotron-3-nano-30b-a3b:free',
                messages: [
                    { role: 'system', content: 'Eres un Consultor Estratégico Senior con 20+ años de experiencia en diseño de modelos de negocio, automatización de procesos y transformación digital para pymes y empresas de servicios.\nTu función NO es transcribir respuestas del usuario.\nTu función es interpretar, sintetizar y convertir respuestas en un diagnóstico claro de negocio que un CEO pueda entender y tomar decisiones.\nEstás entrenado en venta consultiva, neuroventas y diseño de roadmaps de crecimiento.\nEscribes para decisores, no para perfiles técnicos.' },
                    { role: 'user', content: executiveDiagnosisPrompt }
                ]
            });

            finalAIExecutiveDiagnosis = completion.choices[0]?.message?.content || finalAIExecutiveDiagnosis;
            console.log('[OpenRouter] Executive Diagnosis generated successfully.');
        } catch (aiError) {
            console.error('[OpenRouter] Error generating diagnosis:', aiError);
        }

        // 3. Register Asset as CRM Internal Note
        console.log('[Volkern] Registering analytical asset...');
        let noteSuccess = false;
        let noteErrorMsg = '';
        try {
            await registerLeadInteraction(leadId, {
                tipo: 'nota',
                contenido: `[Plan de Automatización ABC (Generado por IA)]\n\n${finalAIExecutiveDiagnosis}`
            });
            noteSuccess = true;
        } catch (noteError) {
            console.error('[Volkern] Error registering note:', noteError);
            noteErrorMsg = noteError instanceof Error ? noteError.message : String(noteError);
        }

        // 4. Create Follow-up Task (24 hours)
        let taskSuccess = false;
        let taskErrorMsg = '';
        try {
            console.log('[Volkern] Creating 24h follow-up task...');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            await createTask(leadId, {
                tipo: 'llamada',
                titulo: `Follow-up 24h: Diagnóstico para ${state.empresa || state.nombre}`,
                descripcion: `Contactar a ${state.nombre} para agendar Sesión Estratégica. Dolor principal: ${state.dolorPrincipal || 'no especificado'}. Prioridad: ${state.prioridad}/10.`,
                fechaVencimiento: tomorrow.toISOString(),
            });
            taskSuccess = true;
            console.log('[Volkern] Follow-up task created successfully');
        } catch (taskError) {
            console.error('[Volkern] Error creating follow-up task:', taskError);
            taskErrorMsg = taskError instanceof Error ? taskError.message : String(taskError);
        }

        // 5. Email Delivery via Resend (Unified approach)
        let emailSent = false;
        let emailErrorMsg = '';
        try {
            console.log('[Resend] Sending diagnosis email...');

            await sendPostDiagnosisEmail(state.email, {
                nombre: state.nombre,
                dolorPrincipal: state.dolorPrincipal || 'No especificado',
                procesoActual: state.procesoActual || 'No especificado',
                objetivoNegocio: state.objetivoNegocio || 'No especificado',
                planesIA: finalAIExecutiveDiagnosis,
                linkAgenda: process.env.LINK_AGENDA || 'https://booking.dimension.expert/'
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
            emailErrorMsg = emailError instanceof Error ? emailError.message : String(emailError);
        }

        return NextResponse.json({
            success: true,
            leadId,
            emailSent,
            noteSuccess,
            taskSuccess,
            noteError: noteErrorMsg || undefined,
            taskError: taskErrorMsg || undefined,
            emailError: emailErrorMsg || undefined,
            message: 'Diagnóstico procesado. ' + (noteSuccess ? 'Nota guardada. ' : 'Error en nota. ') + (taskSuccess ? 'Tarea creada. ' : 'Error en tarea. ') + (emailSent ? 'Correo enviado.' : 'Error en correo.')
        });

    } catch (error) {
        console.error('[Diagnosis Error]', error);
        return NextResponse.json({
            error: 'Error al procesar el diagnóstico',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
