/**
 * Multi-LLM Provider Abstraction Layer
 * Supports: Gemini, OpenAI, Anthropic, Grok, Ollama, Custom endpoints
 */

export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'grok' | 'ollama' | 'custom';

export interface LLMConfig {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// Default models for each provider
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
    gemini: 'gemini-2.0-flash-exp',
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20241022',
    grok: 'grok-2-1212',
    ollama: 'llama3.2',
    custom: ''
};

// Default base URLs
export const DEFAULT_BASE_URLS: Record<LLMProvider, string> = {
    gemini: 'https://generativelanguage.googleapis.com/v1beta',
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    grok: 'https://api.x.ai/v1',
    ollama: 'http://localhost:11434/api',
    custom: ''
};

// Provider display info
export const PROVIDER_INFO: Record<LLMProvider, { name: string; description: string; requiresKey: boolean }> = {
    gemini: { name: 'Google Gemini', description: 'Google AI models (Gemini 2.0)', requiresKey: true },
    openai: { name: 'OpenAI', description: 'GPT-4o and GPT-4o-mini', requiresKey: true },
    anthropic: { name: 'Anthropic', description: 'Claude 3.5 Sonnet', requiresKey: true },
    grok: { name: 'xAI Grok', description: 'Grok-2 models', requiresKey: true },
    ollama: { name: 'Ollama', description: 'Local models (Llama, Mistral)', requiresKey: false },
    custom: { name: 'Custom Endpoint', description: 'OpenAI-compatible API', requiresKey: true }
};

/**
 * Abstract LLM Client Interface
 */
abstract class LLMClient {
    protected config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = config;
    }

    abstract chat(messages: LLMMessage[]): Promise<LLMResponse>;
    abstract stream(messages: LLMMessage[], onChunk: (chunk: string) => void): Promise<void>;
}

/**
 * Gemini Client
 */
class GeminiClient extends LLMClient {
    async chat(messages: LLMMessage[]): Promise<LLMResponse> {
        const model = this.config.model || DEFAULT_MODELS.gemini;
        const url = `${this.config.baseUrl || DEFAULT_BASE_URLS.gemini}/models/${model}:generateContent?key=${this.config.apiKey}`;

        const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        const systemInstruction = messages.find(m => m.role === 'system');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction.content }] } : undefined,
                generationConfig: {
                    temperature: this.config.temperature || 0.7,
                    maxOutputTokens: this.config.maxTokens || 8192
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.candidates[0].content.parts[0].text,
            model,
            usage: data.usageMetadata ? {
                promptTokens: data.usageMetadata.promptTokenCount,
                completionTokens: data.usageMetadata.candidatesTokenCount,
                totalTokens: data.usageMetadata.totalTokenCount
            } : undefined
        };
    }

    async stream(messages: LLMMessage[], onChunk: (chunk: string) => void): Promise<void> {
        const model = this.config.model || DEFAULT_MODELS.gemini;
        const url = `${this.config.baseUrl || DEFAULT_BASE_URLS.gemini}/models/${model}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`;

        const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        const systemInstruction = messages.find(m => m.role === 'system');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction.content }] } : undefined,
                generationConfig: {
                    temperature: this.config.temperature || 0.7,
                    maxOutputTokens: this.config.maxTokens || 8192
                }
            })
        });

        if (!response.ok || !response.body) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                            onChunk(data.candidates[0].content.parts[0].text);
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }
}

/**
 * OpenAI-compatible Client (OpenAI, Grok, Custom)
 */
class OpenAIClient extends LLMClient {
    async chat(messages: LLMMessage[]): Promise<LLMResponse> {
        const model = this.config.model || DEFAULT_MODELS[this.config.provider];
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URLS[this.config.provider];

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: this.config.temperature || 0.7,
                max_tokens: this.config.maxTokens || 8192
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            model: data.model,
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            } : undefined
        };
    }

    async stream(messages: LLMMessage[], onChunk: (chunk: string) => void): Promise<void> {
        const model = this.config.model || DEFAULT_MODELS[this.config.provider];
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URLS[this.config.provider];

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: this.config.temperature || 0.7,
                max_tokens: this.config.maxTokens || 8192,
                stream: true
            })
        });

        if (!response.ok || !response.body) {
            throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.choices?.[0]?.delta?.content) {
                            onChunk(data.choices[0].delta.content);
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }
}

/**
 * Anthropic Client
 */
class AnthropicClient extends LLMClient {
    async chat(messages: LLMMessage[]): Promise<LLMResponse> {
        const model = this.config.model || DEFAULT_MODELS.anthropic;
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URLS.anthropic;

        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch(`${baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey!,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model,
                max_tokens: this.config.maxTokens || 8192,
                system: systemMessage?.content,
                messages: chatMessages.map(m => ({ role: m.role, content: m.content }))
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.content[0].text,
            model: data.model,
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens
            }
        };
    }

    async stream(messages: LLMMessage[], onChunk: (chunk: string) => void): Promise<void> {
        const model = this.config.model || DEFAULT_MODELS.anthropic;
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URLS.anthropic;

        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch(`${baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey!,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model,
                max_tokens: this.config.maxTokens || 8192,
                system: systemMessage?.content,
                messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
                stream: true
            })
        });

        if (!response.ok || !response.body) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'content_block_delta' && data.delta?.text) {
                            onChunk(data.delta.text);
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }
}

/**
 * Ollama Client
 */
class OllamaClient extends LLMClient {
    async chat(messages: LLMMessage[]): Promise<LLMResponse> {
        const model = this.config.model || DEFAULT_MODELS.ollama;
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URLS.ollama;

        const response = await fetch(`${baseUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.message.content,
            model: data.model
        };
    }

    async stream(messages: LLMMessage[], onChunk: (chunk: string) => void): Promise<void> {
        const model = this.config.model || DEFAULT_MODELS.ollama;
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URLS.ollama;

        const response = await fetch(`${baseUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: true
            })
        });

        if (!response.ok || !response.body) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            onChunk(data.message.content);
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }
}

/**
 * Create LLM Client based on provider
 */
export function createLLMClient(config: LLMConfig): LLMClient {
    switch (config.provider) {
        case 'gemini':
            return new GeminiClient(config);
        case 'openai':
        case 'grok':
        case 'custom':
            return new OpenAIClient(config);
        case 'anthropic':
            return new AnthropicClient(config);
        case 'ollama':
            return new OllamaClient(config);
        default:
            throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
}

/**
 * Simple helper to get a chat response
 */
export async function chat(config: LLMConfig, messages: LLMMessage[]): Promise<LLMResponse> {
    const client = createLLMClient(config);
    return client.chat(messages);
}

/**
 * Simple helper to stream a chat response
 */
export async function streamChat(
    config: LLMConfig,
    messages: LLMMessage[],
    onChunk: (chunk: string) => void
): Promise<void> {
    const client = createLLMClient(config);
    return client.stream(messages, onChunk);
}
