import type { ChatThread } from '@afalambe/ui/chat';

export type ThreadListSource = {
    id: string;
    title: string;
    updatedAt: Date;
};

export type ThreadGroupLabels = {
    today: string;
    yesterday: string;
    previous7Days: string;
    older: string;
};

export type ThreadGroup = {
    label: string;
    threads: ChatThread[];
};

function startOfLocalDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function groupThreadsByRecency(
    threads: ThreadListSource[],
    labels: ThreadGroupLabels,
    formatUpdated: (updatedAt: Date) => string,
): ThreadGroup[] {
    const now = new Date();
    const todayStart = startOfLocalDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
    const previous7DaysStart = new Date(todayStart.getTime() - 7 * 86_400_000);

    const buckets: Record<keyof ThreadGroupLabels, ChatThread[]> = {
        today: [],
        yesterday: [],
        previous7Days: [],
        older: [],
    };

    for (const thread of threads) {
        const updatedAt = new Date(thread.updatedAt);
        const row: ChatThread = {
            id: thread.id,
            title: thread.title,
            updatedLabel: formatUpdated(updatedAt),
        };

        if (updatedAt >= todayStart) {
            buckets.today.push(row);
        } else if (updatedAt >= yesterdayStart) {
            buckets.yesterday.push(row);
        } else if (updatedAt >= previous7DaysStart) {
            buckets.previous7Days.push(row);
        } else {
            buckets.older.push(row);
        }
    }

    const ordered: Array<[keyof ThreadGroupLabels, string]> = [
        ['today', labels.today],
        ['yesterday', labels.yesterday],
        ['previous7Days', labels.previous7Days],
        ['older', labels.older],
    ];

    return ordered
        .filter(([key]) => buckets[key].length > 0)
        .map(([key, label]) => ({ label, threads: buckets[key] }));
}
