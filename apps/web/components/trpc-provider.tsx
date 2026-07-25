'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';
import { fetchWithRetry } from '@/lib/fetch-with-retry';

/**
 * Same-origin `/api/trpc` by default (feat-0047).
 * Set `NEXT_PUBLIC_API_URL` to dual-run against standalone `apps/api`.
 */
function resolveTrpcHttpUrl(): string {
    const override = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (override) {
        return `${override.replace(/\/$/, '')}/trpc`;
    }
    return '/api/trpc';
}

export function TrpcProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: resolveTrpcHttpUrl(),
                    fetch(url, options) {
                        return fetchWithRetry(url, {
                            ...options,
                            credentials: 'include',
                        });
                    },
                }),
            ],
        }),
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    );
}
