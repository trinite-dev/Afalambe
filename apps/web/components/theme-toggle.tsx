'use client';

import { Button } from '@afalambe/ui/components/button';
import { cn } from '@afalambe/ui/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLayoutEffect, useState, type ReactElement } from 'react';

import { useUiLocale } from '@/hooks/use-ui-locale';
import { COMMON_UI } from '@/lib/ui-locale';

export type ThemeToggleProps = {
    className?: string;
};

/**
 * Toggles between light and dark. Use after mount to avoid hydration mismatch.
 */
export function ThemeToggle({ className }: ThemeToggleProps): ReactElement {
    const { resolvedTheme, setTheme } = useTheme();
    const { locale } = useUiLocale();
    const common = COMMON_UI[locale];
    const [mounted, setMounted] = useState(false);

    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('pointer-events-none opacity-64', className)}
                aria-hidden
                tabIndex={-1}
            >
                <Moon className="size-4" />
            </Button>
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={className}
            aria-label={isDark ? common.themeLightAria : common.themeDarkAria}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
    );
}
