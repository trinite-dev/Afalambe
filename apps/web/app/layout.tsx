import '@afalambe/ui/styles.css';
import type { Metadata } from 'next';
import { AppToastProviders } from '@/components/app-toast-providers';
import { ThemeProvider } from '@/components/theme-provider';
import { TrpcProvider } from '@/components/trpc-provider';
import {
    getMetadataBase,
    shouldAllowIndexing,
    siteDefaultDescription,
    siteIconPath,
    siteKeywords,
    siteName,
    siteThemeColor,
} from '@/lib/site';
import './globals.css';

const metadataBase = getMetadataBase();

export const metadata: Metadata = {
    metadataBase,
    applicationName: siteName,
    title: {
        default: siteName,
        template: `%s · ${siteName}`,
    },
    description: siteDefaultDescription,
    keywords: siteKeywords,
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        alternateLocale: ['en_US'],
        url: metadataBase,
        siteName,
        title: siteName,
        description: siteDefaultDescription,
    },
    twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: siteDefaultDescription,
    },
    robots: shouldAllowIndexing()
        ? { index: true, follow: true }
        : { index: false, follow: false },
    icons: {
        icon: [{ url: siteIconPath, type: 'image/png' }],
        shortcut: siteIconPath,
        apple: [{ url: siteIconPath, sizes: '180x180', type: 'image/png' }],
    },
    appleWebApp: {
        capable: true,
        title: siteName,
        statusBarStyle: 'default',
    },
    other: {
        'theme-color': siteThemeColor,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className="min-h-dvh font-sans antialiased">
                <ThemeProvider>
                    <TrpcProvider>
                        <AppToastProviders>{children}</AppToastProviders>
                    </TrpcProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
