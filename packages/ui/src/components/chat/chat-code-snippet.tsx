import type * as React from 'react'

import { cn } from '../../lib/utils'

export type ChatCodeSnippetProps = {
    code: string
    language?: string
    className?: string
}

export function ChatCodeSnippet({ code, language, className }: ChatCodeSnippetProps): React.ReactElement {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-[var(--chat-radius-md)] border border-[var(--chat-code-border)] bg-[var(--chat-code-bg)]',
                className,
            )}
        >
            {language ? (
                <div className="border-b border-[var(--chat-code-border)] px-3 py-1.5 text-xs text-[var(--chat-text-tertiary)]">
                    {language}
                </div>
            ) : null}
            <pre className="m-0 overflow-x-auto p-3 text-[13px] leading-relaxed text-[var(--chat-code-fg)]">
                <code>{code}</code>
            </pre>
        </div>
    )
}
