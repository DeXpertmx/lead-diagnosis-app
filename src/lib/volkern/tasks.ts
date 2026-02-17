import { volkernClient } from './volkern-client';

export interface Task {
    id: string;
    leadId: string;
    tipo: 'llamada' | 'email' | 'reunion' | 'recordatorio';
    titulo: string;
    descripcion?: string;
    fechaVencimiento: string;
    completada: boolean;
    fechaCompletado?: string;
    asignadoA?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskPayload {
    tipo: 'llamada' | 'email' | 'reunion' | 'recordatorio';
    titulo: string;
    descripcion?: string;
    fechaVencimiento: string;
    asignadoA?: string;
}

/**
 * Create a follow-up call task for a lead
 * Due date is set to now + 24 hours
 * 
 * Per VOLKERN_SKILL.md:
 * - POST /api/leads/{leadId}/tasks
 * - tipo must be lowercase: 'llamada', 'email', 'reunion', 'recordatorio'
 * - fechaVencimiento is required and must be ISO 8601 UTC format
 */
export async function createCallTask(leadId: string): Promise<Task> {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 24);

    const payload: CreateTaskPayload = {
        tipo: 'llamada',
        titulo: 'Llamada diagnóstico automatización',
        descripcion: 'Revisar diagnóstico y propuesta generada por IA. Contactar al lead para discutir soluciones de automatización.',
        fechaVencimiento: dueDate.toISOString(),
    };

    return volkernClient.post<Task>(`/leads/${leadId}/tasks`, payload);
}

/**
 * Create a custom task for a lead
 * 
 * Per VOLKERN_SKILL.md:
 * - POST /api/leads/{leadId}/tasks
 */
export async function createTask(leadId: string, task: CreateTaskPayload): Promise<Task> {
    // Validate tipo
    const validTipos = ['llamada', 'email', 'reunion', 'recordatorio'];
    if (!validTipos.includes(task.tipo)) {
        throw new Error(`Tipo de tarea inválido: ${task.tipo}. Debe ser uno de: ${validTipos.join(', ')}`);
    }

    return volkernClient.post<Task>(`/leads/${leadId}/tasks`, task);
}

/**
 * List tasks for a lead
 * 
 * Per VOLKERN_SKILL.md:
 * - GET /api/leads/{leadId}/tasks
 */
export async function listLeadTasks(leadId: string): Promise<Task[]> {
    const response = await volkernClient.get<{ data: Task[] }>(`/leads/${leadId}/tasks`);
    return response.data;
}

/**
 * Mark a task as complete
 * 
 * Per VOLKERN_SKILL.md:
 * - PATCH /api/tasks/{taskId}
 * - Set completada: true
 */
export async function completeTask(taskId: string): Promise<Task> {
    return volkernClient.patch<Task>(`/tasks/${taskId}`, {
        completada: true,
        fechaCompletado: new Date().toISOString(),
    });
}

/**
 * Create a reminder task for follow-up
 * Used in the follow-up workflow
 */
export async function createReminderTask(
    leadId: string,
    titulo: string,
    hoursFromNow: number = 48
): Promise<Task> {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + hoursFromNow);

    return createTask(leadId, {
        tipo: 'recordatorio',
        titulo,
        descripcion: 'Tarea de seguimiento generada automáticamente',
        fechaVencimiento: dueDate.toISOString(),
    });
}
