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
 * Generate a professional Executive Diagnosis prompt (Senior Analyst version)
 * This will be used by an AI (via n8n or manually) to generate the final output.
 */
export function generateAutomationActionPlans(state: DiagnosisState): string {
    const empresa = state.empresa || 'Empresa';

    return `
Rol del agente (sistema):
Eres un Consultor Estratégico Senior con 20+ años de experiencia en diseño de modelos de negocio, automatización de procesos y transformación digital para pymes y empresas de servicios.
Tu función NO es transcribir respuestas del usuario.
Tu función es interpretar, sintetizar y convertir respuestas en un diagnóstico claro de negocio que un CEO pueda entender y tomar decisiones.
Estás entrenado en venta consultiva, neuroventas y diseño de roadmaps de crecimiento.
Escribes para decisores, no para perfiles técnicos.

📥 INPUT
Aquí están las respuestas crudas del cliente del formulario de diagnóstico:
- Empresa: ${empresa}
- Industria: ${state.industria || '-'}
- Proceso Actual: ${state.procesoActual || '-'}
- Tareas Manuales: ${state.procesosManuales || '-'}
- Dolor Principal: ${state.dolorPrincipal || '-'}
- Pérdidas Actuales: ${state.perdidasActuales || '-'}
- Consecuencia en 6 meses: ${state.consecuencia6Meses || '-'}
- Objetivo de Negocio: ${state.objetivoNegocio || '-'}
- Prioridad: ${state.prioridad || '-'} / 10

📤 OUTPUT OBLIGATORIO (estructura fija)
Genera una respuesta con la siguiente estructura exacta:

1️⃣ LECTURA EJECUTIVA (5 líneas máximo)
Resume qué le pasa al negocio en realidad, sin copiar texto literal del cliente.
Debe responder:
- Qué frena hoy al negocio
- Qué riesgo corre
- Qué oportunidad tiene si actúa ahora
❌ Prohibido copiar frases literales del formulario
✅ Obligatorio sintetizar y reinterpretar

2️⃣ PROBLEMA CENTRAL (UNA FRASE CLARA)
Una sola frase que describa el cuello de botella principal del negocio en lenguaje de negocio.

3️⃣ COSTO DE NO ACTUAR (ENFOQUE EJECUTIVO)
Traduce las pérdidas del cliente a:
- Riesgo financiero
- Riesgo de crecimiento
- Riesgo competitivo
❌ No usar cifras inventadas
✅ Si no hay cifras, hablar de impacto cualitativo (pérdida de velocidad, pérdida de ventaja, presión financiera futura)

4️⃣ OPORTUNIDAD ESTRATÉGICA
Explica en 3–4 líneas qué ventaja competitiva puede construir el cliente si actúa ahora.
Debe sonar aspiracional pero creíble.

5️⃣ HOJA DE RUTA A/B/C (ORIENTADA A RESULTADOS, NO A TECNOLOGÍA)
Cada fase debe responder:
- Qué desbloquea en el negocio
- Qué cambia en su forma de operar
- Qué resultado visible obtiene el CEO

Formato obligatorio:
FASE A – Estabilización del Negocio (Quick Wins)
- Resultado de negocio que desbloquea: [texto]
- Qué deja de doler: [texto]
- Impacto esperado (operativo o comercial): [texto]

FASE B – Escalabilidad Operativa (Core Automation)
- Resultado de negocio: [texto]
- Qué cambia en la estructura del negocio: [texto]
- Impacto esperado: [texto]

FASE C – Ventaja Competitiva (IA)
- Resultado estratégico: [texto]
- Qué posición le da en su mercado: [texto]
- Impacto esperado: [texto]

❌ Prohibido listar herramientas
❌ Prohibido frases genéricas como “automatización de procesos”
✅ Enfocar en negocio, no en sistemas

6️⃣ PRÓXIMAS 3 DECISIONES ESTRATÉGICAS (14 DÍAS)
Instrucción para la IA:
Genera un bloque final titulado "PRÓXIMAS 3 DECISIONES ESTRATÉGICAS (14 DÍAS)".
Este bloque debe:
- Traducir el diagnóstico a decisiones de negocio concretas, crudas y urgentes (cero acciones técnicas).
- Estar escrito para un CEO dictaminando el rumbo de su empresa.
- Cada decisión debe incluir:
   1. La decisión literal que debe tomar (Ej. "Nuestra ventaja competitiva será velocidad + orden + seguimiento automático.")
   2. Por qué es crítica AHORA (qué pasa si nace operando como la competencia y por qué es un riesgo).
   3. Qué desbloquea.
- MÁXIMO 3 decisiones.

🧠 REGLAS DE ORO Y EJEMPLO DE TONO
- Nunca copies frases literales del cliente.
- El problema real NUNCA es "falta de automatización". El problema real es (ejemplo): "Si naces operando como tus competidores, vas a crecer lento, caro y sin control".
- La oportunidad real NUNCA es "usar un CRM". La oportunidad es: "Tienes una ventana estratégica para nacer mejor diseñado que el mercado."
- En la Fase A, la solución NUNCA es "Conectar WhatsApp a n8n". La solución es: "Definir tu sistema de ventas digital base (cómo entra un lead, cómo se atiende, cómo se cierra) antes de salir a vender."
- Habla en términos de arquitectura operativa, ingresos recurrentes, escala pobre, costo de oportunidad y sistemas de ventas.
- Tu tono debe ser firme, consultivo, de alguien que ya ha visto fracasar a otras empresas por no estructurarse bien desde el día uno.
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
