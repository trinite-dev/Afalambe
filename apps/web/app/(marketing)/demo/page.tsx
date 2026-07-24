import type { ReactElement } from 'react';

import { DemoPageClient } from '@/components/demo-page-client';
import { DemoUnavailable } from '@/components/demo-unavailable';
import { createDemoPageMetadata } from '@/lib/page-metadata';
import { isDemoEnabled } from '@/lib/demo-ui';

export async function generateMetadata() {
    return createDemoPageMetadata();
}

export default function DemoPage(): ReactElement {
    if (!isDemoEnabled()) {
        return <DemoUnavailable />;
    }

    return <DemoPageClient />;
}
