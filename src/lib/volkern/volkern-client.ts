const VOLKERN_BASE_URL = process.env.VOLKERN_BASE_URL || 'https://volkern.app/api';
const VOLKERN_API_KEY = process.env.VOLKERN_API_KEY;

interface RequestOptions {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    body?: unknown;
    params?: Record<string, string>;
}

interface VolkernError {
    error: string;
    details?: string;
    hint?: string;
}

class VolkernClient {
    private baseUrl: string;
    private apiKey: string | undefined;

    constructor() {
        this.baseUrl = VOLKERN_BASE_URL;
        this.apiKey = VOLKERN_API_KEY;
    }

    private async request<T>(options: RequestOptions): Promise<T> {
        if (!this.apiKey) {
            throw new Error('VOLKERN_API_KEY no está configurada. Añádela a tus variables de entorno.');
        }

        const url = new URL(`${this.baseUrl}${options.path}`);

        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const headers: HeadersInit = {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
        };

        const response = await fetch(url.toString(), {
            method: options.method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as VolkernError;
            throw new VolkernApiError(
                response.status,
                errorData.error || `HTTP ${response.status}`,
                errorData.details,
                errorData.hint
            );
        }

        return response.json() as Promise<T>;
    }

    async get<T>(path: string, params?: Record<string, string>): Promise<T> {
        return this.request<T>({ method: 'GET', path, params });
    }

    async post<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>({ method: 'POST', path, body });
    }

    async patch<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>({ method: 'PATCH', path, body });
    }

    async delete<T>(path: string): Promise<T> {
        return this.request<T>({ method: 'DELETE', path });
    }
}

export class VolkernApiError extends Error {
    public readonly statusCode: number;
    public readonly details?: string;
    public readonly hint?: string;

    constructor(statusCode: number, message: string, details?: string, hint?: string) {
        super(message);
        this.name = 'VolkernApiError';
        this.statusCode = statusCode;
        this.details = details;
        this.hint = hint;
    }
}

// Singleton instance
export const volkernClient = new VolkernClient();
