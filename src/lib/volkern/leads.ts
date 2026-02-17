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
    // Build tags array including industry
    const etiquetas = ['diagnostico-ia'];
    if (diagnosis.industria) {
        etiquetas.push(diagnosis.industria.toLowerCase().replace(/\s+/g, '-'));
    }

    // Add urgency tag if priority is high
    if (diagnosis.prioridad && parseInt(diagnosis.prioridad) >= 8) {
        etiquetas.push('urgente');
    }

    const payload: CreateLeadPayload = {
        nombre: diagnosis.nombre!,
        email: diagnosis.email,
        telefono: diagnosis.telefono,
        empresa: diagnosis.empresa,
        canal: 'web',
        estado: 'nuevo',
        contextoProyecto: generateContextoProyecto(diagnosis),
    };

    return volkernClient.post<Lead>('/leads', payload);
}

/**
 * Search for existing leads by email
 * 
 * Per VOLKERN_SKILL.md:
 * - GET /api/leads?search={email}
 */
export async function searchLeadByEmail(email: string): Promise<Lead | null> {
    try {
        const response = await volkernClient.get<{ data: Lead[]; total: number }>('/leads', {
            search: email,
            limit: '1',
        });

        return response.data.length > 0 ? response.data[0] : null;
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
    return volkernClient.get<Lead>(`/leads/${leadId}`);
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
    return volkernClient.patch<Lead>(`/leads/${leadId}`, { estado });
}
