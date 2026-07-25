import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(nodeScrypt);

export const SESSION_COOKIE = process.env.AUTH_COOKIE_NAME ?? 'afalambe_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map((pair) => {
            const [k, ...rest] = pair.trim().split('=');
            return [k, decodeURIComponent(rest.join('='))];
        }),
    );
}

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, hex] = storedHash.split(':');
    if (!salt || !hex) return false;
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hex, 'hex');
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
}

export function buildSessionCookie(token: string, expiresAt: Date): string {
    const secure = process.env.AUTH_COOKIE_SECURE === 'true';
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}; Expires=${expiresAt.toUTCString()}${secure ? '; Secure' : ''}`;
}

export function buildClearSessionCookie(): string {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
