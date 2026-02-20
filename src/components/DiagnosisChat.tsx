'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Message } from './ChatMessage';
import {
    DiagnosisState,
    getNextQuestion,
    processAnswer,
    isComplete,
    generateSummary,
    generateExecutiveDiagnosis,
    TOTAL_QUESTIONS
} from '@/lib/diagnosis/orchestrator';

export function DiagnosisChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{
        success: boolean;
        leadId?: string;
        taskId?: string;
        error?: string;
    } | null>(null);
    const [hasPendingSync, setHasPendingSync] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Auto-focus input on mount and after messages update
        inputRef.current?.focus();
    }, [messages]);

    const initialized = useRef(false);

    // Initialize with welcome message and first question
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initConversation = async () => {
            setIsTyping(true);
            await delay(500);

            const welcomeMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '¡Hola! 👋 Soy tu asistente de diagnóstico empresarial. Voy a hacerte algunas preguntas para entender mejor tu negocio y cómo podemos ayudarte con automatizaciones e IA.',
                timestamp: new Date(),
            };

            setMessages([welcomeMessage]);
            setIsTyping(false);

            await delay(800);

            const firstQuestion = getNextQuestion({});
            if (firstQuestion) {
                setIsTyping(true);
                await delay(600);

                const questionMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: firstQuestion.question,
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, questionMessage]);
                setIsTyping(false);
            }
        };

        initConversation();

        // Check for pending sync
        const pending = localStorage.getItem('pending_diagnosis');
        if (pending) {
            setHasPendingSync(true);
        }
    }, []);

    const syncPendingData = async () => {
        const pending = localStorage.getItem('pending_diagnosis');
        if (!pending) return;

        try {
            const state = JSON.parse(pending);
            setIsSubmitting(true);
            setIsTyping(true);

            const syncingMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '🔄 Detectamos un diagnóstico pendiente. Intentando sincronizar con el CRM...',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, syncingMessage]);

            await handleDiagnosisComplete(state, true);
        } catch (error) {
            console.error('Error parsing pending diagnosis:', error);
            localStorage.removeItem('pending_diagnosis');
            setHasPendingSync(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim() || isTyping || isComplete(diagnosisState)) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Process the answer
        const result = processAnswer(diagnosisState, inputValue.trim());

        if (!result.valid) {
            setIsTyping(true);
            await delay(500);

            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: result.error || 'Por favor, intenta de nuevo.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
            return;
        }

        // Update state with new answer
        const newState = { ...diagnosisState, ...result.updates };
        setDiagnosisState(newState);

        // Check if diagnosis is complete
        if (isComplete(newState)) {
            await handleDiagnosisComplete(newState);
            return;
        }

        // Get next question
        const nextQuestion = getNextQuestion(newState);
        if (nextQuestion) {
            setIsTyping(true);
            await delay(700);

            const questionMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: nextQuestion.question,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, questionMessage]);
            setIsTyping(false);
        }
    };

    const handleDiagnosisComplete = async (state: DiagnosisState, isSyncing = false) => {
        if (!isSyncing) {
            setIsTyping(true);
            await delay(500);

            const completionMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '¡Excelente! He recopilado toda la información necesaria. Ahora te muestro el resumen de tu diagnóstico y lo guardaré en nuestro sistema.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, completionMessage]);
            setIsTyping(false);
        }

        // Submit to API
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/diagnosis/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmissionResult({
                    success: true,
                    leadId: data.leadId,
                    taskId: data.taskId,
                });

                // Clear local storage on success
                localStorage.removeItem('pending_diagnosis');
                setHasPendingSync(false);

                await delay(500);

                const successMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: '✅ Tu información ha sido guardada correctamente en el CRM. Un miembro de nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para revisar tu diagnóstico.',
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, successMessage]);
            } else {
                throw new Error(data.error || 'Error al guardar');
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

            // SAVE LOCALLY ON FAILURE
            localStorage.setItem('pending_diagnosis', JSON.stringify(state));
            setHasPendingSync(true);

            setSubmissionResult({
                success: false,
                error: errorMsg,
            });

            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `⚠️ Hubo un problema al guardar tu información: "${errorMsg}". Tu diagnóstico ha sido guardado localmente en tu navegador. Puedes intentar sincronizarlo de nuevo cuando el problema se resuelva.`,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const currentQuestionNumber = Object.keys(diagnosisState).length;
    const progressPercentage = (currentQuestionNumber / TOTAL_QUESTIONS) * 100;

    return (
        <div className="chat-container">
            {/* Header */}
            <header className="chat-header">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src="/images/DeXpert%20Logo.png"
                        alt="Dimension Expert"
                        className="h-14 w-auto mb-2"
                        onError={(e) => {
                            console.error('Logo not found at /images/DeXpert Logo.png');
                        }}
                    />
                    <h1>Diagnóstico de Automatización</h1>
                    <p>Descubre cómo la IA puede transformar tu negocio</p>

                    {hasPendingSync && (
                        <button
                            onClick={syncPendingData}
                            disabled={isSubmitting}
                            className="mt-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg animate-pulse"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                            </svg>
                            SINCRONIZAR DATOS PENDIENTES
                        </button>
                    )}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <p className="progress-text">
                    {currentQuestionNumber} de {TOTAL_QUESTIONS} preguntas
                </p>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}

                {isTyping && (
                    <div className="typing-indicator">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                    </div>
                )}

                {isComplete(diagnosisState) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <DiagnosisSummary state={diagnosisState} />
                        <ExecutiveSummary state={diagnosisState} />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!isComplete(diagnosisState) && (
                <form className="input-area" onSubmit={handleSubmit}>
                    <div className="input-container">
                        <textarea
                            ref={inputRef}
                            className="message-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu respuesta..."
                            disabled={isTyping}
                            rows={1}
                        />
                        <button
                            type="submit"
                            className="send-button"
                            disabled={!inputValue.trim() || isTyping}
                            aria-label="Enviar mensaje"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13" />
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// Diagnosis Summary Component
function DiagnosisSummary({ state }: { state: DiagnosisState }) {
    const summary = generateSummary(state);

    return (
        <div className="summary-card">
            <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                Resumen de Respuestas
            </h3>
            <dl>
                <div>
                    <dt>Empresa</dt>
                    <dd>{state.empresa} ({state.industria})</dd>
                </div>
                <div>
                    <dt>Dolor Principal</dt>
                    <dd>{state.dolorPrincipal}</dd>
                </div>
                <div>
                    <dt>Prioridad</dt>
                    <dd>
                        <span className="inline-flex items-center gap-2">
                            <span className="font-semibold text-primary-400">{state.prioridad}/10</span>
                            {Number(state.prioridad) >= 8 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">URGENTE</span>}
                        </span>
                    </dd>
                </div>
            </dl>
        </div>
    );
}

// Executive Summary Component (Professional View)
function ExecutiveSummary({ state }: { state: DiagnosisState }) {
    const executiveMsg = generateExecutiveDiagnosis(state);

    // Split the message to handle the 4 points better in UI
    // Updated regex to include accented Spanish characters and ensure it captures headers correctly
    const sections = executiveMsg.split(/(\d\.\s[A-Z\xC0-\xDF\s]+)/).filter(Boolean);

    return (
        <div className="executive-card bg-gradient-to-br from-white to-slate-50 border border-primary-500/30 rounded-xl p-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V7h2v10z" />
                </svg>
            </div>

            <h3 className="text-primary-400 font-bold text-lg mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Diagnóstico Ejecutivo Profesional
            </h3>

            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                {sections.map((text, i) => {
                    const isHeader = /^\d\.\s[A-Z\xC0-\xDF\s]+/.test(text);
                    return (
                        <div key={i} className={isHeader ? "text-primary-600 font-bold uppercase tracking-wider text-xs mt-4 mb-1" : "pl-4 border-l-2 border-primary-100 italic text-slate-600"}>
                            {text.trim()}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest">
                <span>Volkern AI Engine</span>
                <span>{new Date().toLocaleDateString('es-ES')}</span>
            </div>
        </div>
    );
}

// Utility
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
