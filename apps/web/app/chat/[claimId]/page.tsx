import type { ReactElement } from 'react';

import { ChatPageClient } from '@/components/chat-page-client';
import { createChatPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata() {
    return createChatPageMetadata();
}

export default async function ChatClaimPage({
    params,
}: {
    params: Promise<{ claimId: string }>;
}): Promise<ReactElement> {
    const { claimId } = await params;
    return <ChatPageClient initialClaimId={claimId} />;
}
