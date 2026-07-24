import type * as React from 'react';
import { MessageSquare, MoreHorizontal, PanelLeftClose, Plus, Search } from 'lucide-react';

import { Button } from '../ui/button';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '../ui/menu';
import { cn } from '../../lib/utils';

export type ChatThread = {
    id: string;
    title: string;
    updatedLabel?: string;
};

export type ChatThreadGroup = {
    label: string;
    threads: ChatThread[];
};

export type ChatSidebarLabels = {
    expandSidebarAria: string;
    collapseSidebarAria: string;
    newChat: string;
    searchChatsPlaceholder: string;
    chatHistoryAria: string;
    renameThread?: string;
    deleteThread?: string;
    threadActionsAria?: string;
    loadMoreChats?: string;
    loadingThreads?: string;
};

const defaultLabels: ChatSidebarLabels = {
    expandSidebarAria: 'Developper la barre laterale',
    collapseSidebarAria: 'Reduire la barre laterale',
    newChat: 'Nouveau chat',
    searchChatsPlaceholder: 'Rechercher des chats',
    chatHistoryAria: 'Historique des chats',
    renameThread: 'Renommer',
    deleteThread: 'Supprimer',
    threadActionsAria: 'Actions du chat',
    loadMoreChats: 'Charger plus',
    loadingThreads: 'Chargement...',
};

export type ChatSidebarProps = {
    threads?: ChatThread[];
    groupedThreads?: ChatThreadGroup[];
    activeThreadId?: string | null;
    loading?: boolean;
    emptyState?: React.ReactNode;
    hasMore?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    onNewChat?: () => void;
    onThreadSelect?: (threadId: string) => void;
    onThreadRename?: (threadId: string) => void;
    onThreadDelete?: (threadId: string) => void;
    onToggleCollapse?: () => void;
    collapsed?: boolean;
    className?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    labels?: Partial<ChatSidebarLabels>;
    /** Primary sidebar utilities (clear history, theme, account, FAQ, sign out). Rendered above optional footer. */
    navigationFooter?: React.ReactNode;
    /** Optional small print or status below navigation. */
    footer?: React.ReactNode;
};

function ThreadRow({
    thread,
    active,
    labels,
    onThreadSelect,
    onThreadRename,
    onThreadDelete,
}: {
    thread: ChatThread;
    active: boolean;
    labels: ChatSidebarLabels;
    onThreadSelect?: (threadId: string) => void;
    onThreadRename?: (threadId: string) => void;
    onThreadDelete?: (threadId: string) => void;
}): React.ReactElement {
    const showActions = Boolean(onThreadRename || onThreadDelete);

    return (
        <li className="group relative">
            <button
                type="button"
                onClick={() => onThreadSelect?.(thread.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'flex w-full items-start gap-2 rounded-[var(--chat-radius-md)] px-2.5 py-2 text-left text-sm text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--chat-composer-ring)]',
                    active && 'bg-[var(--chat-sidebar-item-active)]',
                    showActions && 'pe-9',
                )}
            >
                <MessageSquare
                    className="mt-0.5 size-4 shrink-0 text-[var(--chat-sidebar-muted)]"
                    aria-hidden
                />
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{thread.title}</span>
                    {thread.updatedLabel ? (
                        <span className="block truncate text-xs text-[var(--chat-sidebar-muted)]">
                            {thread.updatedLabel}
                        </span>
                    ) : null}
                </span>
            </button>
            {showActions ? (
                <Menu>
                    <MenuTrigger
                        type="button"
                        aria-label={labels.threadActionsAria}
                        className="absolute top-1.5 right-1 flex size-7 items-center justify-center rounded-[var(--chat-radius-sm)] text-[var(--chat-sidebar-muted)] opacity-0 transition-opacity hover:bg-[var(--chat-sidebar-item-hover)] hover:text-[var(--chat-sidebar-foreground)] group-hover:opacity-100 group-focus-within:opacity-100"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <MoreHorizontal className="size-4" />
                    </MenuTrigger>
                    <MenuPopup align="end" className="min-w-36">
                        {onThreadRename ? (
                            <MenuItem onClick={() => onThreadRename(thread.id)}>
                                {labels.renameThread}
                            </MenuItem>
                        ) : null}
                        {onThreadDelete ? (
                            <MenuItem variant="destructive" onClick={() => onThreadDelete(thread.id)}>
                                {labels.deleteThread}
                            </MenuItem>
                        ) : null}
                    </MenuPopup>
                </Menu>
            ) : null}
        </li>
    );
}

function ThreadSections({
    groups,
    activeThreadId,
    labels,
    onThreadSelect,
    onThreadRename,
    onThreadDelete,
}: {
    groups: ChatThreadGroup[];
    activeThreadId?: string | null;
    labels: ChatSidebarLabels;
    onThreadSelect?: (threadId: string) => void;
    onThreadRename?: (threadId: string) => void;
    onThreadDelete?: (threadId: string) => void;
}): React.ReactElement {
    return (
        <>
            {groups.map((group) => (
                <div key={group.label} className="mb-3 last:mb-0">
                    <p className="px-2.5 pb-1 text-xs font-medium uppercase tracking-wide text-[var(--chat-sidebar-muted)]">
                        {group.label}
                    </p>
                    <ul className="flex flex-col gap-0.5">
                        {group.threads.map((thread) => (
                            <ThreadRow
                                key={thread.id}
                                thread={thread}
                                active={thread.id === activeThreadId}
                                labels={labels}
                                onThreadSelect={onThreadSelect}
                                onThreadRename={onThreadRename}
                                onThreadDelete={onThreadDelete}
                            />
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
}

export function ChatSidebar({
    threads = [],
    groupedThreads,
    activeThreadId = null,
    loading = false,
    emptyState,
    hasMore = false,
    onLoadMore,
    loadingMore = false,
    onNewChat,
    onThreadSelect,
    onThreadRename,
    onThreadDelete,
    onToggleCollapse,
    collapsed = false,
    className,
    searchValue,
    onSearchChange,
    labels: labelsProp,
    navigationFooter,
    footer,
}: ChatSidebarProps): React.ReactElement {
    const labels = { ...defaultLabels, ...labelsProp };

    const sections: ChatThreadGroup[] =
        groupedThreads && groupedThreads.length > 0
            ? groupedThreads
            : threads.length > 0
              ? [{ label: '', threads }]
              : [];

    const flatSections =
        sections.length === 1 && sections[0]?.label === ''
            ? sections
            : sections.filter((group) => group.threads.length > 0);

    if (collapsed) {
        return (
            <aside
                className={cn(
                    'flex h-full min-h-0 w-14 shrink-0 flex-col border-r border-[var(--chat-border-subtle)] bg-[var(--chat-sidebar-bg)]',
                    className,
                )}
            >
                <div className="flex flex-col items-center gap-2 p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                        aria-label={labels.expandSidebarAria}
                        onClick={onToggleCollapse}
                    >
                        <PanelLeftClose className="size-4 rotate-180" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                        aria-label={labels.newChat}
                        onClick={onNewChat}
                    >
                        <Plus className="size-4" />
                    </Button>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className={cn(
                'flex h-full min-h-0 w-[var(--chat-sidebar-width)] shrink-0 flex-col border-r border-[var(--chat-border-subtle)] bg-[var(--chat-sidebar-bg)]',
                className,
            )}
        >
            <div className="flex shrink-0 items-center gap-1 p-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-item-hover)] hover:text-[var(--chat-sidebar-foreground)]"
                    aria-label={labels.collapseSidebarAria}
                    onClick={onToggleCollapse}
                >
                    <PanelLeftClose className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 justify-start gap-2 rounded-[var(--chat-radius-md)] border-[var(--chat-border-subtle)] bg-transparent text-[var(--chat-sidebar-foreground)] hover:bg-[var(--chat-sidebar-item-hover)]"
                    onClick={onNewChat}
                >
                    <Plus className="size-4 shrink-0 opacity-90" />
                    {labels.newChat}
                </Button>
            </div>
            <div className="shrink-0 px-2 pb-2">
                <div className="flex h-9 items-center gap-2 rounded-[var(--chat-radius-md)] border border-[var(--chat-border-subtle)] bg-[var(--chat-surface-raised)] px-2 text-sm text-[var(--chat-sidebar-muted)]">
                    <Search className="size-4 shrink-0 opacity-70" aria-hidden />
                    <input
                        type="text"
                        value={searchValue ?? ''}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder={labels.searchChatsPlaceholder}
                        className="min-w-0 flex-1 truncate bg-transparent outline-none placeholder:text-[var(--chat-sidebar-muted)]"
                    />
                </div>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-label={labels.chatHistoryAria}>
                {loading ? (
                    <p className="px-2.5 py-3 text-sm text-[var(--chat-sidebar-muted)]">
                        {labels.loadingThreads}
                    </p>
                ) : flatSections.length > 0 ? (
                    <>
                        {flatSections.length === 1 && flatSections[0]?.label === '' ? (
                            <ul className="flex flex-col gap-0.5">
                                {flatSections[0].threads.map((thread) => (
                                    <ThreadRow
                                        key={thread.id}
                                        thread={thread}
                                        active={thread.id === activeThreadId}
                                        labels={labels}
                                        onThreadSelect={onThreadSelect}
                                        onThreadRename={onThreadRename}
                                        onThreadDelete={onThreadDelete}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <ThreadSections
                                groups={flatSections}
                                activeThreadId={activeThreadId}
                                labels={labels}
                                onThreadSelect={onThreadSelect}
                                onThreadRename={onThreadRename}
                                onThreadDelete={onThreadDelete}
                            />
                        )}
                        {hasMore ? (
                            <div className="pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full justify-center text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-item-hover)] hover:text-[var(--chat-sidebar-foreground)]"
                                    loading={loadingMore}
                                    onClick={onLoadMore}
                                >
                                    {labels.loadMoreChats}
                                </Button>
                            </div>
                        ) : null}
                    </>
                ) : (
                    emptyState ?? null
                )}
            </nav>
            {navigationFooter ? (
                <div className="shrink-0 border-t border-[var(--chat-border-subtle)] p-2">{navigationFooter}</div>
            ) : null}
            {footer ? (
                <div className="shrink-0 border-t border-[var(--chat-border-subtle)] p-2 text-xs text-[var(--chat-sidebar-muted)]">
                    {footer}
                </div>
            ) : null}
        </aside>
    );
}
