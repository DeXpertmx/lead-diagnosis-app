import { DIAGNOSIS_QUESTIONS, TOTAL_QUESTIONS, Question } from './questions';
import { validateEmail, validatePriority, validateRequired, validatePhone } from './validators';

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

// Re-export constants for easy access
export { TOTAL_QUESTIONS };

/**
 * Get the next unanswered question based on the current state
 */
export function getNextQuestion(state: DiagnosisState): Question | undefined {
    return DIAGNOSIS_QUESTIONS.find(q => !state[q.field]);
}

/**
 * Process a user answer, validate it and update the state
 */
export function processAnswer(state: DiagnosisState, answer: string): {
    valid: boolean;
    nextState: DiagnosisState;
    updates?: Partial<DiagnosisState>;
    error?: string;
    currentQuestion?: Question;
} {
    const currentQuestion = getNextQuestion(state);

    if (!currentQuestion) {
        return { valid: false, nextState: state, error: 'El diagnóstico ya se ha completado.' };
    }

    // Validate based on question type
    let isValid = true;
    if (currentQuestion.validation === 'email') {
        isValid = validateEmail(answer);
    } else if (currentQuestion.validation === 'priority') {
        isValid = validatePriority(answer);
    } else if (currentQuestion.validation === 'phone') {
        isValid = validatePhone(answer);
    } else {
        isValid = validateRequired(answer);
    }

    if (!isValid) {
        let errorMessage = 'Por favor, introduce una respuesta válida.';
        if (currentQuestion.validation === 'email') errorMessage = 'Correo electrónico no válido.';
        if (currentQuestion.validation === 'priority') errorMessage = 'Por favor, elige un número del 1 al 10.';

        return { valid: false, nextState: state, error: errorMessage, currentQuestion };
    }

    const nextState = { ...state, [currentQuestion.field]: answer.trim() };

    return {
        valid: true,
        nextState,
        updates: { [currentQuestion.field]: answer.trim() },
        currentQuestion
    };
}

/**
 * Senior Analysis Helper: Transforms raw user input into a business value narrative
 */
const synthesizeNarrative = (state: DiagnosisState) => {
    const { dolorPrincipal, perdidasActuales, objetivoNegocio, procesoActual } = state;

    return {
        oportunidad: `Transformar la ineficiencia detectada en ${procesoActual} en un motor de crecimiento escalable.`,
        riesgoFinanciero: `Mantener el esquema actual representa un drenaje de recursos proyectado en ${perdidasActuales}, lo que compromete la agilidad operativa necesaria para competir en el sector.`,
        visionSolucion: `Implementar una arquitectura de automatización centrada en resultados para alcanzar el objetivo de ${objetivoNegocio}, eliminando la fricción de ${dolorPrincipal}.`
    };
};

/**
 * Generate a professional Executive Diagnosis summary (Senior Analyst version)
 * This is the main output for the Client Roadmap
 */
export function generateAutomationActionPlans(state: DiagnosisState): string {
    const narrative = synthesizeNarrative(state);
    const empresa = state.empresa || 'Empresa';

    return `
HOJA DE RUTA ESTRATÉGICA: ${empresa.toUpperCase()}
==================================================

FASE A: OPTIMIZACIÓN DE CAPITAL OPERATIVO (QUICK WINS)
--------------------------------------------------
Objetivo: Detener el drenaje de recursos y liberar ancho de banda crítico.
* Enfoque: Atacar directamente la fricción de "${state.dolorPrincipal}".
* Acción: Automatización inteligente del flujo de "${state.procesoActual}" mediante integración de sistemas existentes y eliminación de cuellos de botella manuales.
* Impacto: Recuperación inmediata de eficiencia operativa y redireccionamiento del talento humano a tareas de alto valor.

FASE B: TRANSFORMACIÓN DE PROCESOS (CORE AUTOMATION)
--------------------------------------------------
Objetivo: Rediseñar la infraestructura para la escalabilidad.
* Enfoque: Convertir "${state.procesosManuales}" en un sistema autónomo y predecible.
* Acción: Orquestación end-to-end del ciclo de vida operativo, garantizando la integridad de datos y la trazabilidad total.
* Impacto: Reducción del error humano al 0% y capacidad de absorber 3x volumen de operación sin aumentar costos fijos.

FASE C: VENTAJA COMPETITIVA BASADA EN IA (AI-ENABLED)
--------------------------------------------------
Objetivo: Posicionamiento como líder tecnológico en el sector.
* Enfoque: Alineación total con la visión de "${state.objetivoNegocio}".
* Acción: Despliegue de agentes inteligentes y análisis predictivo para anticipar necesidades del mercado y personalizar la experiencia del cliente a escala.
* Impacto: Creación de un foso competitivo inalcanzable para competidores tradicionales.

---
Análisis Estratégico diseñado por el Motor de Diagnóstico Senior - Volkern AI
Fecha: ${new Date().toLocaleDateString('es-ES')}
`.trim();
}

/**
 * Alias for generateAutomationActionPlans to maintain compatibility with DiagnosisChat
 */
export const generateExecutiveDiagnosis = generateAutomationActionPlans;

/**
 * Generate a simple text summary of the chat answers
 */
export function generateSummary(state: DiagnosisState): string {
    return `
Resumen del Diagnóstico:
-----------------------
Empresa: ${state.empresa}
Sector: ${state.industria}
Prioridad: ${state.prioridad}/10
Meta: ${state.objetivoNegocio}
Proceso: ${state.procesoActual}
Manuales: ${state.procesosManuales}
Dolor: ${state.dolorPrincipal}
Pérdidas: ${state.perdidasActuales}
Riesgo 6m: ${state.consecuencia6Meses}
`.trim();
}

/**
 * Generate contextoProyecto for Volkern CRM (Senior Analyst Version)
 */
export function generateContextoProyecto(state: DiagnosisState): string {
    const narrative = synthesizeNarrative(state);
    return `
--- ANÁLISIS DE NEGOCIO SENIOR ---
ESTADO DE SITUACIÓN: ${state.procesoActual}
DESAFÍO CRÍTICO: ${state.dolorPrincipal}
Fuga de Valor Detectada: ${state.perdidasActuales}

OBJETIVO ESTRATÉGICO: ${state.objetivoNegocio}
PRIORIDAD DE IMPLEMENTACIÓN: ${state.prioridad}/10

DIAGNÓSTICO TÉCNICO:
El lead reporta ineficiencia severa en ${state.procesosManuales}. El riesgo de no actuar en 6 meses conlleva: ${state.consecuencia6Meses}.

VISIÓN: ${narrative.visionSolucion}
`.trim();
}

/**
 * Generate a high-impact session script for the consultant
 */
export function generateStrategicSessionScript(state: DiagnosisState): string {
    const { nombre, empresa, dolorPrincipal, objetivoNegocio, perdidasActuales } = state;

    return `
GUION CONSULTIVO: SESIÓN ESTRATÉGICA - ${nombre?.toUpperCase()}
==================================================

1. ENCUADRE DE VALOR (2 MIN)
---------------------------
- "Hola ${nombre}, he analizado detenidamente tu diagnóstico para ${empresa}. Mi objetivo hoy no es hablar del 'qué' hacemos, sino del 'cómo' tu negocio puede recuperar el control de su tiempo y crecimiento."
- "He identificado que hoy estás pagando un 'impuesto a la ineficiencia' de ${perdidasActuales}. Vamos a ver cómo eliminarlo."

2. VALIDACIÓN DEL IMPACTO (5 MIN)
-------------------------------
- "${nombre}, mencionaste que ${dolorPrincipal} es tu mayor freno hoy. Más allá del tiempo, ¿qué oportunidades de negocio estás dejando pasar por estar resolviendo esto manualmente?"
- "Si logramos que ${state.procesoActual} sea automático por completo, ¿cuánto cambiaría tu capacidad para alcanzar ese objetivo de ${objetivoNegocio}?"

3. LA NARRATIVA DE SOLUCIÓN (8 MIN)
----------------------------------
- "No necesitas más software, necesitas una arquitectura de resultados. He diseñado 3 niveles:"
- "[FASE A] Quick Wins: Liberar el cuello de botella en ${state.procesoActual}."
- "[FASE B] Optimización: Blindar tu operación contra el error humano y la saturación."
- "[FASE C] IA: Escalar tu visión de ${objetivoNegocio} sin límites operativos."

4. CIERRE DE COMPROMISO (5 MIN)
------------------------------
- "¿Prefieres seguir gestionando la complejidad manualmente o estás listo para que la tecnología trabaje para ${empresa}?"
- "El siguiente hito es definir el mapa técnico. ¿Lo hacemos?"
`.trim();
}

/**
 * Lead briefing for the consultant
 */
export function generateConsultantExecutiveSummary(state: DiagnosisState): string {
    return `
BRIEFING: LEAD ${state.nombre} (${state.empresa})
--------------------------------------------------
- KPI EN RIESGO: ${state.perdidasActuales}
- BARRERA CRÍTICA: ${state.dolorPrincipal}
- VISIÓN DE ÉXITO: ${state.objetivoNegocio}
- PERFIL: Requiere visión de retorno de inversión, no explicaciones técnicas de herramienta.
- ESTRATEGIA: Focar la conversación en el costo de oportunidad y escalabilidad.
`.trim();
}

/**
 * Session closing checklist
 */
export function generateClosingChecklist(state: DiagnosisState): string {
    return `
CHECKLIST CIERRE ESTRATÉGICO - ${state.empresa}
-----------------------------------------------
[ ] Confirmación del dolor financiero (${state.perdidasActuales})
[ ] Validación de la urgencia estratégica (${state.prioridad}/10)
[ ] Aceptación del Roadmap A -> B -> C
[ ] Definición de Propietario del Proyecto por parte del cliente
`.trim();
}

export interface ProposalOptions {
    version?: string;
    mode: 'conservative' | 'aggressive';
    consultationNotes?: string;
    inversion?: string;
    tiempoEstimado?: string;
}

/**
 * Generate a structured commercial proposal (Senior Analyst Narrative)
 */
export function generateCommercialProposal(state: DiagnosisState, options: ProposalOptions): string {
    const { version = 'v1' } = options;
    const narrative = synthesizeNarrative(state);

    return `
# PROPUESTA DE TRANSFORMACIÓN OPERATIVA E IA
**Cliente: ${state.empresa?.toUpperCase()} | Versión: ${version.toUpperCase()}**

## 1. RESUMEN EJECUTIVO
Basado en nuestro diagnóstico inicial, **${state.empresa}** presenta una oportunidad crítica para optimizar su capital operativo mediante la automatización de procesos. Hoy, el foco está diluido en tareas tácticas en **${state.industria}**, impidiendo el escalamiento estratégico hacia **${state.objetivoNegocio}**.

## 2. ANÁLISIS DE IMPACTO Y RETORNO (ROI)
Su esquema de trabajo actual enfocado en *${state.procesoActual}* genera una fricción operativa que se traduce en:
- **Impacto Económico:** Pérdida de recursos estimada en ${state.perdidasActuales}.
- **Costo de Oportunidad:** Limitación técnica para absorber crecimiento acelerado.
- **Riesgo Estratégico:** ${state.consecuencia6Meses}.

## 3. HOJA DE RUTA DE RESULTADOS
Proponemos un despliegue por fases orientado a hitos de negocio:

### FASE 1: ESTABILIZACIÓN Y EFICIENCIA (Semanas 1-4)
- **Foco:** Solventar la problemática de "${state.dolorPrincipal}".
- **Entregable:** Arquitectura de automatización core y liberación de carga manual.

### FASE 2: ESCALABILIDAD OPERATIVA (Semanas 5-8)
- **Foco:** Transformar "${state.procesosManuales}" en un asset tecnológico.
- **Entregable:** Dashboard de control y flujos dinámicos de información.

### FASE 3: INTELIGENCIA APLICADA (Semanas 9+)
- **Foco:** Implementación de IA para alcanzar ${state.objetivoNegocio}.
- **Entregable:** Agentes de IA y motores predictivos personalizados.

## 4. INVERSIÓN Y PRÓXIMOS PASOS
Nuestra propuesta es de socio tecnológico, no de proveedor de licencias. Buscamos el éxito de su objetivo de negocio.
- **Próximo Paso:** Validación de Alcance Técnico y Kick-off del proyecto.

---
**Dimension eXpert - Consultoría de Automatización de Alto Impacto**
`.trim();
}

/**
 * Check if the diagnosis state is complete (all required fields filled)
 */
export function isComplete(state: DiagnosisState): boolean {
    return getNextQuestion(state) === undefined;
}
