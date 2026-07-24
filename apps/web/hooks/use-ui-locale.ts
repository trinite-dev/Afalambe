'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { getLocaleFromPathname, localizedPath } from '@/lib/localized-path';
import {
    getAlternateUiLocale,
    persistUiLocale,
    type UiLocale,
} from '@/lib/ui-locale';

function currentSearch(): string {
    if (typeof window === 'undefined') return '';
    return window.location.search || '';
}

export function useUiLocale(): {
    locale: UiLocale;
    setLocale: (locale: UiLocale) => void;
    toggleLocale: () => void;
    isReady: boolean;
} {
    const router = useRouter();
    const pathname = usePathname() ?? '/';

    const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

    useEffect(() => {
        persistUiLocale(locale);
        document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = useCallback(
        (next: UiLocale) => {
            router.push(localizedPath(pathname, next, currentSearch()));
        },
        [pathname, router],
    );

    const toggleLocale = useCallback(() => {
        setLocale(getAlternateUiLocale(locale));
    }, [locale, setLocale]);

    return { locale, setLocale, toggleLocale, isReady: true };
}
