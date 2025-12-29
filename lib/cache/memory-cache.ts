interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttlSeconds: number): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instances with different TTLs
export const sentimentCache = new LRUCache<unknown>(100);
export const trendingCache = new LRUCache<unknown>(50);
export const alertCache = new LRUCache<unknown>(50);

// Cache TTLs in seconds
export const CACHE_TTL = {
  sentiment: 300, // 5 minutes
  trending: 120, // 2 minutes
  alerts: 60, // 1 minute
} as const;

// Cache key generators
export function sentimentCacheKey(symbol: string): string {
  return `sentiment:${symbol.toUpperCase()}`;
}

export function trendingCacheKey(sector?: string): string {
  return sector ? `trending:${sector}` : "trending:all";
}

export function alertsCacheKey(symbol?: string): string {
  return symbol ? `alerts:${symbol.toUpperCase()}` : "alerts:all";
}
