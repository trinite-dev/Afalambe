'use client';

import type * as React from 'react';
import { Image, Mic, Send } from 'lucide-react';

import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export type ChatComposerProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function ChatComposer({
    value,
    onChange,
    onSubmit,
    placeholder = 'Type message',
    disabled = false,
    className,
}: ChatComposerProps): React.ReactElement {
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) {
                onSubmit?.();
            }
        }
    }

    const canSend = Boolean(value.trim()) && !disabled;

    return (
        <div
            className={cn(
                'border-t border-[var(--chat-border-subtle)] bg-[var(--chat-canvas)] px-4 pb-4 pt-2 shadow-[var(--chat-shadow-composer)]',
                className,
            )}
        >
            <div className="mx-auto w-full max-w-3xl">
                <div
                    className={cn(
                        'flex items-end gap-2 rounded-[var(--chat-radius-composer)] border border-[var(--chat-composer-border)] bg-[var(--chat-composer-bg)] px-2 py-1.5 shadow-sm',
                        'focus-within:border-[var(--chat-composer-ring)] focus-within:ring-1 focus-within:ring-[var(--chat-composer-ring)]/40',
                    )}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                        aria-label="Voice input"
                        disabled
                        title="Coming soon"
                    >
                        <Mic className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-[var(--chat-control-icon)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-control-icon-hover)]"
                        aria-label="Add images"
                        disabled
                        title="Coming soon"
                    >
                        <Image className="size-4" />
                    </Button>
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            'max-h-48 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[15px] text-[var(--chat-text-primary)] placeholder:text-[var(--chat-composer-placeholder)] outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                        aria-label="Message input"
                    />
                    <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className={cn(
                            'shrink-0 rounded-[var(--chat-radius-md)]',
                            canSend
                                ? 'bg-[var(--chat-send-bg)] text-[var(--chat-send-fg)] hover:opacity-90'
                                : 'bg-[var(--chat-send-disabled-bg)] text-[var(--chat-send-disabled-fg)]',
                        )}
                        aria-label="Send message"
                        disabled={!canSend}
                        onClick={() => onSubmit?.()}
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
                <p className="mt-2 text-center text-xs text-[var(--chat-text-tertiary)]">
                    AI can make mistakes. Check important information.
                </p>
            </div>
        </div>
    );
}
