type ChatMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type GenerateTextInput = {
    system: string;
    messages: ChatMessage[];
    temperature?: number;
    timeoutMs?: number;
};

function requireAiApiKey(): string {
    const key = process.env.AI_API_KEY;
    if (!key) {
        throw new Error('AI_API_KEY is missing');
    }
    return key;
}

function resolveProvider(): 'openai' | 'gemini' {
    const raw = (process.env.AI_PROVIDER ?? 'openai').toLowerCase().trim();
    if (raw === 'gemini' || raw === 'google') return 'gemini';
    return 'openai';
}

function resolveModel(provider: 'openai' | 'gemini'): string {
    if (process.env.AI_MODEL?.trim()) return process.env.AI_MODEL.trim();
    return provider === 'gemini' ? 'gemini-flash-latest' : 'gpt-4.1-mini';
}

async function generateOpenAiText(input: GenerateTextInput): Promise<string> {
    const key = requireAiApiKey();
    const model = resolveModel('openai');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 30_000);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                temperature: input.temperature,
                messages: [
                    { role: 'system', content: input.system },
                    ...input.messages.map((message) => ({
                        role: message.role === 'assistant' ? 'assistant' : 'user',
                        content: message.content,
                    })),
                ],
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`AI request failed with ${response.status}`);
        }

        const json = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };
        const text = json.choices?.[0]?.message?.content?.trim();
        if (!text) {
            throw new Error('Empty AI response');
        }
        return text;
    } finally {
        clearTimeout(timeout);
    }
}

function extractGeminiText(json: {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
    }>;
}): string {
    const text = json.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim();
    if (!text) {
        throw new Error('Empty AI response');
    }
    return text;
}

async function generateGeminiText(input: GenerateTextInput): Promise<string> {
    const key = requireAiApiKey();
    const model = resolveModel('gemini');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 30_000);

    const contents = input.messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }],
        }));

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': key,
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: input.system }],
                    },
                    contents,
                    generationConfig:
                        input.temperature === undefined
                            ? undefined
                            : { temperature: input.temperature },
                }),
                signal: controller.signal,
            },
        );

        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(
                `AI request failed with ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
            );
        }

        return extractGeminiText(
            (await response.json()) as {
                candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                }>;
            },
        );
    } finally {
        clearTimeout(timeout);
    }
}

export async function generateProviderText(input: GenerateTextInput): Promise<string> {
    const provider = resolveProvider();
    return provider === 'gemini' ? generateGeminiText(input) : generateOpenAiText(input);
}

async function transcribeWithGemini(input: {
    audioBase64: string;
    mimeType: string;
    language?: string;
}): Promise<string> {
    const key = requireAiApiKey();
    const model = resolveModel('gemini');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    const languageHint = input.language?.trim()
        ? `Language hint: ${input.language.trim()}. `
        : '';

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': key,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `Transcribe this audio. ${languageHint}Return only the transcript text.`,
                                },
                                {
                                    inlineData: {
                                        mimeType: input.mimeType.split(';')[0] ?? input.mimeType,
                                        data: input.audioBase64,
                                    },
                                },
                            ],
                        },
                    ],
                }),
                signal: controller.signal,
            },
        );

        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(
                `Gemini transcription failed with ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
            );
        }

        return extractGeminiText(
            (await response.json()) as {
                candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                }>;
            },
        );
    } finally {
        clearTimeout(timeout);
    }
}

async function transcribeWithOpenAi(input: {
    audioBase64: string;
    mimeType: string;
    language?: string;
}): Promise<string> {
    const key = requireAiApiKey();
    const audioBuffer = Buffer.from(input.audioBase64, 'base64');
    if (audioBuffer.length > 5 * 1024 * 1024) {
        throw new Error('Audio file too large');
    }

    const extension = input.mimeType.includes('webm')
        ? 'webm'
        : input.mimeType.includes('mp4')
          ? 'mp4'
          : input.mimeType.includes('mpeg')
            ? 'mp3'
            : input.mimeType.includes('wav')
              ? 'wav'
              : 'ogg';

    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: input.mimeType }), `recording.${extension}`);
    formData.append('model', 'whisper-1');
    if (input.language?.trim()) {
        formData.append('language', input.language.trim());
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}` },
            body: formData,
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`Whisper request failed with ${response.status}`);
        }
        const json = (await response.json()) as { text?: string };
        const text = json.text?.trim();
        if (!text) {
            throw new Error('Empty transcription');
        }
        return text;
    } finally {
        clearTimeout(timeout);
    }
}

export async function transcribeAudioWithProvider(input: {
    audioBase64: string;
    mimeType: string;
    language?: string;
}): Promise<string> {
    const provider = resolveProvider();
    if (provider === 'gemini') {
        const audioBuffer = Buffer.from(input.audioBase64, 'base64');
        if (audioBuffer.length > 5 * 1024 * 1024) {
            throw new Error('Audio file too large');
        }
        return transcribeWithGemini(input);
    }
    return transcribeWithOpenAi(input);
}
