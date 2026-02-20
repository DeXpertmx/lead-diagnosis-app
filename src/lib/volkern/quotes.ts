import { volkernClient } from './volkern-client';

export interface CreateQuotePayload {
    titulo: string;
    leadId: string;
    items: Array<{
        concepto: string;
        cantidad: number;
        precioUnitario: number;
        descripcion?: string;
    }>;
    moneda?: string;
    validezDias?: number;
    clienteNombre?: string;
    clienteEmail?: string;
}

export interface QuoteResponse {
    success: boolean;
    id: string;
    url?: string;
}

/**
 * Create a commercial proposal (Quote) in Volkern
 * We use this to bridge the AI diagnosis with the CRM's formal offer system.
 */
export async function createDiagnosisQuote(payload: CreateQuotePayload): Promise<QuoteResponse> {
    try {
        const response = await volkernClient.post<QuoteResponse>('/cotizaciones', payload);
        return response;
    } catch (error) {
        console.error('[Volkern] Error creating quote:', error);
        throw error;
    }
}

/**
 * Send the quote via Volkern's native email system
 */
export async function sendQuoteViaVolkern(quoteId: string): Promise<{ success: boolean }> {
    try {
        const response = await volkernClient.post<{ success: boolean }>(`/cotizaciones/${quoteId}/send`, {});
        return response;
    } catch (error) {
        console.error('[Volkern] Error sending quote email:', error);
        throw error;
    }
}
