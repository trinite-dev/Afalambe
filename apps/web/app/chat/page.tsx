import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { ChatPageClient } from '@/components/chat-page-client'

export const metadata: Metadata = {
    title: 'Chat',
    description: 'Afalambe claims assistant chat (preview layout).',
    robots: { index: false, follow: false },
}

export default function ChatPage(): ReactElement {
    return <ChatPageClient />
}
