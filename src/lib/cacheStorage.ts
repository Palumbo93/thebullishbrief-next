/**
 * Cache storage utilities for offline support and performance
 */

const CACHE_PREFIX = 'bullish_brief_cache_';
const CACHE_VERSION = '1.0.0';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  ttl?: number; // Default 1 hour
  version?: string;
}

/**
 * Cache storage class for managing localStorage-based caching
 */
export class CacheStorage {
  private prefix: string;
  private version: string;

  constructor(prefix: string = CACHE_PREFIX, version: string = CACHE_VERSION) {
    this.prefix = prefix;
    this.version = version;
  }

  /**
   * Set a cache entry
   */
  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: config.version || this.version,
        ttl: config.ttl || 60 * 60 * 1000, // 1 hour default
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to set cache entry:', error);
      // If localStorage is full, clear old entries
      this.clearExpired();
    }
  }

  /**
   * Get a cache entry
   */
  get<T>(key: string): T | null {
    try {
      const entry = localStorage.getItem(this.prefix + key);
      if (!entry) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(entry);

      // Check if cache is expired
      if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
        this.delete(key);
        return null;
      }

      // Check version compatibility
      if (cacheEntry.version !== this.version) {
        this.delete(key);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.warn('Failed to get cache entry:', error);
      return null;
    }
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to delete cache entry:', error);
    }
  }

  /**
   * Clear all expired cache entries
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));

      cacheKeys.forEach(key => {
        try {
          const entry = localStorage.getItem(key);
          if (!entry) return;

          const cacheEntry: CacheEntry<any> = JSON.parse(entry);
          if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));

      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache size in bytes
   */
  getSize(): number {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));

      return cacheKeys.reduce((size, key) => {
        const value = localStorage.getItem(key);
        return size + (value ? new Blob([value]).size : 0);
      }, 0);
    } catch (error) {
      console.warn('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Global cache instance
 */
export const cacheStorage = new CacheStorage();

/**
 * Cache keys for different data types
 */
export const cacheKeys = {
  articles: {
    all: 'articles_all',
    featured: 'articles_featured',
    byCategory: (category: string) => `articles_category_${category}`,
    bySlug: (slug: string) => `articles_slug_${slug}`,
    byId: (id: string | number) => `articles_id_${id}`,
  },
  categories: 'categories_all',
  tags: 'tags_all',
  user: {
    profile: 'user_profile',
    preferences: 'user_preferences',
  },
  app: {
    settings: 'app_settings',
    theme: 'app_theme',
  },
};

/**
 * Cache TTL constants
 */
export const CACHE_TTL = {
  ARTICLES: 30 * 60 * 1000, // 30 minutes
  FEATURED_ARTICLES: 15 * 60 * 1000, // 15 minutes
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  TAGS: 60 * 60 * 1000, // 1 hour
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  APP_SETTINGS: 24 * 60 * 60 * 1000, // 24 hours
} as const; 