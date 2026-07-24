'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactElement } from 'react';
import { Button } from '@afalambe/ui/components/button';
import { Input } from '@afalambe/ui/components/input';
import { AdminGuard } from '@/components/admin-guard';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { ADMIN_UI } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

const STATUS_OPTIONS = ['', 'OPEN', 'PROCESSING', 'RESOLVED', 'FAILED'] as const;

export function AdminQueueClient(): ReactElement {
    const { href } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const ui = ADMIN_UI[locale];
    const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('');
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const queueCount = trpc.admin.queueCount.useQuery();
    const auditLogs = trpc.admin.listAuditLogs.useQuery({ take: 10 });
    const listQueue = trpc.admin.listQueue.useQuery({
        status: status || undefined,
        search: searchQuery || undefined,
    });

    const rows = useMemo(() => listQueue.data?.items ?? [], [listQueue.data?.items]);

    return (
        <AdminGuard>
            <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-8">
                <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{ui.queueTitle}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {ui.queueSubtitle(queueCount.data?.total ?? 0)}
                        </p>
                    </div>
                    <Button type="button" variant="outline" render={<Link href={href('/chat')} />}>
                        {ui.backToChat}
                    </Button>
                </header>

                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                        {ui.statusLabel}
                        <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])
                            }
                        >
                            <option value="">{ui.allStatuses}</option>
                            {STATUS_OPTIONS.filter(Boolean).map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-sm">
                        {ui.searchLabel}
                        <div className="flex gap-2">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={ui.searchPlaceholder}
                            />
                            <Button type="button" onClick={() => setSearchQuery(search.trim())}>
                                {ui.filterButton}
                            </Button>
                        </div>
                    </label>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[48rem] text-left text-sm">
                        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2">{ui.claimColumn}</th>
                                <th className="px-3 py-2">{ui.statusColumn}</th>
                                <th className="px-3 py-2">{ui.verdictColumn}</th>
                                <th className="px-3 py-2">{ui.languageColumn}</th>
                                <th className="px-3 py-2">{ui.userColumn}</th>
                                <th className="px-3 py-2">{ui.updatedColumn}</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-t border-border">
                                    <td className="max-w-xs px-3 py-3">
                                        <p className="font-medium">{row.title ?? ui.untitled}</p>
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {row.snippet || '—'}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3">{row.status}</td>
                                    <td className="px-3 py-3">{row.factCheckStatus}</td>
                                    <td className="px-3 py-3">{row.claimLanguage}</td>
                                    <td className="px-3 py-3">{row.ownerEmail}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        {new Date(row.updatedAt).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            render={<Link href={href(`/admin/claims/${row.id}`)} />}
                                        >
                                            {ui.openButton}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && !listQueue.isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-3 py-8 text-center text-muted-foreground"
                                    >
                                        {ui.noResults}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-medium">{ui.auditTitle}</h2>
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full min-w-[40rem] text-left text-sm">
                            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2">{ui.auditDate}</th>
                                    <th className="px-3 py-2">{ui.auditActor}</th>
                                    <th className="px-3 py-2">{ui.auditAction}</th>
                                    <th className="px-3 py-2">{ui.auditTarget}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(auditLogs.data?.items ?? []).map((log) => (
                                    <tr key={log.id} className="border-t border-border">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2">{log.actorEmail}</td>
                                        <td className="px-3 py-2">{log.action}</td>
                                        <td className="px-3 py-2">
                                            {log.targetType}:{log.targetId.slice(0, 8)}
                                        </td>
                                    </tr>
                                ))}
                                {(auditLogs.data?.items.length ?? 0) === 0 && !auditLogs.isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                                            {ui.noAuditEntries}
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminGuard>
    );
}
