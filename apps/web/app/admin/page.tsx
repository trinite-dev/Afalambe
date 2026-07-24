import { redirect } from 'next/navigation';

import { getServerUiLocale } from '@/lib/locale-cookie';
import { localizedHref } from '@/lib/localized-path';

export default async function AdminIndexPage() {
    const locale = await getServerUiLocale();
    redirect(localizedHref('/admin/queue', locale));
}
