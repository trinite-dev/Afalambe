import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
    transpilePackages: [
        '@afalambe/ui',
        '@afalambe/ai',
        '@afalambe/api-runtime',
        '@afalambe/trpc',
        '@afalambe/emails',
        '@afalambe/prisma',
    ],
    // Ensure fact-check corpus is available to serverless functions on Vercel (feat-0047).
    outputFileTracingIncludes: {
        '/api/trpc/**': ['../../_data/fact-checks/**/*'],
        '/api/**': ['../../_data/fact-checks/**/*'],
    },
    // Hide the route dev indicator; reduces noise from dev-only UI that can interact badly with some RSC trees.
    devIndicators: false,
    webpack(config) {
        const alias = config.resolve.alias as
            | Record<string, unknown>
            | undefined;
        config.resolve.alias = {
            ...alias,
            // apps/web only — `@afalambe/ui` must use relative imports so transpile resolves without a second `@` root.
            '@': path.resolve(__dirname),
        };
        return config;
    },
};

export default nextConfig;
