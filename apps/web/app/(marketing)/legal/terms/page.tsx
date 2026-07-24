import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { TermsPageClient } from '@/components/legal-page-client';
import { createLegalPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    return createLegalPageMetadata('terms');
}

export default function TermsPage(): ReactElement {
    return <TermsPageClient />;
}
