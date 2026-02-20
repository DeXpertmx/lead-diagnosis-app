import { volkernClient } from './volkern-client';
import { DiagnosisState, generateContextoProyecto } from '../diagnosis/orchestrator';

export interface Lead {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    canal: string;
    estado: string;
    contextoProyecto?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeadPayload {
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    canal?: 'web' | 'referido' | 'whatsapp' | 'telefono' | 'email' | 'otro';
    estado?: 'nuevo' | 'contactado' | 'calificado' | 'negociacion' | 'cliente' | 'perdido';
    contextoProyecto?: string;
}

/**
 * Create or update a lead in Volkern CRM based on diagnosis data
 * Uses upsert behavior: if email exists, the lead is updated
 * 
 * Per VOLKERN_SKILL.md:
 * - POST /api/leads
 * - nombre is required
 * - Email triggers upsert (existing email updates the lead)
 * - canal should be: 'web', 'referido', 'whatsapp', 'telefono', 'email', 'otro'
 * - estado options: 'nuevo', 'contactado', 'calificado', 'negociacion', 'cliente', 'perdido'
 */
export async function upsertLeadFromDiagnosis(diagnosis: DiagnosisState): Promise<Lead> {
    // Build tags array including industry and automation context
    const tags = ['diagnostico-ia', 'fuente-chat-web', 'motor-volkern-ai'];

    if (diagnosis.industria) {
        tags.push(`industria-${diagnosis.industria.toLowerCase().replace(/\s+/g, '-')}`);
    }

    if (diagnosis.prioridad && parseInt(diagnosis.prioridad) >= 8) {
        tags.push('urgente');
    }

    const payload: CreateLeadPayload & { tags?: string[] } = {
        nombre: diagnosis.nombre!,
        email: diagnosis.email,
        telefono: diagnosis.telefono,
        empresa: diagnosis.empresa,
        canal: 'web',
        estado: 'nuevo',
        contextoProyecto: generateContextoProyecto(diagnosis),
        tags: tags // Note: confirming if the API accepts tags in the payload or needs a separate call
    };

    const response = await volkernClient.post<{ success: boolean; lead: Lead }>('/leads', payload);
    return response.lead || (response as any as Lead);
}

/**
 * Register a lead with basic payload
 * 
 * Per VOLKERN_SKILL.md:
 * - POST /api/leads
 */
export async function registerLead(payload: CreateLeadPayload): Promise<Lead> {
    const response = await volkernClient.post<{ success: boolean; lead: Lead }>('/leads', payload);
    return response.lead || (response as any as Lead);
}

/**
 * Search for existing leads by email
 * 
 * Per VOLKERN_SKILL.md:
 * - GET /api/leads?search={email}
 */
export async function searchLeadByEmail(email: string): Promise<Lead | null> {
    try {
        const response = await volkernClient.get<{ success: boolean; data: Lead[]; total: number }>('/leads', {
            search: email,
            limit: '1',
        });

        return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch {
        return null;
    }
}

/**
 * Get lead by ID
 * 
 * Per VOLKERN_SKILL.md:
 * - GET /api/leads/{id}
 */
export async function getLeadById(leadId: string): Promise<Lead> {
    const response = await volkernClient.get<{ success: boolean; lead: Lead }>(`/leads/${leadId}`);
    return response.lead || (response as any as Lead);
}

/**
 * Update lead status
 * 
 * Per VOLKERN_SKILL.md:
 * - PATCH /api/leads/{id}
 */
export async function updateLeadStatus(
    leadId: string,
    estado: 'nuevo' | 'contactado' | 'calificado' | 'negociacion' | 'cliente' | 'perdido'
): Promise<Lead> {
    const response = await volkernClient.patch<{ success: boolean; lead: Lead }>(`/leads/${leadId}`, { estado });
    return response.lead || (response as any as Lead);
}
/**
 * Register an interaction (Internal Note) for a lead
 * 
 * Note: My tests show that /notes is the working endpoint for internal notes
 * in this Volkern environment.
 */
export async function registerLeadInteraction(
    leadId: string,
    payload: {
        tipo: 'llamada' | 'email' | 'reunion' | 'nota';
        contenido: string;
        resultado?: 'positivo' | 'negativo' | 'neutral';
    }
): Promise<any> {
    // We Map 'nota' to /notes endpoint. 
    // If it's a note, we use the specific notes endpoint which is more reliable.
    if (payload.tipo === 'nota') {
        return volkernClient.post(`/leads/${leadId}/notes`, {
            contenido: payload.contenido
        });
    }

    // For other types, we might still need a general interactions endpoint 
    // but based on user feedback, notes are the priority.
    return volkernClient.post(`/leads/${leadId}/notes`, {
        contenido: `[${payload.tipo.toUpperCase()}] ${payload.contenido}`
    });
}
