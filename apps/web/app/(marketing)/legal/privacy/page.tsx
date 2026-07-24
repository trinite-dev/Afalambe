import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { PrivacyPageClient } from '@/components/legal-page-client';
import { createLegalPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    return createLegalPageMetadata('privacy');
}

export default function PrivacyPage(): ReactElement {
    return <PrivacyPageClient />;
}
