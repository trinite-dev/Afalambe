'use client';

import type { ReactElement } from 'react';
import { Button } from '@afalambe/ui/components/button';
import { cn } from '@afalambe/ui/lib/utils';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { getAlternateUiLocale, getLocaleToggleAriaLabel } from '@/lib/ui-locale';

export type LocaleSwitcherProps = {
    className?: string;
    variant?: 'chat' | 'landing';
};

export function LocaleSwitcher({
    className,
    variant = 'chat',
}: LocaleSwitcherProps): ReactElement {
    const { locale, toggleLocale } = useUiLocale();
    const targetLocale = getAlternateUiLocale(locale);

    const buttonClass =
        variant === 'landing'
            ? 'text-[var(--lp-fg-muted)] hover:bg-[var(--lp-border)]/40 hover:text-[var(--lp-fg)]'
            : 'text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-item-hover)] hover:text-[var(--chat-sidebar-foreground)]';

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
                'h-8 min-w-9 px-2 text-xs font-medium uppercase',
                variant === 'chat' && 'rounded-[var(--chat-radius-sm)]',
                buttonClass,
                className,
            )}
            aria-label={getLocaleToggleAriaLabel(locale)}
            onClick={toggleLocale}
        >
            {targetLocale}
        </Button>
    );
}
