import { NextRequest, NextResponse } from 'next/server';
import { DiagnosisState, generateContextoProyecto, generateExecutiveDiagnosis, generateAutomationActionPlans } from '@/lib/diagnosis/orchestrator';

import { volkernClient } from '@/lib/volkern/volkern-client';
import { Lead } from '@/lib/volkern/leads';

export async function POST(request: NextRequest) {
    console.log('[Diagnosis API] Starting request processing');

    try {
        const diagnosis: DiagnosisState = await request.json();
        console.log('[Diagnosis API] Received diagnosis:', JSON.stringify(diagnosis, null, 2));

        // Validate required fields
        if (!diagnosis.nombre) {
            return NextResponse.json(
                { error: 'El nombre es requerido', field: 'nombre' },
                { status: 400 }
            );
        }

        // Build diagnosis components
        const baseContext = generateContextoProyecto(diagnosis);
        const executiveDiagnosis = generateExecutiveDiagnosis(diagnosis);
        const actionPlans = generateAutomationActionPlans(diagnosis);

        // Step 1: Create or update lead in Volkern
        console.log('[Diagnosis API] Processing lead in Volkern...');

        const leadPayload = {
            nombre: diagnosis.nombre,
            email: diagnosis.email || undefined,
            telefono: diagnosis.telefono || undefined,
            empresa: diagnosis.empresa || undefined,
            canal: 'web' as const,
            estado: 'nuevo' as const,
            contextoProyecto: baseContext, // ONLY the base diagnosis goes here
        };

        const leadResponse = await volkernClient.post<any>('/leads', leadPayload);

        // Extract leadId from nested response: leadResponse.lead.id
        const leadId = leadResponse.lead?.id || leadResponse.id;

        if (!leadId) {
            throw new Error('No se pudo obtener el ID del lead del CRM');
        }

        console.log('[Diagnosis API] Lead processed with ID:', leadId);

        // Step 2: Register Executive Diagnosis as Interaction Note
        console.log('[Diagnosis API] Registering executive diagnosis note...');
        await volkernClient.post<any>(`/leads/${leadId}/interactions`, {
            tipo: 'nota',
            contenido: executiveDiagnosis,
            resultado: 'positivo',
        });

        // Step 3: Register Action Plan as Interaction Note
        console.log('[Diagnosis API] Registering action plan note...');
        await volkernClient.post<any>(`/leads/${leadId}/interactions`, {
            tipo: 'nota',
            contenido: actionPlans,
            resultado: 'positivo',
        });

        // Step 4: Create follow-up task (+24 hours)
        console.log('[Diagnosis API] Creating call task...');

        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + 24);

        const taskPayload = {
            tipo: 'llamada',
            titulo: `Llamada seguimiento: ${diagnosis.nombre}`,
            descripcion: `RECORADATORIO DE LLAMADA (24h): Contactar a ${diagnosis.nombre} (${diagnosis.empresa}) para revisar diagnóstico ejecutivo y planes de acción de automatización.`,
            prioridad: 'alta',
            fechaVencimiento: dueDate.toISOString(),
        };

        const taskResponse = await volkernClient.post<any>(`/leads/${leadId}/tasks`, taskPayload);

        console.log('[Diagnosis API] Task created successfully:', taskResponse.id || 'OK');

        return NextResponse.json({
            success: true,
            leadId: leadId,
            taskId: taskResponse.id || 'N/A',
            message: 'Diagnóstico guardado con éxito (Lead, Notas y Tarea creados)',
        });

    } catch (error) {
        console.error('[Diagnosis API] Error:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            {
                error: 'Error al procesar el diagnóstico',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}

// Debug endpoint to check configuration
export async function GET() {
    return NextResponse.json({
        baseUrl: process.env.VOLKERN_BASE_URL || 'https://volkern.app/api',
        keyConfigured: !!process.env.VOLKERN_API_KEY,
        keyPreview: process.env.VOLKERN_API_KEY ? `${process.env.VOLKERN_API_KEY.substring(0, 8)}...` : 'NOT SET',
    });
}
