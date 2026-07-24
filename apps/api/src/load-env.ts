import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(apiRoot, '.env') });

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl?.startsWith('postgresql://') && !databaseUrl?.startsWith('postgres://')) {
    console.warn(
        '[api] DATABASE_URL is missing or invalid. Copy the connection string from Supabase ' +
            '(Settings > Database) into apps/api/.env and URL-encode special characters in the password.',
    );
}
