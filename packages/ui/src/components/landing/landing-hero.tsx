import { ArrowUpRight } from 'lucide-react'
import type * as React from 'react'

import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { LandingHeroChatPreview } from './landing-hero-chat-preview'

/** Default atmosphere image (radial-masked + blurred), same source as Veil-style reference. */
export const LANDING_HERO_DEFAULT_BACKGROUND_SRC =
    'https://images.unsplash.com/photo-1685013640715-8701bbaa2207?q=80&w=2198&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export type LandingHeroProps = {
    title: string
    subtitle: string
    primaryHref: string
    primaryLabel: string
    secondaryHref: string
    secondaryLabel: string
    /**
     * Hero backdrop URL (`<img>`). Pass `null` to disable. Defaults to {@link LANDING_HERO_DEFAULT_BACKGROUND_SRC}.
     */
    backgroundImageSrc?: string | null
    className?: string
}

export function LandingHero({
    title,
    subtitle,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
    backgroundImageSrc,
    className,
}: LandingHeroProps): React.ReactElement {
    const bgSrc =
        backgroundImageSrc === undefined ? LANDING_HERO_DEFAULT_BACKGROUND_SRC : backgroundImageSrc

    return (
        <section
            className={cn(
                'relative overflow-hidden border-b border-[var(--lp-border)] bg-[var(--lp-bg)] py-10',
                className,
            )}
        >
            {bgSrc ? (
                <div
                    aria-hidden
                    className={cn(
                        'pointer-events-none absolute inset-0 z-0 opacity-75 blur-xl dark:opacity-[0.05]',
                        'aspect-2/3 md:aspect-square lg:aspect-video',
                        'mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%]',
                    )}
                >
                    <img
                        src={bgSrc}
                        alt=""
                        width={2198}
                        height={1685}
                        className="h-full w-full object-cover object-top"
                        decoding="async"
                        fetchPriority="low"
                    />
                </div>
            ) : null}
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
                <div className="flex items-center justify-between gap-12 max-md:flex-col max-md:gap-14">
                    <div className="max-w-md max-sm:mx-auto max-sm:px-2 max-sm:text-center">
                        <h1 className="text-balance text-4xl font-regular tracking-tight text-[var(--lp-fg)] sm:text-5xl">
                            {title}
                        </h1>
                        <p className="text-muted-foreground mt-4 text-balance text-pretty sm:text-lg">
                            {subtitle}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3 max-sm:justify-center sm:mt-10">
                            <Button
                                size="xl"
                                render={<a href={primaryHref} />}
                                className="border-none bg-[image:var(--lp-cta-gradient)] pr-1.5 text-white shadow-lg hover:bg-[image:var(--lp-cta-gradient-hover)]"
                            >
                                <span className="text-nowrap">{primaryLabel}</span>
                                <ArrowUpRight className="size-5 opacity-90" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                render={<a href={secondaryHref} />}
                                className="border-[var(--lp-border-strong)]"
                            >
                                {secondaryLabel}
                            </Button>
                        </div>
                    </div>
                    <LandingHeroChatPreview className="w-full max-w-md shrink-0 pb-4 pt-2 sm:pb-6" />
                </div>
            </div>
        </section>
    )
}
