import { AudioLines, MessageCircle, Mic2, Plus } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/utils'

/** Example prompts shown beside the hero (decorative preview only). */
const HERO_SAMPLE_PROMPTS = [
    'Verify this election claim I saw in Fulfulde',
    'Is this video caption about local flooding accurate?',
    'Check a WhatsApp forward about vaccine schedules',
    'Compare this statement to official health guidance',
    'Queue for human review when no source matches',
    'Submit a claim in French with screenshots',
    'What can you confirm vs send to reviewers?',
    'Understand limits before I share sensitive context',
    'Verify a radio clip transcript against sources',
    'Fact-check a headline shared in Peul',
    'Multilingual intake: Fula, Peul, FR, EN',
    'Get a clear answer when the knowledge base matches',
] as const

export type LandingHeroChatPreviewProps = {
    className?: string
}

/**
 * Decorative chat-style column for the marketing hero (non-interactive).
 * Layout and masking mirror the Veil-style reference (prompt list + composer).
 */
export function LandingHeroChatPreview({ className }: LandingHeroChatPreviewProps): React.ReactElement {
    return (
        <div
            aria-hidden
            className={cn(
                'relative min-h-[26rem] max-md:mx-auto max-md:*:scale-90',
                'mask-y-from-50%',
                className,
            )}
        >
            <div className="relative flex flex-col gap-0.5 py-6">
                {HERO_SAMPLE_PROMPTS.map((prompt, index) => (
                    <div
                        key={index}
                        className="text-muted-foreground flex items-center gap-2 px-14 py-2 text-sm"
                    >
                        <MessageCircle className="size-3.5 shrink-0 opacity-50" />
                        <span className="text-nowrap">{prompt}</span>
                    </div>
                ))}
            </div>
            <div
                className={cn(
                    'bg-card text-card-foreground',
                    'ring-border shadow-foreground/6.5 dark:shadow-black/6.5',
                    'absolute inset-0 m-auto mt-auto flex h-fit min-w-[min(100%,20rem)] justify-between gap-3 rounded-full p-2 shadow-xl ring-1 sm:inset-2',
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <div className="hover:bg-muted flex size-9 shrink-0 cursor-default items-center justify-center rounded-full *:m-auto *:size-4">
                        <Plus />
                    </div>
                    <div className="text-muted-foreground truncate text-sm">Ask anything...</div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                    <div className="hover:bg-muted flex size-9 cursor-default items-center justify-center rounded-full *:m-auto *:size-4">
                        <Mic2 />
                    </div>
                    <div className="bg-foreground text-background flex size-9 cursor-default items-center justify-center rounded-full *:m-auto *:size-4 hover:brightness-110">
                        <AudioLines />
                    </div>
                </div>
            </div>
        </div>
    )
}
