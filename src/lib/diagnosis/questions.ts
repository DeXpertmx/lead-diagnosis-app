export interface Question {
    id: string;
    field: keyof DiagnosisFields;
    question: string;
    validation?: 'email' | 'priority' | 'required' | 'phone';
    placeholder?: string;
}

export interface DiagnosisFields {
    nombre: string;
    email: string;
    telefono: string;
    empresa: string;
    industria: string;
    procesoActual: string;
    procesosManuales: string;
    dolorPrincipal: string;
    perdidasActuales: string;
    consecuencia6Meses: string;
    objetivoNegocio: string;
    prioridad: string;
    terminosYCondiciones: string;
}

export const DIAGNOSIS_QUESTIONS: Question[] = [
    {
        id: 'q1',
        field: 'nombre',
        question: '¿Cuál es tu nombre?',
        validation: 'required',
        placeholder: 'Tu nombre completo',
    },
    {
        id: 'q2',
        field: 'email',
        question: '¿Cuál es tu correo electrónico? Lo usaremos para enviarte el diagnóstico.',
        validation: 'email',
        placeholder: 'tu@email.com',
    },
    {
        id: 'q_phone',
        field: 'telefono',
        question: '¿Cuál es tu número de teléfono / WhatsApp? (Opcional)',
        validation: 'phone',
        placeholder: '+52 55 1234 5678',
    },
    {
        id: 'q3',
        field: 'empresa',
        question: '¿Cuál es el nombre de tu empresa?',
        validation: 'required',
        placeholder: 'Nombre de tu empresa',
    },
    {
        id: 'q4',
        field: 'industria',
        question: '¿En qué industria o sector opera tu negocio?',
        validation: 'required',
        placeholder: 'Ej: Tecnología, Retail, Servicios...',
    },
    {
        id: 'q5',
        field: 'procesoActual',
        question: '¿Cómo funciona actualmente tu proceso de ventas o atención al cliente? Cuéntame brevemente.',
        validation: 'required',
        placeholder: 'Describe tu proceso actual',
    },
    {
        id: 'q6',
        field: 'procesosManuales',
        question: '¿Qué tareas realizas de forma manual y repetitiva cada día o semana?',
        validation: 'required',
        placeholder: 'Ej: responder emails, agendar citas, seguimiento...',
    },
    {
        id: 'q7',
        field: 'dolorPrincipal',
        question: '¿Cuál es tu principal frustración operativa o el problema que más te quita tiempo?',
        validation: 'required',
        placeholder: 'Tu mayor dolor de cabeza',
    },
    {
        id: 'q8',
        field: 'perdidasActuales',
        question: '¿Estás perdiendo clientes, tiempo o dinero por esta situación? ¿Cuánto aproximadamente?',
        validation: 'required',
        placeholder: 'Impacto actual en tu negocio',
    },
    {
        id: 'q9',
        field: 'consecuencia6Meses',
        question: '¿Qué pasará en 6 meses si no mejoras esta situación?',
        validation: 'required',
        placeholder: 'Consecuencias de no actuar',
    },
    {
        id: 'q10',
        field: 'objetivoNegocio',
        question: '¿Cuál es tu objetivo de negocio a corto plazo (próximos 3-6 meses)?',
        validation: 'required',
        placeholder: 'Tu meta principal',
    },
    {
        id: 'q11',
        field: 'prioridad',
        question: 'Del 1 al 10, ¿qué tan urgente es para ti resolver esto? (1 = poco urgente, 10 = crítico)',
        validation: 'priority',
        placeholder: 'Un número del 1 al 10',
    },
    {
        id: 'q12',
        field: 'terminosYCondiciones',
        question: 'Para finalizar, ¿aceptas nuestros términos y condiciones? Esto nos permite enviarte el diagnóstico por email y que un especialista te contacte en las próximas 24 horas para ayudarte. (Escribe "Acepto" para continuar)',
        validation: 'required',
        placeholder: 'Escribe "Acepto"',
    },
];

export const TOTAL_QUESTIONS = DIAGNOSIS_QUESTIONS.length;
