import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const prismaRoot = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(prismaRoot, '../../apps/api/.env') });
config({ path: resolve(prismaRoot, '.env') });

export default defineConfig({
    schema: './schema.prisma',
    migrations: {
        path: './migrations',
    },
    datasource: {
        url:
            process.env.DIRECT_URL ??
            process.env.DATABASE_URL ??
            'postgresql://postgres:postgres@localhost:5432/postgres',
    },
});
