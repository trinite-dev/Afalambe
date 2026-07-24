export const DEMO_CHAT_STORAGE_KEY = 'afalambe_demo_chat_v3';
export const DEMO_CHAT_STORAGE_VERSION = 3 as const;
export const DEMO_CHAT_MAX_BYTES = 1_500_000;

export type DemoChatMessageSnapshot = {
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    attachments?: Array<{ url: string; mimeType: string }>;
};

export type DemoChatClaimSnapshot = {
    factCheckStatus?: string | null;
    sourceName?: string;
    sourceType?: string;
    platform?: string;
    topicCategory?: string;
    location?: string;
    claimLanguage?: string;
    claimDate?: string;
    factCheckDate?: string;
    sourceUrl?: string;
    sourceUrls?: string[];
};

export type DemoChatThreadSnapshot = {
    id: string;
    title: string;
    updatedAt: number;
    messages: DemoChatMessageSnapshot[];
    claim: DemoChatClaimSnapshot;
};

export type DemoChatHistoryV1 = {
    version: typeof DEMO_CHAT_STORAGE_VERSION;
    activeThreadId: string | null;
    threads: DemoChatThreadSnapshot[];
};

function canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function activeClaimStorageKey(userId: string): string {
    return `afalambe_active_claim:${userId}`;
}

export function messageOutboxStorageKey(userId: string): string {
    return `afalambe_message_outbox:${userId}`;
}

export function getActiveClaimId(userId: string): string | null {
    if (!canUseStorage() || !userId) return null;
    try {
        const value = window.localStorage.getItem(activeClaimStorageKey(userId));
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : null;
    } catch {
        return null;
    }
}

export function setActiveClaimId(userId: string, claimId: string | null): void {
    if (!canUseStorage() || !userId) return;
    try {
        const key = activeClaimStorageKey(userId);
        if (!claimId) {
            window.localStorage.removeItem(key);
            return;
        }
        window.localStorage.setItem(key, claimId);
    } catch {
        // quota / private mode
    }
}

export function clearAuthChatClientState(userId: string): void {
    if (!canUseStorage() || !userId) return;
    try {
        // Keep active claim id so the same user can restore selection after re-login.
        window.localStorage.removeItem(messageOutboxStorageKey(userId));
        // Legacy unscoped outbox from feat-0013
        window.localStorage.removeItem('afalambe_message_outbox');
    } catch {
        // ignore
    }
}

export function loadDemoChatHistory(): DemoChatHistoryV1 | null {
    if (!canUseStorage()) return null;
    try {
        const raw = window.localStorage.getItem(DEMO_CHAT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<DemoChatHistoryV1>;
        if (parsed.version !== DEMO_CHAT_STORAGE_VERSION || !Array.isArray(parsed.threads)) {
            return null;
        }
        return {
            version: DEMO_CHAT_STORAGE_VERSION,
            activeThreadId: typeof parsed.activeThreadId === 'string' ? parsed.activeThreadId : null,
            threads: parsed.threads.filter(
                (thread): thread is DemoChatThreadSnapshot =>
                    Boolean(thread) &&
                    typeof thread.id === 'string' &&
                    typeof thread.title === 'string' &&
                    typeof thread.updatedAt === 'number' &&
                    Array.isArray(thread.messages),
            ),
        };
    } catch {
        return null;
    }
}

export function saveDemoChatHistory(input: {
    activeThreadId: string | null;
    threads: DemoChatThreadSnapshot[];
}): void {
    if (!canUseStorage()) return;
    try {
        let threads = input.threads;
        let payload: DemoChatHistoryV1 = {
            version: DEMO_CHAT_STORAGE_VERSION,
            activeThreadId: input.activeThreadId,
            threads,
        };
        let serialized = JSON.stringify(payload);
        while (serialized.length > DEMO_CHAT_MAX_BYTES && threads.length > 1) {
            threads = threads
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, -1);
            const activeStillPresent = threads.some((thread) => thread.id === input.activeThreadId);
            payload = {
                version: DEMO_CHAT_STORAGE_VERSION,
                activeThreadId: activeStillPresent ? input.activeThreadId : null,
                threads,
            };
            serialized = JSON.stringify(payload);
        }
        window.localStorage.setItem(DEMO_CHAT_STORAGE_KEY, serialized);
    } catch {
        // quota / private mode
    }
}

export function clearDemoChatHistory(): void {
    if (!canUseStorage()) return;
    try {
        window.localStorage.removeItem(DEMO_CHAT_STORAGE_KEY);
    } catch {
        // ignore
    }
}
