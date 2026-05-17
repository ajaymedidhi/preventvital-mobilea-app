import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
    data: T;
    cachedAt: number;
    ttl: number; // ms
}

const PREFIX = '@cvital_cache:';

export async function setCache<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): Promise<void> {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl: ttlMs };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
}

export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(PREFIX + key);
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.cachedAt > entry.ttl) {
            await AsyncStorage.removeItem(PREFIX + key);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

export async function clearCache(key: string): Promise<void> {
    await AsyncStorage.removeItem(PREFIX + key);
}

export async function clearAllCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
}

// Read-through wrapper: returns cached data if fresh, otherwise fetches and caches
export async function readThrough<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 5 * 60 * 1000,
): Promise<{ data: T; fromCache: boolean }> {
    const cached = await getCache<T>(key);
    if (cached !== null) return { data: cached, fromCache: true };
    const data = await fetcher();
    await setCache(key, data, ttlMs);
    return { data, fromCache: false };
}

// Cache keys used across the app
export const CACHE_KEYS = {
    DASHBOARD: 'dashboard',
    PROGRAMS_LIST: 'programs_list',
    LATEST_VITALS: 'latest_vitals',
    WELLNESS_SCORE: 'wellness_score',
    ACHIEVEMENTS: 'achievements',
    STREAK: 'streak',
} as const;
