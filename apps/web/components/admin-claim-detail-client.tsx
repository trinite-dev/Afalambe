'use client';

import Link from 'next/link';
import { useCallback, useState, type FormEvent, type ReactElement } from 'react';
import { Button } from '@afalambe/ui/components/button';
import { AdminGuard } from '@/components/admin-guard';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { notifyApiException, notifyApiInfo } from '@/lib/api-toast';
import { ADMIN_UI, COMMON_UI } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

const STATUS_OPTIONS = ['OPEN', 'PROCESSING', 'RESOLVED', 'FAILED'] as const;
const VERDICT_OPTIONS = [
    'PENDING',
    'VERIFIED',
    'DEBUNKED',
    'MISLEADING',
    'PARTIALLY_TRUE',
] as const;

export function AdminClaimDetailClient({ claimId }: { claimId: string }): ReactElement {
    const { href, push } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const ui = ADMIN_UI[locale];
    const trpcUtils = trpc.useUtils();
    const claimQuery = trpc.admin.claimById.useQuery({ claimId });
    const updateStatus = trpc.admin.updateClaimStatus.useMutation();

    const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('RESOLVED');
    const [factCheckStatus, setFactCheckStatus] =
        useState<(typeof VERDICT_OPTIONS)[number]>('VERIFIED');
    const [resolutionNote, setResolutionNote] = useState('');

    const claim = claimQuery.data;

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!resolutionNote.trim()) return;

            void updateStatus.mutateAsync(
                {
                    claimId,
                    status,
                    factCheckStatus,
                    resolutionNote: resolutionNote.trim(),
                },
                {
                    onSuccess: async () => {
                        notifyApiInfo({
                            title: ui.claimUpdated,
                            description: ui.claimUpdatedDescription,
                        });
                        await trpcUtils.admin.claimById.invalidate({ claimId });
                        await trpcUtils.admin.listQueue.invalidate();
                        await trpcUtils.admin.queueCount.invalidate();
                        push('/admin/queue');
                    },
                    onError: (error) => {
                        notifyApiException(error, ui.updateFailed);
                    },
                },
            );
        },
        [claimId, factCheckStatus, push, resolutionNote, status, trpcUtils, ui, updateStatus],
    );

    return (
        <AdminGuard>
            <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-4 py-8">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{ui.detailTitle}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{claimId}</p>
                    </div>
                    <Button type="button" variant="outline" render={<Link href={href('/admin/queue')} />}>
                        {ui.backToQueue}
                    </Button>
                </header>

                {claimQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">{COMMON_UI[locale].loading}</p>
                ) : null}

                {claim ? (
                    <>
                        <section className="grid gap-3 rounded-lg border border-border p-4 text-sm sm:grid-cols-2">
                            <p>
                                <span className="text-muted-foreground">{ui.userLabel}:</span>{' '}
                                {claim.user.email}
                            </p>
                            <p>
                                <span className="text-muted-foreground">{ui.statusField}:</span> {claim.status}
                            </p>
                            <p>
                                <span className="text-muted-foreground">{ui.verdictField}:</span>{' '}
                                {claim.factCheckStatus}
                            </p>
                            <p>
                                <span className="text-muted-foreground">{ui.languageField}:</span>{' '}
                                {claim.claimLanguage}
                            </p>
                            {claim.topicCategory ? (
                                <p>
                                    <span className="text-muted-foreground">{ui.topicField}:</span>{' '}
                                    {claim.topicCategory}
                                </p>
                            ) : null}
                            {claim.platform ? (
                                <p>
                                    <span className="text-muted-foreground">{ui.platformField}:</span>{' '}
                                    {claim.platform}
                                </p>
                            ) : null}
                        </section>

                        <section className="flex flex-col gap-3">
                            <h2 className="text-lg font-medium">{ui.messageThread}</h2>
                            <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                                {claim.messages.map((message) => (
                                    <div key={message.id} className="text-sm">
                                        <p className="text-xs font-medium uppercase text-muted-foreground">
                                            {message.role}
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border p-4">
                            <h2 className="text-lg font-medium">{ui.resolveTitle}</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-sm">
                                    {ui.newStatus}
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-2"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])
                                        }
                                    >
                                        {STATUS_OPTIONS.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1 text-sm">
                                    {ui.verdictSelect}
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-2"
                                        value={factCheckStatus}
                                        onChange={(e) =>
                                            setFactCheckStatus(
                                                e.target.value as (typeof VERDICT_OPTIONS)[number],
                                            )
                                        }
                                    >
                                        {VERDICT_OPTIONS.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className="flex flex-col gap-1 text-sm">
                                {ui.resolutionNote}
                                <textarea
                                    className="min-h-28 rounded-md border border-input bg-background px-3 py-2"
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                    placeholder={ui.resolutionPlaceholder}
                                    required
                                />
                            </label>
                            <Button type="submit" loading={updateStatus.isPending}>
                                {ui.saveResolution}
                            </Button>
                        </form>
                    </>
                ) : null}
            </div>
        </AdminGuard>
    );
}
