'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { LogOut, Shield, Trash2, User } from 'lucide-react';
import {
    ChatAppShell,
    ChatComposer,
    ChatHomeEmpty,
    type ChatHomeEmptyColumn,
    ChatKitRoot,
    ChatMessageList,
    ChatMessageRow,
    ChatSidebar,
    type ChatThread,
    ChatThreadDivider,
    ChatTopBar,
    ChatTypingIndicator,
    type PendingFile,
} from '@afalambe/ui/chat';
import { Button } from '@afalambe/ui/components/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { notifyApiException, notifyApiInfo, notifyApiWarning } from '@/lib/api-toast';
import { siteLogoDarkPath, siteLogoPath, siteName } from '@/lib/site';
import { trpc } from '@/lib/trpc';
import { inferMimeType, validateImage } from '@/lib/image-validation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import {
    FactCheckDetailsCard,
    stripFactCheckDetailsFooter,
} from '@/components/fact-check-details-card';
import { useAudioRecording } from '@/hooks/use-audio-recording';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useAutosizeTextArea } from '@/hooks/use-autosize-textarea';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useMessageOutbox, type OutboxEntry } from '@/hooks/use-message-outbox';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useRealtime } from '@/hooks/use-realtime';
import { whisperLanguageHint } from '@afalambe/ai/claim-language';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { detectLanguageFromText } from '@/lib/language-detection';
import { getPromptSuggestions } from '@/lib/languages';
import {
    clearAuthChatClientState,
    getActiveClaimId,
    messageOutboxStorageKey,
    setActiveClaimId,
} from '@/lib/chat-history-storage';
import { CHAT_CLAIM_LABELS, CHAT_HOME_UI, CHAT_TOASTS, CHAT_UI, getChatUILabel, uiLocaleToSupportedLanguage, type UiLocale } from '@/lib/ui-locale';

const COMPOSER_MAX_CHARS = 4000;

function whisperLanguageCode(text: string, uiLocale: UiLocale): string | undefined {
    return whisperLanguageHint({
        composerText: text,
        uiLocale,
        detect: detectLanguageFromText,
    });
}

async function blobToBase64(
    blob: Blob,
    errors: { readFailed: string; encodeFailed: string },
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                reject(new Error(errors.readFailed));
                return;
            }
            const base64 = result.split(',')[1];
            if (!base64) {
                reject(new Error(errors.encodeFailed));
                return;
            }
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error ?? new Error(errors.readFailed));
        reader.readAsDataURL(blob);
    });
}

// ---------------------------------------------------------------------------
// Verdict display helpers
// ---------------------------------------------------------------------------

const VERDICT_STYLES: Record<string, string> = {
    VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    DEBUNKED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    MISLEADING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    PARTIALLY_TRUE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
};

function verdictLabel(locale: 'fr' | 'en', status: string): string {
    const map: Record<string, string> = {
        VERIFIED: getChatUILabel(locale, 'verified'),
        DEBUNKED: getChatUILabel(locale, 'debunked'),
        MISLEADING: getChatUILabel(locale, 'misleading'),
        PARTIALLY_TRUE: getChatUILabel(locale, 'partiallyTrue'),
        PENDING: getChatUILabel(locale, 'pending'),
    };
    return map[status] ?? status;
}

// ---------------------------------------------------------------------------
// Home columns
// ---------------------------------------------------------------------------

function buildHomeColumns(locale: UiLocale): ChatHomeEmptyColumn[] {
    const lang = uiLocaleToSupportedLanguage(locale);
    const homeUi = CHAT_HOME_UI[locale];
    return [
        {
            id: 'examples',
            title: homeUi.examples,
            tone: 'examples',
            lines: getPromptSuggestions(lang),
        },
        {
            id: 'capabilities',
            title: homeUi.capabilities,
            tone: 'capabilities',
            lines: homeUi.capabilityLines,
        },
        {
            id: 'limitations',
            title: homeUi.limitations,
            tone: 'limitations',
            lines: homeUi.limitationLines,
        },
    ];
}

// ---------------------------------------------------------------------------
// Metadata header
// ---------------------------------------------------------------------------

function ClaimMetadataHeader({ claim, locale }: {
    claim: {
        sourceName?: string | null;
        platform?: string | null;
        topicCategory?: string | null;
        location?: string | null;
        claimLanguage?: string | null;
        factCheckStatus?: string | null;
    };
    locale: 'fr' | 'en';
}): ReactElement | null {
    const labels = CHAT_CLAIM_LABELS[locale];
    const tags = [
        claim.sourceName && `${labels.source}: ${claim.sourceName}`,
        claim.platform && `${labels.platform}: ${claim.platform}`,
        claim.topicCategory && `${labels.topic}: ${claim.topicCategory}`,
        claim.location && `${labels.location}: ${claim.location}`,
        claim.claimLanguage && `${labels.language}: ${claim.claimLanguage}`,
    ].filter(Boolean) as string[];

    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 px-4 py-2 text-xs text-[var(--chat-text-tertiary)] border-b border-[var(--chat-border-subtle)]">
            {tags.map((tag) => (
                <span key={tag}>{tag}</span>
            ))}
            {claim.factCheckStatus && claim.factCheckStatus !== 'PENDING' && (
                <span className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${VERDICT_STYLES[claim.factCheckStatus] ?? ''}`}>
                    {verdictLabel(locale, claim.factCheckStatus)}
                </span>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatPageClient({
    initialClaimId,
}: {
    initialClaimId?: string;
} = {}): ReactElement {
    const { href, push, replace } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const chatUi = CHAT_UI[locale];
    const chatToasts = CHAT_TOASTS[locale];
    const homeColumns = useMemo(() => buildHomeColumns(locale), [locale]);
    const isOnline = useOnlineStatus();
    const [collapsed, setCollapsed] = useState(false);
    const [composer, setComposer] = useState('');
    const [started, setStarted] = useState(false);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(initialClaimId ?? null);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [assistantTyping, setAssistantTyping] = useState(false);
    const [messageFeedback, setMessageFeedback] = useState<Record<string, 'GOOD' | 'BAD'>>({});
    const didRestoreRef = useRef(false);

    const trpcUtils = trpc.useUtils();
    const session = trpc.session.me.useQuery(undefined, { retry: false });
    const userId = session.data?.id;
    const threadsQuery = trpc.claim.listMine.useQuery(
        { search: searchQuery || undefined },
        { enabled: session.isSuccess },
    );
    const threadQuery = trpc.claim.byId.useQuery(
        { claimId: activeThreadId ?? '' },
        {
            enabled: Boolean(activeThreadId),
            refetchInterval: (query) => {
                const status = query.state.data?.status;
                if (status === 'PROCESSING') return 2_500;
                return false;
            },
        },
    );
    const createClaim = trpc.claim.create.useMutation();
    const appendMessage = trpc.claim.appendUserMessage.useMutation();
    const generateAssistantReply = trpc.claim.generateAssistantReply.useMutation();
    const submitMessageFeedback = trpc.claim.submitMessageFeedback.useMutation();
    const transcribeAudioMutation = trpc.claim.transcribeAudio.useMutation();
    const requestUpload = trpc.claim.requestUpload.useMutation();
    const logout = trpc.auth.logout.useMutation({
        onSuccess: async () => {
            if (userId) clearAuthChatClientState(userId);
            await trpcUtils.invalidate();
            push('/sign-in');
        },
    });

    // -----------------------------------------------------------------------
    // Message outbox (follow-up messages only)
    // -----------------------------------------------------------------------

    const outboxStorageKey = userId ? messageOutboxStorageKey(userId) : 'afalambe_message_outbox_anonymous';
    const outbox = useMessageOutbox(async (entry: OutboxEntry) => {
        await appendMessage.mutateAsync({
            claimId: entry.claimId,
            content: entry.content,
            clientRequestId: entry.id,
            attachments: entry.attachments.length > 0 ? entry.attachments : undefined,
        });
        await generateAssistantReply.mutateAsync({ claimId: entry.claimId });
        await trpcUtils.claim.listMine.invalidate();
        await trpcUtils.claim.byId.invalidate({ claimId: entry.claimId });
    }, { storageKey: outboxStorageKey });

    const { handleCopy } = useCopyToClipboard({
        copyMessage: chatUi.copySuccess,
        copyFailedMessage: chatUi.copyFailed,
    });
    const composerTextareaRef = useRef<HTMLTextAreaElement>(null);
    useAutosizeTextArea({
        ref: composerTextareaRef,
        maxHeight: 192,
        dependencies: [composer],
    });

    const claimData = threadQuery.data;
    const messages = claimData?.messages ?? [];

    const { containerRef: scrollContainerRef, handleScroll, handleTouchStart } = useAutoScroll([
        messages.length,
        generateAssistantReply.isPending,
        started,
    ]);

    const lastAssistantMessageId = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i -= 1) {
            const message = messages[i];
            if (message?.role === 'ASSISTANT') {
                return message.id;
            }
        }
        return null;
    }, [messages]);

    // -----------------------------------------------------------------------
    // Audio recording
    // -----------------------------------------------------------------------

    const { isRecording, isTranscribing, isSpeechSupported, toggleListening } = useAudioRecording({
        transcribeAudio: async (blob: Blob) => {
            const audioBase64 = await blobToBase64(blob, {
                readFailed: chatToasts.audioReadFailed,
                encodeFailed: chatToasts.audioEncodeFailed,
            });
            const mimeType = (blob.type || 'audio/webm').split(';')[0] ?? 'audio/webm';
            const result = await transcribeAudioMutation.mutateAsync({
                audioBase64,
                mimeType: mimeType as 'audio/webm' | 'audio/mp4' | 'audio/mpeg' | 'audio/wav' | 'audio/ogg',
                language: whisperLanguageCode(composer, locale),
            });
            return result.text;
        },
        onTranscriptionComplete: (text: string) => {
            setComposer((prev) => (prev ? `${prev} ${text}` : text));
        },
        onError: (message) => {
            notifyApiWarning({ title: chatToasts.sendFailed, description: message });
        },
        formatRecordingTooLarge: chatToasts.recordingTooLarge,
    });

    // -----------------------------------------------------------------------
    // Real-time
    // -----------------------------------------------------------------------

    useEffect(() => {
        setMessageFeedback({});
        setAssistantTyping(false);
    }, [activeThreadId]);

    useRealtime({
        claimId: activeThreadId,
        enabled: Boolean(activeThreadId),
        isGenerating: generateAssistantReply.isPending,
        onMessage: () => {
            if (activeThreadId) void trpcUtils.claim.byId.invalidate({ claimId: activeThreadId });
        },
        onStatusChange: () => {
            if (activeThreadId) void trpcUtils.claim.byId.invalidate({ claimId: activeThreadId });
            void trpcUtils.claim.listMine.invalidate();
        },
        onTypingChange: setAssistantTyping,
        onGapDetected: () => {
            if (activeThreadId) void trpcUtils.claim.byId.invalidate({ claimId: activeThreadId });
        },
    });

    // -----------------------------------------------------------------------
    // Auth redirects
    // -----------------------------------------------------------------------

    useEffect(() => {
        if (session.error?.data?.code === 'UNAUTHORIZED') {
            replace('/sign-in');
        }
    }, [replace, session.error]);

    useEffect(() => {
        if (session.data && !session.data.emailVerifiedAt) {
            replace(`/sign-up/verify?email=${encodeURIComponent(session.data.email)}`);
        }
    }, [replace, session.data]);

    // -----------------------------------------------------------------------
    // Restore last / deep-linked thread (feat-0041)
    // -----------------------------------------------------------------------

    useEffect(() => {
        if (!session.isSuccess || !userId || didRestoreRef.current) return;
        didRestoreRef.current = true;

        const claimId = initialClaimId ?? getActiveClaimId(userId);
        if (!claimId) return;

        setActiveThreadId(claimId);
        setStarted(true);
        setActiveClaimId(userId, claimId);
        if (!initialClaimId) {
            replace(`/chat/${claimId}`);
        }
    }, [initialClaimId, replace, session.isSuccess, userId]);

    useEffect(() => {
        if (!initialClaimId || initialClaimId === activeThreadId) return;
        setActiveThreadId(initialClaimId);
        setStarted(true);
        if (userId) setActiveClaimId(userId, initialClaimId);
    }, [activeThreadId, initialClaimId, userId]);

    useEffect(() => {
        if (!activeThreadId || !threadQuery.isError) return;
        if (userId) setActiveClaimId(userId, null);
        setActiveThreadId(null);
        setStarted(false);
        replace('/chat');
    }, [activeThreadId, replace, threadQuery.isError, userId]);

    const selectThread = useCallback(
        (threadId: string | null) => {
            setActiveThreadId(threadId);
            if (threadId) {
                setStarted(true);
                if (userId) setActiveClaimId(userId, threadId);
                replace(`/chat/${threadId}`);
                return;
            }
            setStarted(false);
            setComposer('');
            setPendingFiles([]);
            if (userId) setActiveClaimId(userId, null);
            replace('/chat');
        },
        [replace, userId],
    );

    // -----------------------------------------------------------------------
    // Threads
    // -----------------------------------------------------------------------

    const threads: ChatThread[] = useMemo(
        () =>
            (threadsQuery.data ?? []).map((thread) => ({
                id: thread.id,
                title: thread.title ?? chatToasts.untitledThread,
                updatedLabel: new Date(thread.updatedAt).toLocaleString(),
            })),
        [threadsQuery.data, chatToasts.untitledThread],
    );

    // -----------------------------------------------------------------------
    // Image handling
    // -----------------------------------------------------------------------

    const handleImageSelect = useCallback(async (file: File) => {
        const result = await validateImage(file, pendingFiles.length, locale);
        if (!result.valid) {
            notifyApiWarning({ title: chatToasts.imageRejected, description: result.error });
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setPendingFiles((prev) => [...prev, { file, previewUrl }]);
    }, [chatToasts.imageRejected, locale, pendingFiles.length]);

    const handleRemovePendingFile = useCallback((index: number) => {
        setPendingFiles((prev) => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    // -----------------------------------------------------------------------
    // Upload attachments
    // -----------------------------------------------------------------------

    async function uploadPendingFiles(
        claimId?: string,
    ): Promise<
        Array<{ url: string; mimeType: string; sizeBytes: number; uploadPath?: string }> | undefined
    > {
        if (pendingFiles.length === 0) return undefined;

        const attachments: Array<{
            url: string;
            mimeType: string;
            sizeBytes: number;
            uploadPath?: string;
        }> = [];
        for (const pf of pendingFiles) {
            const mimeType = inferMimeType(pf.file);
            const uploadTarget = await requestUpload.mutateAsync({
                claimId: claimId ?? undefined,
                filename: pf.file.name,
                mimeType,
                sizeBytes: pf.file.size,
            });
            const uploadResult = await fetch(uploadTarget.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': mimeType },
                body: pf.file,
            });
            if (!uploadResult.ok) {
                throw new Error(chatToasts.uploadFailed);
            }
            attachments.push({
                url: uploadTarget.readUrl,
                mimeType,
                sizeBytes: pf.file.size,
                uploadPath: uploadTarget.uploadPath,
            });
        }
        return attachments;
    }

    // -----------------------------------------------------------------------
    // Submit message
    // -----------------------------------------------------------------------

    const handleSubmit = useCallback(() => {
        const text = composer.trim();
        if (!text && pendingFiles.length === 0) {
            notifyApiWarning({
                title: chatToasts.nothingToSend,
                description: chatToasts.nothingToSendDescription,
            });
            return;
        }

        void (async () => {
            try {
                const detectedLang = text ? detectLanguageFromText(text) : 'fr';
                const hasImages = pendingFiles.length > 0;
                const mediaType = hasImages ? 'TEXT_IMAGE' : 'TEXT';

                let newClaimId: string | null = null;
                if (!activeThreadId) {
                    const attachments = await uploadPendingFiles();
                    const created = await createClaim.mutateAsync({
                        content: text || chatToasts.imageAttachment,
                        title: text ? text.slice(0, 60) : chatToasts.imageOnlyClaim,
                        clientRequestId: crypto.randomUUID(),
                        attachments,
                        metadata: {
                            claimLanguage: detectedLang,
                            mediaType: mediaType as 'TEXT' | 'TEXT_IMAGE',
                        },
                    });
                    newClaimId = created.claimId;
                    setActiveThreadId(created.claimId);
                    setStarted(true);
                    if (userId) setActiveClaimId(userId, created.claimId);
                    replace(`/chat/${created.claimId}`);
                    setComposer('');
                    for (const pf of pendingFiles) URL.revokeObjectURL(pf.previewUrl);
                    setPendingFiles([]);
                    await generateAssistantReply.mutateAsync({ claimId: created.claimId });
                } else {
                    const attachments = await uploadPendingFiles(activeThreadId);
                    outbox.enqueue({
                        id: crypto.randomUUID(),
                        claimId: activeThreadId,
                        content: text || chatToasts.imageAttachment,
                        attachments: attachments ?? [],
                    });
                    setComposer('');
                    for (const pf of pendingFiles) URL.revokeObjectURL(pf.previewUrl);
                    setPendingFiles([]);
                    void outbox.flush();
                }
                setStarted(true);
                await trpcUtils.claim.listMine.invalidate();
                const threadIdToRefresh = newClaimId ?? activeThreadId;
                if (threadIdToRefresh) {
                    await trpcUtils.claim.byId.invalidate({ claimId: threadIdToRefresh });
                }
            } catch (error) {
                notifyApiException(error, chatToasts.sendFailed);
            }
        })();
    }, [
        activeThreadId,
        composer,
        createClaim,
        generateAssistantReply,
        outbox,
        pendingFiles,
        chatToasts.imageAttachment,
        chatToasts.imageOnlyClaim,
        chatToasts.nothingToSend,
        chatToasts.nothingToSendDescription,
        chatToasts.sendFailed,
        replace,
        requestUpload,
        trpcUtils.claim.byId,
        trpcUtils.claim.listMine,
        userId,
    ]);

    // -----------------------------------------------------------------------
    // Actions
    // -----------------------------------------------------------------------

    const handleExampleLine = useCallback((line: string) => {
        setComposer(line);
    }, []);

    const handleMessageFeedback = useCallback(
        (messageId: string, rating: 'GOOD' | 'BAD') => {
            if (!activeThreadId || submitMessageFeedback.isPending) return;

            void submitMessageFeedback.mutateAsync(
                { claimId: activeThreadId, messageId, rating },
                {
                    onSuccess: () => {
                        setMessageFeedback((prev) => ({ ...prev, [messageId]: rating }));
                        notifyApiInfo({ title: chatUi.feedbackThanks });
                    },
                    onError: (error) => {
                        notifyApiException(error, chatToasts.feedbackFailed);
                    },
                },
            );
        },
        [activeThreadId, chatToasts.feedbackFailed, chatUi.feedbackThanks, submitMessageFeedback],
    );

    const handleRegenerate = useCallback(() => {
        if (!activeThreadId || generateAssistantReply.isPending) return;

        void (async () => {
            try {
                await generateAssistantReply.mutateAsync({
                    claimId: activeThreadId,
                    replaceLastAssistant: true,
                });
                await trpcUtils.claim.byId.invalidate({ claimId: activeThreadId });
                await trpcUtils.claim.listMine.invalidate();
            } catch (error) {
                notifyApiException(error, chatToasts.regenerateFailed);
            }
        })();
    }, [activeThreadId, chatToasts.regenerateFailed, generateAssistantReply, trpcUtils.claim.byId, trpcUtils.claim.listMine]);

    const handleClearConversations = useCallback(() => {
        selectThread(null);
        notifyApiInfo({
            title: chatToasts.selectionCleared,
            description: chatToasts.selectionClearedDescription,
        });
    }, [chatToasts.selectionCleared, chatToasts.selectionClearedDescription, selectThread]);

    // -----------------------------------------------------------------------
    // Navigation footer
    // -----------------------------------------------------------------------

    const navigationFooter = useMemo(
        () => (
            <div className="flex flex-col gap-0.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                    onClick={handleClearConversations}
                >
                    <Trash2 className="size-4 shrink-0 opacity-90" />
                    {chatUi.clearConversations}
                </Button>
                <div className="flex h-9 w-full items-center justify-between gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)]">
                    <span className="text-xs text-[var(--chat-sidebar-muted)]">{chatUi.localeLabel}</span>
                    <LocaleSwitcher />
                </div>
                <div className="flex h-9 w-full items-center justify-between gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)]">
                    <span className="text-xs text-[var(--chat-sidebar-muted)]">{chatUi.theme}</span>
                    <ThemeToggle className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-sidebar-item-hover)] hover:text-[var(--chat-control-icon-hover)]" />
                </div>
                {session.data?.role === 'ADMIN' ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={href('/admin/queue')} />}
                        className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                    >
                        <Shield className="size-4 shrink-0 opacity-90" />
                        {chatUi.adminQueue}
                    </Button>
                ) : null}
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={href('/sign-in')} />}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <User className="size-4 shrink-0 opacity-90" />
                    {chatUi.myAccount}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout.mutate()}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <LogOut className="size-4 shrink-0 opacity-90" />
                    {chatUi.signOut}
                </Button>
            </div>
        ),
        [chatUi, handleClearConversations, locale, logout, session.data?.role],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    const sidebarLabels = useMemo(
        () => ({
            expandSidebarAria: chatUi.expandSidebarAria,
            collapseSidebarAria: chatUi.collapseSidebarAria,
            newChat: chatUi.newChat,
            searchChatsPlaceholder: chatUi.searchChatsPlaceholder,
            chatHistoryAria: chatUi.chatHistoryAria,
        }),
        [chatUi],
    );

    const messageActionLabels = useMemo(
        () => ({
            copyAria: chatUi.copyAria,
            regenerateAria: chatUi.regenerateAria,
            thumbsUpAria: chatUi.thumbsUpAria,
            thumbsDownAria: chatUi.thumbsDownAria,
        }),
        [chatUi],
    );

    const sidebar = (
        <ChatSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            threads={threads}
            activeThreadId={activeThreadId}
            labels={sidebarLabels}
            onThreadSelect={(threadId) => {
                selectThread(threadId);
            }}
            onNewChat={() => {
                selectThread(null);
            }}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            navigationFooter={navigationFooter}
            footer={<span className="leading-relaxed">{chatUi.sidebarFooter}</span>}
        />
    );

    return (
        <ChatKitRoot>
            <ChatAppShell sidebar={sidebar}>
                <ChatTopBar
                    title={siteName}
                    subtitle={chatUi.subtitle}
                    brandLogoSrc={siteLogoPath}
                    brandLogoDarkSrc={siteLogoDarkPath}
                    brandLogoAlt={siteName}
                    moreOptionsAria={chatUi.moreOptionsAria}
                />

                {claimData && started && (
                    <ClaimMetadataHeader claim={claimData} locale={locale} />
                )}

                <ChatMessageList
                    innerClassName={started ? undefined : 'max-w-6xl'}
                    scrollContainerRef={scrollContainerRef}
                    onScroll={handleScroll}
                    onTouchStart={handleTouchStart}
                >
                    {!started ? (
                        <ChatHomeEmpty
                            columns={homeColumns}
                            onLineClick={handleExampleLine}
                        />
                    ) : (
                        <>
                            <ChatThreadDivider label={chatUi.today} />
                            {messages.map((message) => {
                                const prose =
                                    message.role === 'ASSISTANT'
                                        ? stripFactCheckDetailsFooter(message.content)
                                        : message.content;
                                const attachmentUrls =
                                    message.role === 'ASSISTANT'
                                        ? messages
                                              .filter((m) => m.role === 'USER' && Array.isArray(m.attachments))
                                              .flatMap((m) =>
                                                  (m.attachments as Array<{ url?: string; mimeType?: string }>).map(
                                                      (attachment) => attachment,
                                                  ),
                                              )
                                        : [];
                                const sourceUrls = attachmentUrls
                                    .map((attachment) => attachment.url)
                                    .filter((url): url is string => Boolean(url));
                                const sourceMimeTypes = Object.fromEntries(
                                    attachmentUrls
                                        .filter(
                                            (attachment): attachment is { url: string; mimeType: string } =>
                                                Boolean(attachment.url && attachment.mimeType),
                                        )
                                        .map((attachment) => [attachment.url, attachment.mimeType]),
                                );

                                return (
                                <ChatMessageRow
                                    key={message.id}
                                    role={message.role.toLowerCase() as 'user' | 'assistant' | 'system'}
                                    showAssistantActions={message.role === 'ASSISTANT'}
                                    actionLabels={messageActionLabels}
                                    onCopy={() => handleCopy(message.content)}
                                    onRegenerate={
                                        message.id === lastAssistantMessageId &&
                                        !generateAssistantReply.isPending
                                            ? handleRegenerate
                                            : undefined
                                    }
                                    onThumbsUp={() => handleMessageFeedback(message.id, 'GOOD')}
                                    onThumbsDown={() => handleMessageFeedback(message.id, 'BAD')}
                                    feedbackRating={messageFeedback[message.id] ?? null}
                                >
                                    <p className="whitespace-pre-wrap">{prose}</p>

                                    {message.role === 'ASSISTANT' && claimData ? (
                                        <FactCheckDetailsCard
                                            locale={locale}
                                            factCheckStatus={claimData.factCheckStatus}
                                            factCheckDate={claimData.factCheckDate}
                                            topicCategory={claimData.topicCategory}
                                            location={claimData.location}
                                            claimDate={claimData.claimDate}
                                            sourceName={claimData.sourceName}
                                            sourceType={claimData.sourceType}
                                            platform={claimData.platform}
                                            sourceUrl={claimData.sourceUrl}
                                            sourceUrls={sourceUrls}
                                            sourceMimeTypes={sourceMimeTypes}
                                        />
                                    ) : null}

                                    {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {message.attachments.map((attachment: { url: string; mimeType: string }) =>
                                                attachment.mimeType?.startsWith('image/') ? (
                                                    <a
                                                        key={attachment.url}
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={attachment.url}
                                                            alt={chatUi.uploadedEvidenceAlt}
                                                            className="max-h-48 max-w-48 rounded-lg border border-[var(--chat-border-subtle)] object-contain"
                                                        />
                                                    </a>
                                                ) : null,
                                            )}
                                        </div>
                                    )}
                                </ChatMessageRow>
                                );
                            })}
                            {(generateAssistantReply.isPending || assistantTyping) && (
                                <div className="pl-1">
                                    <ChatTypingIndicator ariaLabel={chatUi.assistantTyping} />
                                </div>
                            )}
                        </>
                    )}
                </ChatMessageList>

                {outbox.failedCount > 0 && (
                    <div className="flex items-center justify-between gap-2 border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                        <span>{chatUi.outboxFailedSummary(outbox.failedCount)}</span>
                        <button
                            type="button"
                            className="font-medium underline hover:no-underline"
                            onClick={() => {
                                for (const entry of outbox.entries) {
                                    if (entry.status === 'failed') outbox.retry(entry.id);
                                }
                            }}
                        >
                            {chatUi.retryFailed}
                        </button>
                    </div>
                )}

                <ChatComposer
                    value={composer}
                    onChange={setComposer}
                    onSubmit={handleSubmit}
                    placeholder={chatUi.placeholder}
                    offlineMessage={chatUi.offlineBanner}
                    disclaimer={chatUi.aiDisclaimer}
                    attachImageAria={chatUi.attachImageAria}
                    startRecordingAria={chatUi.startRecordingAria}
                    stopRecordingAria={chatUi.stopRecordingAria}
                    recordingPlaceholder={chatUi.recordingPlaceholder}
                    composeAria={chatUi.composeAria}
                    sendAria={chatUi.sendAria}
                    removeAttachmentAria={chatUi.removeAttachmentAria}
                    textareaRef={composerTextareaRef}
                    maxLength={COMPOSER_MAX_CHARS}
                    charCounterThreshold={3500}
                    disabled={
                        session.isLoading ||
                        createClaim.isPending ||
                        appendMessage.isPending ||
                        generateAssistantReply.isPending
                    }
                    onImageSelect={handleImageSelect}
                    pendingFiles={pendingFiles}
                    onRemovePendingFile={handleRemovePendingFile}
                    onMicToggle={toggleListening}
                    isRecording={isRecording}
                    isTranscribing={isTranscribing}
                    isMicSupported={isSpeechSupported}
                    isOffline={!isOnline}
                />
            </ChatAppShell>
        </ChatKitRoot>
    );
}
