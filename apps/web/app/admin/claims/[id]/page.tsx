import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { AdminClaimDetailClient } from '@/components/admin-claim-detail-client';
import { createAdminPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    return createAdminPageMetadata('claimDetail');
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AdminClaimDetailPage({ params }: Props): Promise<ReactElement> {
    const { id } = await params;
    return <AdminClaimDetailClient claimId={id} />;
}
