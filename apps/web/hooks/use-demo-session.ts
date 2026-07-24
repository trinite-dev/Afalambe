'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { appendFactCheckDetailsFooter } from '@afalambe/ai/fact-check-details';

import { matchDemoScenario, type DemoFactCheckStatus, type DemoScenarioClaimMetadata } from '@/lib/demo-scenarios';
import {
    loadDemoChatHistory,
    saveDemoChatHistory,
    type DemoChatThreadSnapshot,
} from '@/lib/chat-history-storage';
import type { UiLocale } from '@/lib/ui-locale';

const TYPING_DELAY_MS = 900;

export type DemoMessageAttachment = {
    url: string;
    mimeType: string;
};

export type DemoMessage = {
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    attachments?: DemoMessageAttachment[];
};

export type DemoClaimData = DemoScenarioClaimMetadata & {
    factCheckStatus?: DemoFactCheckStatus | null;
};

export type DemoThread = {
    id: string;
    title: string;
    updatedAt: number;
    messages: DemoMessage[];
    claim: DemoClaimData;
    isTyping: boolean;
};

type SendUserMessageInput = {
    threadId?: string | null;
    content: string;
    attachments?: DemoMessageAttachment[];
    title?: string;
};

function createAssistantMessage(
    scenario: ReturnType<typeof matchDemoScenario>,
    locale: UiLocale,
    attachmentUrls: string[] = [],
): DemoMessage {
    const meta = scenario.claimMetadata;
    const includeDetails = scenario.includeFactCheckDetails !== false && scenario.id !== 'META' && scenario.id !== 'OFF_TOPIC' && scenario.id !== 'UNMATCHED';
    const content = includeDetails
        ? appendFactCheckDetailsFooter(scenario.assistantReply, {
              locale,
              factCheckStatus: scenario.factCheckStatus,
              factCheckDate: meta.factCheckDate,
              topicCategory: meta.topicCategory,
              location: meta.location,
              claimDate: meta.claimDate,
              sourceName: meta.sourceName,
              sourceType: meta.sourceType,
              platform: meta.platform,
              sourceUrl: meta.sourceUrl,
              sourceUrls: [...(meta.sourceUrls ?? []), ...attachmentUrls],
          })
        : scenario.assistantReply;

    return {
        id: crypto.randomUUID(),
        role: 'ASSISTANT',
        content,
    };
}

function applyScenarioToThread(thread: DemoThread, scenario: ReturnType<typeof matchDemoScenario>): DemoThread {
    return {
        ...thread,
        claim: {
            ...scenario.claimMetadata,
            factCheckStatus: scenario.factCheckStatus,
        },
        updatedAt: Date.now(),
    };
}

function collectThreadAttachmentUrls(thread: DemoThread): string[] {
    return thread.messages
        .filter((message) => message.role === 'USER' && Array.isArray(message.attachments))
        .flatMap((message) => message.attachments ?? [])
        .map((attachment) => attachment.url)
        .filter(Boolean);
}

function toSnapshot(thread: DemoThread): DemoChatThreadSnapshot {
    return {
        id: thread.id,
        title: thread.title,
        updatedAt: thread.updatedAt,
        messages: thread.messages,
        claim: thread.claim,
    };
}

function fromSnapshot(thread: DemoChatThreadSnapshot): DemoThread {
    const status = thread.claim.factCheckStatus;
    const factCheckStatus =
        status === 'VERIFIED' ||
        status === 'DEBUNKED' ||
        status === 'MISLEADING' ||
        status === 'PARTIALLY_TRUE' ||
        status === 'PENDING'
            ? status
            : undefined;

    return {
        id: thread.id,
        title: thread.title,
        updatedAt: thread.updatedAt,
        messages: thread.messages,
        claim: {
            ...thread.claim,
            factCheckStatus,
        },
        isTyping: false,
    };
}

function readInitialDemoState(): { threads: DemoThread[]; activeThreadId: string | null } {
    const stored = loadDemoChatHistory();
    if (!stored) {
        return { threads: [], activeThreadId: null };
    }
    const threads = stored.threads.map(fromSnapshot);
    const activeThreadId =
        stored.activeThreadId && threads.some((thread) => thread.id === stored.activeThreadId)
            ? stored.activeThreadId
            : null;
    return { threads, activeThreadId };
}

export function useDemoSession(locale: UiLocale): {
    threads: DemoThread[];
    activeThreadId: string | null;
    setActiveThreadId: (threadId: string | null) => void;
    activeThread: DemoThread | null;
    claimData: DemoClaimData | null;
    messages: DemoMessage[];
    isTyping: boolean;
    isPending: boolean;
    sendUserMessage: (input: SendUserMessageInput) => Promise<string>;
    regenerateAssistantReply: (threadId: string) => Promise<void>;
} {
    const initialRef = useRef<ReturnType<typeof readInitialDemoState> | null>(null);
    if (initialRef.current === null) {
        initialRef.current = readInitialDemoState();
    }

    const [threads, setThreads] = useState<DemoThread[]>(() => initialRef.current!.threads);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(
        () => initialRef.current!.activeThreadId,
    );
    const [isPending, setIsPending] = useState(false);
    const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const localeRef = useRef(locale);
    localeRef.current = locale;
    const hasHydratedRef = useRef(false);

    useEffect(() => {
        return () => {
            for (const timeout of typingTimeoutsRef.current.values()) {
                clearTimeout(timeout);
            }
            typingTimeoutsRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!hasHydratedRef.current) {
            hasHydratedRef.current = true;
            return;
        }
        saveDemoChatHistory({
            activeThreadId,
            threads: threads.map(toSnapshot),
        });
    }, [activeThreadId, threads]);

    const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;
    const messages = activeThread?.messages ?? [];
    const isTyping = activeThread?.isTyping ?? false;
    const claimData = activeThread?.claim ?? null;

    const scheduleAssistantReply = useCallback((threadId: string, userText: string) => {
        const existing = typingTimeoutsRef.current.get(threadId);
        if (existing) clearTimeout(existing);

        setThreads((prev) =>
            prev.map((thread) =>
                thread.id === threadId ? { ...thread, isTyping: true, updatedAt: Date.now() } : thread,
            ),
        );

        const timeout = setTimeout(() => {
            typingTimeoutsRef.current.delete(threadId);
            const locale = localeRef.current;

            setThreads((prev) =>
                prev.map((thread) => {
                    if (thread.id !== threadId) return thread;
                    const hasPriorAssistant = thread.messages.some((message) => message.role === 'ASSISTANT');
                    const scenario = matchDemoScenario(locale, userText, { hasPriorAssistant });
                    const withScenario = applyScenarioToThread(thread, scenario);
                    const attachmentUrls = collectThreadAttachmentUrls(withScenario);
                    return {
                        ...withScenario,
                        isTyping: false,
                        messages: [
                            ...withScenario.messages,
                            createAssistantMessage(scenario, locale, attachmentUrls),
                        ],
                    };
                }),
            );
            setIsPending(false);
        }, TYPING_DELAY_MS);

        typingTimeoutsRef.current.set(threadId, timeout);
    }, []);

    const sendUserMessage = useCallback(
        async ({ threadId, content, attachments, title }: SendUserMessageInput): Promise<string> => {
            const trimmed = content.trim();
            const hasAttachments = Boolean(attachments && attachments.length > 0);
            if (!trimmed && !hasAttachments) {
                return threadId ?? '';
            }

            setIsPending(true);

            let resolvedThreadId = threadId ?? activeThreadId;
            const userMessage: DemoMessage = {
                id: crypto.randomUUID(),
                role: 'USER',
                content: trimmed,
                attachments: hasAttachments ? attachments : undefined,
            };

            if (!resolvedThreadId) {
                resolvedThreadId = crypto.randomUUID();
                const threadTitle = title ?? (trimmed.slice(0, 60) || 'Demo');
                setThreads((prev) => [
                    {
                        id: resolvedThreadId!,
                        title: threadTitle,
                        updatedAt: Date.now(),
                        messages: [userMessage],
                        claim: {},
                        isTyping: false,
                    },
                    ...prev,
                ]);
                setActiveThreadId(resolvedThreadId);
            } else {
                setThreads((prev) =>
                    prev.map((thread) =>
                        thread.id === resolvedThreadId
                            ? {
                                  ...thread,
                                  updatedAt: Date.now(),
                                  messages: [...thread.messages, userMessage],
                              }
                            : thread,
                    ),
                );
            }

            scheduleAssistantReply(resolvedThreadId, trimmed);
            return resolvedThreadId;
        },
        [activeThreadId, scheduleAssistantReply],
    );

    const regenerateAssistantReply = useCallback(
        async (threadId: string): Promise<void> => {
            let lastUserText = '';
            let shouldRegenerate = false;

            setThreads((prev) => {
                const thread = prev.find((entry) => entry.id === threadId);
                if (!thread || thread.isTyping) {
                    return prev;
                }

                const messagesWithoutLastAssistant = [...thread.messages];
                const lastMessage = messagesWithoutLastAssistant[messagesWithoutLastAssistant.length - 1];
                if (lastMessage?.role === 'ASSISTANT') {
                    messagesWithoutLastAssistant.pop();
                }

                for (let index = messagesWithoutLastAssistant.length - 1; index >= 0; index -= 1) {
                    const message = messagesWithoutLastAssistant[index];
                    if (message?.role === 'USER') {
                        lastUserText = message.content;
                        break;
                    }
                }

                if (!lastUserText) {
                    return prev;
                }

                shouldRegenerate = true;
                return prev.map((entry) =>
                    entry.id === threadId
                        ? {
                              ...entry,
                              messages: messagesWithoutLastAssistant,
                              updatedAt: Date.now(),
                          }
                        : entry,
                );
            });

            if (!shouldRegenerate || !lastUserText) return;

            setIsPending(true);
            scheduleAssistantReply(threadId, lastUserText);
        },
        [scheduleAssistantReply],
    );

    return {
        threads,
        activeThreadId,
        setActiveThreadId,
        activeThread,
        claimData,
        messages,
        isTyping,
        isPending,
        sendUserMessage,
        regenerateAssistantReply,
    };
}
