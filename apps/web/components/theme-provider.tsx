'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode, ReactElement } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
        </NextThemesProvider>
    );
}
