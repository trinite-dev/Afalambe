const buckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimitDisabled(): boolean {
    if (process.env.RATE_LIMIT_DISABLED === 'true') return true;
    const env = (process.env.NODE_ENV ?? 'development').toLowerCase();
    return env !== 'production';
}

/** Clears in-memory counters (useful after hitting limits during local testing). */
export function resetRateLimit(key?: string): void {
    if (key === undefined) {
        buckets.clear();
        return;
    }
    buckets.delete(key);
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    if (isRateLimitDisabled()) return true;

    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (bucket.count >= maxRequests) {
        return false;
    }
    bucket.count += 1;
    return true;
}

setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
        if (now > bucket.resetAt) buckets.delete(key);
    }
}, 60_000);
