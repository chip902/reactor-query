import { useCallback } from 'react';
import { useApiKeys } from './useApiKeys';
import { createApiHeaders } from '@/lib/apiUtils';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function useApiCache() {
  const { apiKeys, isLoading } = useApiKeys();
  const getCacheKey = useCallback((key: string) => `cobramist_${key}`, []);

  const getFromCache = useCallback(<T>(key: string): T | null => {
    const cacheKey = getCacheKey(key);
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) return null;

    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - item.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return item.data;
  }, [getCacheKey]);

  const setInCache = useCallback(<T>(key: string, data: T) => {
    const cacheKey = getCacheKey(key);
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  }, [getCacheKey]);

  const fetchCompanies = useCallback(async () => {
    // Try to get from cache first
    const cachedCompanies = getFromCache<TruncatedReactorAPIResponseItem[]>('companies');
    if (cachedCompanies) {
      return { data: cachedCompanies, fromCache: true };
    }

    // If not in cache or expired, fetch from API
    try {
      if (isLoading) {
        return { data: [], fromCache: false };
      }
      if (!apiKeys) {
        throw new Error('API keys not found');
      }
      const response = await fetch('/api/reactor/listcompanies', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
      });

      const result: TruncatedReactorAPIResponseItem[] = await response.json();

      if (response.ok) {
        setInCache('companies', result);
        return { data: result, fromCache: false };
      }
      throw new Error(`Failed to fetch companies: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      throw error;
    }
  }, [apiKeys, isLoading, getFromCache, setInCache]);

  const fetchProperties = useCallback(async (companyId: string) => {
    // Try to get from cache first
    const cacheKey = `properties_${companyId}`;
    const cachedProperties = getFromCache<TruncatedReactorAPIResponseItem[]>(cacheKey);
    if (cachedProperties) {
      return { data: cachedProperties, fromCache: true };
    }

    // If not in cache or expired, fetch from API
    try {
      if (isLoading) {
        return { data: [], fromCache: false };
      }
      if (!apiKeys) {
        throw new Error('API keys not found');
      }
      const response = await fetch('/api/reactor/listproperties', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
        body: JSON.stringify({ companyId }),
      });

      const result: TruncatedReactorAPIResponseItem[] = await response.json();

      if (response.ok) {
        setInCache(cacheKey, result);
        return { data: result, fromCache: false };
      }
      throw new Error(`Failed to fetch properties: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      throw error;
    }
  }, [apiKeys, isLoading, getFromCache, setInCache]);

  const fetchExtensions = useCallback(async (propertyId: string) => {
    // Try to get from cache first
    const cacheKey = `extensions_${propertyId}`;
    const cachedExtensions = getFromCache<TruncatedReactorAPIResponseItem[]>(cacheKey);
    if (cachedExtensions) {
      return { data: cachedExtensions, fromCache: true };
    }

    // If not in cache or expired, fetch from API
    try {
      if (isLoading) {
        return { data: [], fromCache: false };
      }
      if (!apiKeys) {
        throw new Error('API keys not found');
      }
      const response = await fetch('/api/reactor/listextensions', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
        body: JSON.stringify({ propertyId }),
      });

      const result: TruncatedReactorAPIResponseItem[] = await response.json();

      if (response.ok) {
        setInCache(cacheKey, result);
        return { data: result, fromCache: false };
      }
      throw new Error(`Failed to fetch extensions: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Failed to fetch extensions:', error);
      throw error;
    }
  }, [apiKeys, isLoading, getFromCache, setInCache]);

  const fetchLibraries = useCallback(async (propertyId: string, publishedOnly: boolean = true) => {
    // Try to get from cache first
    const cacheKey = `libraries_${propertyId}_${publishedOnly}`;
    const cachedLibraries = getFromCache<TruncatedReactorAPIResponseItem[]>(cacheKey);
    if (cachedLibraries) {
      return { data: cachedLibraries, fromCache: true };
    }

    // If not in cache or expired, fetch from API
    try {
      if (isLoading) {
        return { data: [], fromCache: false };
      }
      if (!apiKeys) {
        throw new Error('API keys not found');
      }
      const response = await fetch('/api/reactor/listlibrariesforproperty', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
        body: JSON.stringify({ propertyId, publishedOnly }),
      });

      const result: TruncatedReactorAPIResponseItem[] = await response.json();

      if (response.ok) {
        setInCache(cacheKey, result);
        return { data: result, fromCache: false };
      }
      throw new Error(`Failed to fetch libraries: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      throw error;
    }
  }, [apiKeys, isLoading, getFromCache, setInCache]);

  const clearCache = useCallback(() => {

    const prefix = `cobramist_`;

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    }
  }, []);

  return {
    fetchCompanies,
    fetchProperties,
    clearCache,
    fetchExtensions,
    fetchLibraries
  };
}
