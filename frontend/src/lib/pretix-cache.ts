/** Simple in-memory cache for Pretix data to improve dev/local performance */

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const DEFAULT_TTL = 60 * 1000; // 60 seconds

export const getCache = (key: string, ttl = DEFAULT_TTL) => {
    const entry = cache[key];
    if (!entry) return null;

    if (Date.now() - entry.timestamp > ttl) {
        delete cache[key];
        return null;
    }

    return entry.data;
};

export const setCache = (key: string, data: any) => {
    cache[key] = {
        data,
        timestamp: Date.now()
    };
};
