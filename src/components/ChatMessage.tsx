export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isAssistant = message.role === 'assistant';

    return (
        <div
            className={`message-bubble ${isAssistant ? 'message-assistant' : 'message-user'}`}
        >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <span className="text-xs opacity-50 mt-2 block">
                {formatTime(message.timestamp)}
            </span>
        </div>
    );
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
}
