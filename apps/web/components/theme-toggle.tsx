'use client';

import { Button } from '@afalambe/ui/components/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, type ReactElement } from 'react';

export type ThemeToggleProps = {
    className?: string;
};

/**
 * Toggles between light and dark. Use after mount to avoid hydration mismatch.
 */
export function ThemeToggle({ className }: ThemeToggleProps): ReactElement {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button type="button" variant="ghost" size="icon" className={className} disabled aria-hidden>
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
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
    );
}
