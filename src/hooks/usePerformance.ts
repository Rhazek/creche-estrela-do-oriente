'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Hook para cache de dados
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number; // Time to live em milissegundos
    staleWhileRevalidate?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttl;
    if (isExpired && !staleWhileRevalidate) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [ttl, staleWhileRevalidate]);

  const setCachedData = useCallback((cacheKey: string, value: T) => {
    cacheRef.current.set(cacheKey, {
      data: value,
      timestamp: Date.now()
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache primeiro
      const cached = getCachedData(key);
      if (cached) {
        setData(cached);
        if (staleWhileRevalidate) {
          // Buscar dados atualizados em background
          try {
            const freshData = await fetcher();
            setCachedData(key, freshData);
            setData(freshData);
          } catch (err) {
            console.warn('Falha ao atualizar cache:', err);
          }
        }
        return;
      }

      // Buscar dados se não estiver em cache
      const result = await fetcher();
      setCachedData(key, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, getCachedData, setCachedData, staleWhileRevalidate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    fetchData();
  }, [key, fetchData]);

  const refresh = useCallback(() => {
    cacheRef.current.delete(key);
    fetchData();
  }, [key, fetchData]);

  return {
    data,
    loading,
    error,
    invalidate,
    refresh
  };
}

// Hook para lazy loading de componentes
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedModule = await importFn();
      setComponent(() => (loadedModule as any).default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [importFn]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  if (loading) {
    if (fallback) return fallback as unknown as T

    const LoadingComponent: React.FC = () => React.createElement('div', null, 'Carregando...')
    LoadingComponent.displayName = 'UseLazyComponent_Loading'
    return LoadingComponent as unknown as T
  }

  if (error) {
    const ErrorComponent: React.FC = () => React.createElement('div', null, `Erro ao carregar componente: ${error.message}`)
    ErrorComponent.displayName = 'UseLazyComponent_Error'
    return ErrorComponent as unknown as T
  }

  return Component
}

// Hook para monitoramento de performance
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Medir tempo de carregamento
    const loadStart = performance.now();
    
    const measureLoadTime = () => {
      const loadTime = performance.now() - loadStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  useEffect(() => {
    // Medir uso de memória (se disponível)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  const measureRenderTime = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const renderTime = end - start;
    
    setMetrics(prev => ({ ...prev, renderTime }));
    
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} render time: ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  }, []);

  return {
    metrics,
    measureRenderTime
  };
}

// Hook para otimização de listas grandes
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll,
    startIndex,
    endIndex
  };
}
