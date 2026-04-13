import { Sparkles } from 'lucide-react'
import type * as React from 'react'

import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export type ChatWelcomePrompt = {
    id: string
    label: string
    description?: string
}

export type ChatWelcomeProps = {
    title: string
    subtitle?: string
    prompts: ChatWelcomePrompt[]
    onPromptClick?: (id: string) => void
    className?: string
}

export function ChatWelcome({
    title,
    subtitle,
    prompts,
    onPromptClick,
    className,
}: ChatWelcomeProps): React.ReactElement {
    return (
        <div className={cn('flex w-full max-w-3xl flex-col gap-8 py-10', className)}>
            <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--chat-text-primary)]">{title}</h1>
                {subtitle ? (
                    <p className="mt-2 text-sm text-[var(--chat-text-secondary)]">{subtitle}</p>
                ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {prompts.map((p) => (
                    <Button
                        key={p.id}
                        type="button"
                        variant="outline"
                        className="h-auto min-h-[4.5rem] flex-col items-start gap-1 whitespace-normal rounded-[var(--chat-radius-lg)] border-[var(--chat-border-subtle)] bg-[var(--chat-surface-raised)] p-4 text-left text-[var(--chat-text-primary)] hover:bg-[var(--chat-surface-hover)]"
                        onClick={() => onPromptClick?.(p.id)}
                    >
                        <span className="flex w-full items-center gap-2 font-medium">
                            <Sparkles className="size-4 shrink-0 opacity-80" aria-hidden />
                            {p.label}
                        </span>
                        {p.description ? (
                            <span className="text-xs font-normal text-[var(--chat-text-tertiary)]">{p.description}</span>
                        ) : null}
                    </Button>
                ))}
            </div>
        </div>
    )
}
