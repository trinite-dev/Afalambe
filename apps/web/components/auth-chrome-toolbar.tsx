'use client';

import type { ReactElement } from 'react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export function AuthChromeToolbar({
    localeSwitcherVariant = 'chat',
}: {
    localeSwitcherVariant?: 'chat' | 'landing';
}): ReactElement {
    return (
        <div className="flex items-center gap-2">
            <LocaleSwitcher variant={localeSwitcherVariant} />
            <ThemeToggle />
        </div>
    );
}
