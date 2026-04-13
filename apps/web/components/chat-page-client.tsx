'use client';

import { useCallback, useMemo, useState, type ReactElement } from 'react';
import Link from 'next/link';
import {
    ExternalLink,
    LogOut,
    Trash2,
    User,
} from 'lucide-react';
import {
    ChatAppShell,
    ChatCodeSnippet,
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
} from '@afalambe/ui/chat';
import { Button } from '@afalambe/ui/components/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { notifyApiInfo, notifyApiWarning } from '@/lib/api-toast';
import { siteLogoDarkPath, siteLogoPath, siteName } from '@/lib/site';

const initialThreads: ChatThread[] = [
    {
        id: '1',
        title: 'Claim about local election messaging',
        updatedLabel: 'Yesterday',
    },
    {
        id: '2',
        title: 'Video authenticity question',
        updatedLabel: 'Last week',
    },
];

const homeColumns: ChatHomeEmptyColumn[] = [
    {
        id: 'examples',
        title: 'Examples',
        tone: 'examples',
        lines: [
            'Explain a claim in simple terms',
            'What can Afalambe verify for me?',
            'Compare two versions of a story I heard',
            'How do I submit a screenshot or link?',
        ],
    },
    {
        id: 'capabilities',
        title: 'Capabilities',
        tone: 'capabilities',
        lines: [
            'Keeps earlier turns in this session for context',
            'Queues uncertain claims for human review when needed',
            'Accepts claim text in multiple languages, including Fula and Peul',
            'Grounds answers in curated sources when confidence is high',
        ],
    },
    {
        id: 'limitations',
        title: 'Limitations',
        tone: 'limitations',
        lines: [
            'May miss nuance if the claim lacks enough detail',
            'Not legal, medical, or official government advice',
            'Cannot browse the open web like a general search engine',
            'Demo UI only until sign-in and API are connected',
        ],
    },
];

export function ChatPageClient(): ReactElement {
    const [collapsed, setCollapsed] = useState(false);
    const [composer, setComposer] = useState('');
    const [started, setStarted] = useState(false);
    const [showTyping, setShowTyping] = useState(false);
    const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
    /** Last user text shown in the thread (composer row or example click). */
    const [threadSeed, setThreadSeed] = useState<string>('');

    const handleSubmit = useCallback(() => {
        const text = composer.trim();
        if (!text) {
            notifyApiWarning({
                title: 'Nothing to send',
                description: 'Enter your claim or question before sending.',
            });
            return;
        }
        setThreadSeed(text);
        setComposer('');
        setStarted(true);
        setShowTyping(true);
        window.setTimeout(() => setShowTyping(false), 1400);
    }, [composer]);

    const handleExampleLine = useCallback((line: string) => {
        setThreadSeed(line);
        setComposer(line);
        setStarted(true);
        setShowTyping(true);
        window.setTimeout(() => setShowTyping(false), 1400);
    }, []);

    const handleClearConversations = useCallback(() => {
        setThreads([]);
        notifyApiInfo({
            title: 'Conversations cleared',
            description: 'This preview only clears the sample list in your browser.',
        });
    }, []);

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
                    Clear conversations
                </Button>
                <div className="flex h-9 w-full items-center justify-between gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)]">
                    <span className="text-xs text-[var(--chat-sidebar-muted)]">Theme</span>
                    <ThemeToggle className="text-[var(--chat-control-icon)] hover:bg-[var(--chat-sidebar-item-hover)] hover:text-[var(--chat-control-icon-hover)]" />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href="/sign-in" />}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <User className="size-4 shrink-0 opacity-90" />
                    My account
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href="/#faq" />}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <ExternalLink className="size-4 shrink-0 opacity-90" />
                    {'Updates & FAQ'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href="/" />}
                    className="h-9 w-full justify-start gap-2 rounded-[var(--chat-radius-sm)] px-2 text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                >
                    <LogOut className="size-4 shrink-0 opacity-90" />
                    Log out
                </Button>
            </div>
        ),
        [handleClearConversations],
    );

    const sidebar = (
        <ChatSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            threads={threads}
            onNewChat={() => {
                setStarted(false);
                setComposer('');
                setThreadSeed('');
            }}
            navigationFooter={navigationFooter}
            footer={
                <span className="leading-relaxed">
                    Demo UI only. Sign-in and persistence ship per web.md.
                </span>
            }
        />
    );

    return (
        <ChatKitRoot>
            <ChatAppShell sidebar={sidebar}>
                <ChatTopBar
                    title={siteName}
                    subtitle="Claims assistant"
                    brandLogoSrc={siteLogoPath}
                    brandLogoDarkSrc={siteLogoDarkPath}
                    brandLogoAlt={siteName}
                />
                <ChatMessageList innerClassName={started ? undefined : 'max-w-6xl'}>
                    {!started ? (
                        <ChatHomeEmpty
                            columns={homeColumns}
                            onLineClick={handleExampleLine}
                        />
                    ) : (
                        <>
                            <ChatThreadDivider label="Today" />
                            <ChatMessageRow role="user">{threadSeed}</ChatMessageRow>
                            <ChatMessageRow role="assistant" showAssistantActions>
                                <p className="mb-3">
                                    I can compare what you share to curated sources and flag uncertainty.
                                    Below is an example code block pattern from the UI kit.
                                </p>
                                <ChatCodeSnippet
                                    language="typescript"
                                    code={`const status = confidence >= 0.82 ? "verified_path" : "queued_human";`}
                                />
                            </ChatMessageRow>
                            {showTyping ? (
                                <div className="pl-1">
                                    <ChatTypingIndicator />
                                </div>
                            ) : null}
                        </>
                    )}
                </ChatMessageList>
                <ChatComposer
                    value={composer}
                    onChange={setComposer}
                    onSubmit={handleSubmit}
                    placeholder="Type message"
                />
            </ChatAppShell>
        </ChatKitRoot>
    );
}
