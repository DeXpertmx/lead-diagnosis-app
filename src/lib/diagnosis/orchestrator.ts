import { DIAGNOSIS_QUESTIONS, Question, TOTAL_QUESTIONS } from './questions';
import { validateEmail, validatePriority, validateRequired, validatePhone } from './validators';

export { TOTAL_QUESTIONS };

/**
 * Interface for an Action Plan
 */
export interface ActionPlan {
    id: string;
    title: string;
    description: string;
    steps: string[];
    benefit: string;
}

export interface DiagnosisState {
    nombre?: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    industria?: string;
    procesoActual?: string;
    procesosManuales?: string;
    dolorPrincipal?: string;
    perdidasActuales?: string;
    consecuencia6Meses?: string;
    objetivoNegocio?: string;
    prioridad?: string;
    terminosYCondiciones?: string;
}

export interface ProcessResult {
    valid: boolean;
    error?: string;
    updates?: Partial<DiagnosisState>;
}

/**
 * Get the next unanswered question based on current state
 */
export function getNextQuestion(state: DiagnosisState): Question | null {
    for (const question of DIAGNOSIS_QUESTIONS) {
        const fieldValue = state[question.field];
        if (fieldValue === undefined || fieldValue === '') {
            return question;
        }
    }
    return null;
}

/**
 * Get the current question number (1-indexed)
 */
export function getCurrentQuestionNumber(state: DiagnosisState): number {
    const answeredCount = DIAGNOSIS_QUESTIONS.filter(
        q => state[q.field] !== undefined && state[q.field] !== ''
    ).length;
    return answeredCount + 1;
}

/**
 * Process user answer and validate
 */
export function processAnswer(state: DiagnosisState, answer: string): ProcessResult {
    const currentQuestion = getNextQuestion(state);

    if (!currentQuestion) {
        return { valid: false, error: 'No hay más preguntas pendientes.' };
    }

    // Validate based on type
    const trimmedAnswer = answer.trim();

    switch (currentQuestion.validation) {
        case 'email':
            if (!validateEmail(trimmedAnswer)) {
                return {
                    valid: false,
                    error: 'Por favor, ingresa un correo electrónico válido (ej: tu@email.com)'
                };
            }
            break;

        case 'priority':
            if (!validatePriority(trimmedAnswer)) {
                return {
                    valid: false,
                    error: 'Por favor, ingresa un número del 1 al 10'
                };
            }
            break;

        case 'phone':
            if (!validatePhone(trimmedAnswer)) {
                return {
                    valid: false,
                    error: 'Por favor, ingresa un número de teléfono válido (mínimo 8 dígitos)'
                };
            }
            break;

        case 'required':
        default:
            if (!validateRequired(trimmedAnswer)) {
                return {
                    valid: false,
                    error: 'Por favor, responde a esta pregunta para continuar'
                };
            }
            break;
    }

    return {
        valid: true,
        updates: {
            [currentQuestion.field]: trimmedAnswer,
        },
    };
}

/**
 * Check if all questions have been answered
 */
export function isComplete(state: DiagnosisState): boolean {
    return DIAGNOSIS_QUESTIONS.every(
        q => state[q.field] !== undefined && state[q.field] !== ''
    );
}

/**
 * Generate structured summary text for the diagnosis
 */
export function generateSummary(state: DiagnosisState): string {
    const sections = [
        `## Datos de Contacto`,
        `- **Nombre:** ${state.nombre}`,
        `- **Email:** ${state.email}`,
        `- **Teléfono:** ${state.telefono || 'No proporcionado'}`,
        `- **Empresa:** ${state.empresa}`,
        `- **Industria:** ${state.industria}`,
        ``,
        `## Situación Actual`,
        `- **Proceso actual:** ${state.procesoActual}`,
        `- **Tareas manuales:** ${state.procesosManuales}`,
        ``,
        `## Problemática`,
        `- **Dolor principal:** ${state.dolorPrincipal}`,
        `- **Pérdidas actuales:** ${state.perdidasActuales}`,
        `- **Consecuencia a 6 meses:** ${state.consecuencia6Meses}`,
        ``,
        `## Objetivos`,
        `- **Objetivo de negocio:** ${state.objetivoNegocio}`,
        `- **Prioridad:** ${state.prioridad}/10`,
        `- **Términos y Condiciones:** ${state.terminosYCondiciones || 'No aceptados'}`,
        ``,
        `---`,
        `*Diagnóstico generado automáticamente el ${new Date().toLocaleDateString('es-ES')}*`,
    ];

    return sections.join('\n');
}

/**
 * Generate 3 tiered automation action plans based on diagnosis
 */
export function generateAutomationActionPlans(state: DiagnosisState): string {
    const empresa = state.empresa || 'Empresa';
    const dolor = state.dolorPrincipal || 'procesos manuales';

    return `
PROPUESTA DE PLANES DE ACCIÓN: ${empresa.toUpperCase()}
==================================================

PLAN A: IMPLEMENTACIÓN INMEDIATA (QUICK WINS)
--------------------------------------------
Objetivo: Mitigar el dolor principal (${dolor}) de forma rápida.
1. Automatización de entrada de datos básica usando herramientas No-Code.
2. Centralización de contactos en Volkern CRM.
3. Configuración de respuestas automáticas iniciales en WhatsApp.
Beneficio: Reducción inmediata de la carga operativa inicial en un 20-30%.

PLAN B: TRANSFORMACIÓN INTEGRAL (CORE AUTOMATION)
--------------------------------------------
Objetivo: Optimizar el proceso completo de ${state.procesoActual || 'operaciones'}.
1. Integración profunda de flujos de trabajo entre departamentos.
2. Automatización del ciclo de vida del cliente (Lead -> Venta -> Post-venta).
3. Implementación de dashboards de métricas en tiempo real.
Beneficio: Aumento de la eficiencia operativa en un 50% y eliminación de errores humanos.

PLAN C: ESCALAMIENTO Y FUTURO (AI-ENABLED)
--------------------------------------------
Objetivo: Alineación con el objetivo estratégico: ${state.objetivoNegocio || 'Crecimiento inteligente'}.
1. Agentes de IA dedicados para atención al cliente 24/7.
2. Análisis predictivo de ventas y comportamiento del cliente.
3. Automatización avanzada impulsada por modelos de lenguaje específicos.
Beneficio: Ventaja competitiva sostenible y escalabilidad infinita sin aumentar proporcionalmente la plantilla.

---
Análisis generado automáticamente por Volkern AI
Fecha de análisis: ${new Date().toLocaleDateString('es-ES')}
`.trim();
}

/**
 * Generate a professional Executive Diagnosis summary
 * Based on the 4-point business structure
 */
export function generateExecutiveDiagnosis(state: DiagnosisState): string {
    return `
DIAGNÓSTICO EJECUTIVO: ${state.empresa?.toUpperCase() || 'EMPRESA'}
==================================================

1. RESUMEN DE LA SITUACIÓN ACTUAL
Estructura operativa en el sector ${state.industria || 'no especificado'}. 
Situación actual: ${state.procesoActual}

2. DESAFÍOS OPERATIVOS IDENTIFICADOS
El cliente reporta una carga significativa en tareas manuales: ${state.procesosManuales}.
Punto crítico (Dolor): ${state.dolorPrincipal}

3. IMPACTO DE NO ACTUAR
Pérdidas actuales estimadas: ${state.perdidasActuales}.
Proyección a 6 meses sin intervención: ${state.consecuencia6Meses}.

4. ALINEACIÓN CON OBJETIVOS DE NEGOCIO
Objetivo estratégico: ${state.objetivoNegocio}.
Nivel de urgencia: ${state.prioridad}/10.

---
Generado por Volkern Diagnosis Engine
Fecha: ${new Date().toLocaleDateString('es-ES')}
`.trim();
}

/**
 * Generate contextoProyecto for Volkern CRM
 */
export function generateContextoProyecto(state: DiagnosisState): string {
    return `
DIAGNÓSTICO DE AUTOMATIZACIÓN
=============================

EMPRESA: ${state.empresa}
INDUSTRIA: ${state.industria}
PRIORIDAD: ${state.prioridad}/10

PROCESO ACTUAL:
${state.procesoActual}

TAREAS MANUALES:
${state.procesosManuales}

DOLOR PRINCIPAL:
${state.dolorPrincipal}

PÉRDIDAS ACTUALES:
${state.perdidasActuales}

CONSECUENCIA SI NO SE ACTÚA (6 meses):
${state.consecuencia6Meses}

OBJETIVO DE NEGOCIO:
${state.objetivoNegocio}

---
Generado: ${new Date().toISOString()}
  `.trim();
}
