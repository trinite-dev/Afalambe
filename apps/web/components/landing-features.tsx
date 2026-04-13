import type { ReactElement } from 'react';
import {
    Bell,
    FileText,
    Languages,
    Link2,
    MessageCircle,
    Shield,
} from 'lucide-react';

import { Card } from '@afalambe/ui/components/card';
import { cn } from '@afalambe/ui/lib/utils';

const cardOutline =
    'border-[var(--lp-border)] bg-[var(--lp-bg-elevated)]/90 shadow-[var(--lp-shadow-sm)] before:shadow-none';

function PillIcon({ children }: { children: React.ReactNode }): ReactElement {
    return (
        <div
            className={cn(
                'relative flex h-8 items-center rounded-full border border-[var(--lp-border)] bg-[var(--lp-bg-elevated)] px-3',
                'shadow-[var(--lp-shadow-sm)] ring-1 ring-[var(--lp-border)]',
            )}
        >
            {children}
        </div>
    );
}

/**
 * Feature grid for the marketing home (above "How it works").
 * Visual pattern inspired by integration-style cards; content is Afalambè-specific.
 */
export function LandingFeatures(): ReactElement {
    return (
        <section className="@container border-b border-[var(--lp-border)] bg-[var(--lp-bg)] py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:max-w-5xl">
                <div>
                    <h2 className="text-balance text-3xl font-medium tracking-tight text-[var(--lp-fg)] sm:text-4xl">
                        Built for trustworthy verification
                    </h2>
                    <p className="mt-4 max-w-2xl text-balance text-[var(--lp-fg-muted)] sm:text-lg">
                        Curated knowledge, clear confidence signals, and human review when automation
                        reaches its limits.
                    </p>
                </div>
                <div className="mt-12 grid gap-3 *:p-6 @xl:grid-cols-2">
                    <Card
                        className={cn(
                            'row-span-2 grid grid-rows-subgrid gap-0 rounded-[var(--lp-radius-lg)]',
                            cardOutline,
                        )}
                    >
                        <div className="space-y-2">
                            <h3 className="font-medium text-[var(--lp-fg)]">Multilingual intake</h3>
                            <p className="text-sm text-[var(--lp-fg-muted)]">
                                Chat and forms accept the languages your community uses, including Fula
                                and Peul.
                            </p>
                        </div>
                        <div
                            aria-hidden
                            className="flex h-44 flex-col justify-between fill-[var(--lp-fg)] pt-8 [&_svg]:size-3.5"
                        >
                            <div className="relative flex h-10 items-center gap-12 px-6">
                                <div className="absolute inset-0 my-auto h-px bg-[var(--lp-border)]" />
                                <PillIcon>
                                    <MessageCircle className="opacity-90" />
                                </PillIcon>
                                <PillIcon>
                                    <Languages className="opacity-90" />
                                </PillIcon>
                            </div>
                            <div className="relative flex h-10 items-center justify-between gap-12 pl-16 pr-6">
                                <div className="absolute inset-0 my-auto h-px bg-[var(--lp-border)]" />
                                <PillIcon>
                                    <FileText className="opacity-90" />
                                </PillIcon>
                                <PillIcon>
                                    <Bell className="opacity-90" />
                                </PillIcon>
                            </div>
                            <div className="relative flex h-10 items-center gap-20 px-8">
                                <div className="absolute inset-0 my-auto h-px bg-[var(--lp-border)]" />
                                <PillIcon>
                                    <Link2 className="opacity-90" />
                                </PillIcon>
                                <PillIcon>
                                    <Shield className="opacity-90" />
                                </PillIcon>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className={cn(
                            'row-span-2 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[var(--lp-radius-lg)]',
                            cardOutline,
                        )}
                    >
                        <div className="space-y-2">
                            <h3 className="font-medium text-[var(--lp-fg)]">Clear confidence</h3>
                            <p className="text-sm text-[var(--lp-fg-muted)]">
                                When a claim matches curated material you see a direct answer; otherwise
                                uncertainty is explicit.
                            </p>
                        </div>
                        <div aria-hidden className="relative h-44 translate-y-6">
                            <div className="absolute inset-0 mx-auto w-px bg-[var(--lp-fg)]/15" />
                            <div className="absolute -inset-x-16 top-6 aspect-square rounded-full border border-[var(--lp-border)]" />
                            <div
                                className={cn(
                                    'border-primary absolute -inset-x-16 top-6 aspect-square rounded-full border',
                                    'mask-l-from-50% mask-l-to-90% mask-r-from-50% mask-r-to-50%',
                                )}
                            />
                            <div className="absolute -inset-x-8 top-24 aspect-square rounded-full border border-[var(--lp-border)]" />
                            <div
                                className={cn(
                                    'absolute -inset-x-8 top-24 aspect-square rounded-full border border-[var(--lp-accent)]',
                                    'mask-r-from-50% mask-r-to-90% mask-l-from-50% mask-l-to-50%',
                                )}
                            />
                        </div>
                    </Card>
                    <Card
                        className={cn(
                            'row-span-2 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[var(--lp-radius-lg)]',
                            cardOutline,
                        )}
                    >
                        <div className="space-y-2">
                            <h3 className="font-medium text-[var(--lp-fg)]">Transparent limits</h3>
                            <p className="mt-2 text-sm text-[var(--lp-fg-muted)]">
                                Policies and source scope are visible so teams know what can be verified
                                automatically.
                            </p>
                        </div>
                        <div
                            aria-hidden
                            className="flex h-44 justify-between pb-6 pt-12 *:h-full *:w-px *:bg-[var(--lp-fg)]/15"
                        >
                            {Array.from({ length: 28 }, (_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        [4, 9, 14, 19, 24].includes(i) && '!bg-[var(--lp-accent)]',
                                    )}
                                />
                            ))}
                        </div>
                    </Card>
                    <Card
                        className={cn(
                            'row-span-2 grid grid-rows-subgrid gap-0 rounded-[var(--lp-radius-lg)]',
                            cardOutline,
                        )}
                    >
                        <div className="space-y-2">
                            <h3 className="font-medium text-[var(--lp-fg)]">Human oversight</h3>
                            <p className="text-sm text-[var(--lp-fg-muted)]">
                                Escalations keep full context for reviewers when the model cannot safely
                                confirm.
                            </p>
                        </div>
                        <div className="pointer-events-none relative -ml-7 flex size-44 items-center justify-center pt-5">
                            <Shield className="absolute inset-0 top-2.5 size-full stroke-[0.1px] text-[var(--lp-fg)] opacity-15" />
                            <Shield className="size-32 stroke-[0.1px] text-[var(--lp-fg)]" />
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
