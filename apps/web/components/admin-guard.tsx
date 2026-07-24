'use client';

import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { COMMON_UI } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

export function AdminGuard({ children }: { children: ReactNode }): ReactElement | null {
    const { replace } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const session = trpc.session.me.useQuery(undefined, { retry: false });

    useEffect(() => {
        if (session.error?.data?.code === 'UNAUTHORIZED') {
            replace('/sign-in');
            return;
        }
        if (session.data && session.data.role !== 'ADMIN') {
            replace('/chat');
        }
    }, [replace, session.data, session.error]);

    if (session.isLoading) {
        return (
            <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
                {COMMON_UI[locale].loading}
            </div>
        );
    }

    if (!session.data || session.data.role !== 'ADMIN') {
        return null;
    }

    return <>{children}</>;
}
