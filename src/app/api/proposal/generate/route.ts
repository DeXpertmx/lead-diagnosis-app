import { NextResponse } from 'next/server';
import { DiagnosisState, generateCommercialProposal, ProposalOptions } from '@/lib/diagnosis/orchestrator';
import { registerLeadInteraction, searchLeadByEmail } from '@/lib/volkern/leads';
import { sendProposalEmail } from '@/lib/email/resend';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, mode, consultationNotes, inversion, tiempoEstimado } = body;

        if (!email || !mode) {
            return NextResponse.json(
                { error: 'Email y modo (conservative/aggressive) son obligatorios.' },
                { status: 400 }
            );
        }

        // 1. Find lead in Volkern CRM
        const lead = await searchLeadByEmail(email);
        if (!lead) {
            return NextResponse.json(
                { error: 'Lead no encontrado en el CRM.' },
                { status: 404 }
            );
        }

        // 2. Prepare diagnosis state (mocking from lead metadata if needed, 
        // but here we assume the body might send the full state or we use what's in the CRM)
        // For simplicity, we assume the body includes the diagnosis state or we fetch it.
        const state: DiagnosisState = body.state || {
            nombre: lead.nombre,
            email: lead.email,
            empresa: lead.empresa,
            // ... map other fields from lead if available
        };

        // 3. Handle Versioning (simple timestamp based versioning for now)
        const timestamp = new Date().getTime();
        const version = `v-${timestamp}`;

        // 4. Generate Proposal
        const proposalMarkdown = generateCommercialProposal(state, {
            mode,
            consultationNotes,
            inversion,
            tiempoEstimado,
            version
        });

        // 5. Register in CRM
        const interaction = await registerLeadInteraction(lead.id, {
            tipo: 'nota',
            contenido: proposalMarkdown,
            resultado: 'neutral'
        });

        console.log(`[Proposal] Generated ${mode} version for: ${email}`);

        // 6. Send delivery email
        try {
            await sendProposalEmail(email, {
                nombre: lead.nombre,
                empresa: lead.empresa || 'su empresa',
                mode: mode,
                proposalPreview: isAggressive(mode) ?
                    'Propuesta de Alto Impacto: Transformación con IA' :
                    'Propuesta de Eficiencia: Optimización de Procesos'
            });
        } catch (emailError) {
            console.error('[Proposal] Email delivery failed:', emailError);
        }

        return NextResponse.json({
            success: true,
            version: version,
            mode: mode,
            leadId: lead.id
        });

    } catch (error) {
        console.error('[API] Error generating proposal:', error);
        return NextResponse.json(
            { error: 'Error interno al generar la propuesta.' },
            { status: 500 }
        );
    }
}

function isAggressive(mode: string): boolean {
    return mode === 'aggressive';
}
