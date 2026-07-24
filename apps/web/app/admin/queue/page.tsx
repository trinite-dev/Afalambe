import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { AdminQueueClient } from '@/components/admin-queue-client';
import { createAdminPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    return createAdminPageMetadata('queue');
}

export default function AdminQueuePage(): ReactElement {
    return <AdminQueueClient />;
}
