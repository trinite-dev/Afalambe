'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';

import { LocaleSwitcher } from '@/components/locale-switcher';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { DEMO_UI } from '@/lib/demo-ui';
import { siteName } from '@/lib/site';

export function DemoUnavailable(): ReactElement {
    const { locale } = useUiLocale();
    const { href } = useLocalizedNavigation();
    const ui = DEMO_UI[locale];

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-xl font-semibold">{ui.unavailableTitle}</h1>
            <p className="max-w-md text-sm text-muted-foreground">{ui.unavailableBody}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href={href('/')} className="text-sm font-medium underline hover:no-underline">
                    {ui.backHome}
                </Link>
                <Link href={href('/sign-up')} className="text-sm font-medium underline hover:no-underline">
                    {ui.signUpCta}
                </Link>
                <LocaleSwitcher variant="landing" />
            </div>
            <p className="text-xs text-muted-foreground">{siteName}</p>
        </main>
    );
}
