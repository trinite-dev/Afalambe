'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { Trash2, User } from 'lucide-react';
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
import { FactCheckDetailsCard, stripFactCheckDetailsFooter } from '@/components/fact-check-details-card';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAudioRecording } from '@/hooks/use-audio-recording';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useAutosizeTextArea } from '@/hooks/use-autosize-textarea';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useDemoSession } from '@/hooks/use-demo-session';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useMessageOutbox, type OutboxEntry } from '@/hooks/use-message-outbox';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { notifyApiInfo, notifyApiWarning } from '@/lib/api-toast';
import { getDemoExampleScenarios } from '@/lib/demo-scenarios';
import { DEMO_UI } from '@/lib/demo-ui';
import { inferMimeType, validateImage } from '@/lib/image-validation';
import { siteLogoDarkPath, siteLogoPath, siteName } from '@/lib/site';
import {
    CHAT_CLAIM_LABELS,
    CHAT_HOME_UI,
    CHAT_TOASTS,
    CHAT_UI,
    getChatUILabel,
    type UiLocale,
} from '@/lib/ui-locale';

const COMPOSER_MAX_CHARS = 4000;

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

function buildHomeColumns(locale: UiLocale): ChatHomeEmptyColumn[] {
    const homeUi = CHAT_HOME_UI[locale];
    const demoExamples = getDemoExampleScenarios(locale);
    return [
        {
            id: 'examples',
            title: homeUi.examples,
            tone: 'examples',
            lines: demoExamples.map((scenario) => scenario.exampleLine),
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

function ClaimMetadataHeader({
    claim,
    locale,
}: {
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
        <div className="flex flex-wrap gap-2 border-b border-[var(--chat-border-subtle)] px-4 py-2 text-xs text-[var(--chat-text-tertiary)]">
            {tags.map((tag) => (
                <span key={tag}>{tag}</span>
            ))}
            {claim.factCheckStatus ? (
                <span
                    className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${VERDICT_STYLES[claim.factCheckStatus] ?? ''}`}
                >
                    {verdictLabel(locale, claim.factCheckStatus)}
                </span>
            ) : null}
        </div>
    );
}

export function DemoPageClient(): ReactElement {
    const { href } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const demoUi = DEMO_UI[locale];
    const chatUi = CHAT_UI[locale];
    const chatToasts = CHAT_TOASTS[locale];
    const homeColumns = useMemo(() => buildHomeColumns(locale), [locale]);
    const isOnline = useOnlineStatus();

    const [collapsed, setCollapsed] = useState(false);
    const [composer, setComposer] = useState('');
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageFeedback, setMessageFeedback] = useState<Record<string, 'GOOD' | 'BAD'>>({});

    const {
        threads: demoThreads,
        activeThreadId,
        setActiveThreadId,
        claimData,
        messages,
        isTyping,
        isPending,
        sendUserMessage,
        regenerateAssistantReply,
    } = useDemoSession(locale);

    const [started, setStarted] = useState(() => Boolean(activeThreadId));

    const outbox = useMessageOutbox(
        async (entry: OutboxEntry) => {
            await sendUserMessage({
                threadId: entry.claimId,
                content: entry.content,
                attachments: entry.attachments.map((attachment) => ({
                    url: attachment.url,
                    mimeType: attachment.mimeType,
                })),
            });
        },
        { storageKey: 'afalambe_demo_message_outbox' },
    );

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

    const { containerRef: scrollContainerRef, handleScroll, handleTouchStart } = useAutoScroll([
        messages.length,
        isPending,
        isTyping,
        started,
    ]);

    const lastAssistantMessageId = useMemo(() => {
        for (let index = messages.length - 1; index >= 0; index -= 1) {
            const message = messages[index];
            if (message?.role === 'ASSISTANT') {
                return message.id;
            }
        }
        return null;
    }, [messages]);

    useEffect(() => {
        setMessageFeedback({});
    }, [activeThreadId]);

    const { isRecording, isTranscribing, isSpeechSupported, toggleListening } = useAudioRecording({
        transcribeAudio: async () => {
            await new Promise((resolve) => setTimeout(resolve, 400));
            return demoUi.voiceTranscript;
        },
        onTranscriptionComplete: (text: string) => {
            setComposer((prev) => (prev ? `${prev} ${text}` : text));
        },
        onError: (message) => {
            notifyApiWarning({ title: chatToasts.sendFailed, description: message });
        },
        formatRecordingTooLarge: chatToasts.recordingTooLarge,
    });

    const threads: ChatThread[] = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        return demoThreads
            .filter((thread) =>
                normalizedQuery ? thread.title.toLowerCase().includes(normalizedQuery) : true,
            )
            .map((thread) => ({
                id: thread.id,
                title: thread.title || chatToasts.untitledThread,
                updatedLabel: new Date(thread.updatedAt).toLocaleString(),
            }));
    }, [chatToasts.untitledThread, demoThreads, searchQuery]);

    const handleImageSelect = useCallback(
        async (file: File) => {
            const result = await validateImage(file, pendingFiles.length, locale);
            if (!result.valid) {
                notifyApiWarning({ title: chatToasts.imageRejected, description: result.error });
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            setPendingFiles((prev) => [...prev, { file, previewUrl }]);
        },
        [chatToasts.imageRejected, locale, pendingFiles.length],
    );

    const handleRemovePendingFile = useCallback((index: number) => {
        setPendingFiles((prev) => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, fileIndex) => fileIndex !== index);
        });
    }, []);

    const buildAttachmentsFromPending = useCallback(() => {
        if (pendingFiles.length === 0) return undefined;
        return pendingFiles.map((pendingFile) => ({
            url: pendingFile.previewUrl,
            mimeType: inferMimeType(pendingFile.file),
        }));
    }, [pendingFiles]);

    const clearPendingFiles = useCallback(() => {
        for (const pendingFile of pendingFiles) {
            URL.revokeObjectURL(pendingFile.previewUrl);
        }
        setPendingFiles([]);
    }, [pendingFiles]);

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
                const attachments = buildAttachmentsFromPending();
                const content = text || chatToasts.imageAttachment;
                const title = text ? text.slice(0, 60) : chatToasts.imageOnlyClaim;

                if (!activeThreadId) {
                    await sendUserMessage({
                        content,
                        attachments,
                        title,
                    });
                    setStarted(true);
                    setComposer('');
                    clearPendingFiles();
                } else {
                    outbox.enqueue({
                        id: crypto.randomUUID(),
                        claimId: activeThreadId,
                        content,
                        attachments:
                            attachments?.map((attachment, index) => ({
                                url: attachment.url,
                                mimeType: attachment.mimeType,
                                sizeBytes: pendingFiles[index]?.file.size ?? 0,
                            })) ?? [],
                    });
                    setComposer('');
                    clearPendingFiles();
                    void outbox.flush();
                }

                setStarted(true);
            } catch {
                notifyApiWarning({ title: chatToasts.sendFailed });
            }
        })();
    }, [
        activeThreadId,
        buildAttachmentsFromPending,
        chatToasts.imageAttachment,
        chatToasts.imageOnlyClaim,
        chatToasts.nothingToSend,
        chatToasts.nothingToSendDescription,
        chatToasts.sendFailed,
        clearPendingFiles,
        composer,
        outbox,
        pendingFiles,
        sendUserMessage,
    ]);

    const handleExampleLine = useCallback((line: string) => {
        setComposer(line);
    }, []);

    const handleMessageFeedback = useCallback(
        (messageId: string, rating: 'GOOD' | 'BAD') => {
            setMessageFeedback((prev) => ({ ...prev, [messageId]: rating }));
            notifyApiInfo({ title: chatUi.feedbackThanks });
        },
        [chatUi.feedbackThanks],
    );

    const handleRegenerate = useCallback(() => {
        if (!activeThreadId || isPending || isTyping) return;
        void regenerateAssistantReply(activeThreadId);
    }, [activeThreadId, isPending, isTyping, regenerateAssistantReply]);

    const handleClearConversations = useCallback(() => {
        for (const pendingFile of pendingFiles) {
            URL.revokeObjectURL(pendingFile.previewUrl);
        }
        setActiveThreadId(null);
        setStarted(false);
        setComposer('');
        setPendingFiles([]);
        notifyApiInfo({
            title: chatToasts.selectionCleared,
            description: chatToasts.selectionClearedDescription,
        });
    }, [
        chatToasts.selectionCleared,
        chatToasts.selectionClearedDescription,
        pendingFiles,
        setActiveThreadId,
    ]);

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
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={href('/sign-up')} />}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <User className="size-4 shrink-0 opacity-90" />
                    {demoUi.signUpCta}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={href('/sign-in')} />}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <User className="size-4 shrink-0 opacity-90" />
                    {demoUi.signInCta}
                </Button>
            </div>
        ),
        [chatUi, demoUi.signInCta, demoUi.signUpCta, handleClearConversations, href],
    );

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
            onToggleCollapse={() => setCollapsed((value) => !value)}
            threads={threads}
            activeThreadId={activeThreadId}
            labels={sidebarLabels}
            onThreadSelect={(threadId) => {
                setActiveThreadId(threadId);
                setStarted(true);
            }}
            onNewChat={() => {
                setStarted(false);
                setComposer('');
                setActiveThreadId(null);
                setPendingFiles([]);
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
                <div
                    className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                    role="status"
                >
                    {demoUi.disclaimer}
                </div>

                <ChatTopBar
                    title={siteName}
                    subtitle={chatUi.subtitle}
                    brandLogoSrc={siteLogoPath}
                    brandLogoDarkSrc={siteLogoDarkPath}
                    brandLogoAlt={siteName}
                    moreOptionsAria={chatUi.moreOptionsAria}
                />

                {claimData && started && <ClaimMetadataHeader claim={claimData} locale={locale} />}

                <ChatMessageList
                    innerClassName={started ? undefined : 'max-w-6xl'}
                    scrollContainerRef={scrollContainerRef}
                    onScroll={handleScroll}
                    onTouchStart={handleTouchStart}
                >
                    {!started ? (
                        <ChatHomeEmpty columns={homeColumns} onLineClick={handleExampleLine} />
                    ) : (
                        <>
                            <ChatThreadDivider label={chatUi.today} />
                            {messages.map((message) => {
                                const prose =
                                    message.role === 'ASSISTANT'
                                        ? stripFactCheckDetailsFooter(message.content)
                                        : message.content;
                                const userAttachments =
                                    message.role === 'ASSISTANT'
                                        ? messages
                                              .filter((m) => m.role === 'USER' && Array.isArray(m.attachments))
                                              .flatMap((m) => m.attachments ?? [])
                                        : [];
                                const attachmentUrls = userAttachments.map((attachment) => attachment.url).filter(Boolean);
                                const sourceMimeTypes = Object.fromEntries(
                                    userAttachments
                                        .filter((attachment) => attachment.url && attachment.mimeType)
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
                                        message.id === lastAssistantMessageId && !isPending && !isTyping
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
                                            sourceUrls={[
                                                ...(claimData.sourceUrls ?? []),
                                                ...attachmentUrls,
                                            ]}
                                            sourceMimeTypes={sourceMimeTypes}
                                        />
                                    ) : null}

                                    {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {message.attachments.map((attachment) =>
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
                            {(isPending || isTyping) && (
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
                    disabled={isPending || isTyping}
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
