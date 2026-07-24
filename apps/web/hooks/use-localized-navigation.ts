'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { localizedHref, localizedPath } from '@/lib/localized-path';
import { useUiLocale } from '@/hooks/use-ui-locale';

function currentSearch(): string {
    if (typeof window === 'undefined') return '';
    return window.location.search || '';
}

export function useLocalizedNavigation(): {
    locale: ReturnType<typeof useUiLocale>['locale'];
    href: (path: string) => string;
    push: (path: string) => void;
    replace: (path: string) => void;
    switchLocalePath: (targetLocale: ReturnType<typeof useUiLocale>['locale']) => string;
} {
    const { locale } = useUiLocale();
    const router = useRouter();
    const pathname = usePathname() ?? '/';

    const href = useCallback((path: string) => localizedHref(path, locale), [locale]);

    const push = useCallback(
        (path: string) => {
            router.push(localizedHref(path, locale));
        },
        [locale, router],
    );

    const replace = useCallback(
        (path: string) => {
            router.replace(localizedHref(path, locale));
        },
        [locale, router],
    );

    const switchLocalePath = useMemo(
        () => (targetLocale: ReturnType<typeof useUiLocale>['locale']) =>
            localizedPath(pathname, targetLocale, currentSearch()),
        [pathname],
    );

    return { locale, href, push, replace, switchLocalePath };
}
