import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cacheStorage } from '../lib/cacheStorage';

interface CacheManagerProps {
  isVisible?: boolean;
}

export const CacheManager: React.FC<CacheManagerProps> = ({ isVisible = false }) => {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    queryClient.clear();
    cacheStorage.clear();
    console.log('All cache cleared');
  };

  const clearExpiredCache = () => {
    cacheStorage.clearExpired();
    console.log('Expired cache cleared');
  };

  const getCacheInfo = () => {
    const size = cacheStorage.getSize();
    const sizeKB = (size / 1024).toFixed(2);
    return { size, sizeKB };
  };

  if (!isVisible) return null;

  const cacheInfo = getCacheInfo();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'var(--color-bg-primary)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <h3 style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-semibold)',
        marginBottom: 'var(--space-3)',
        color: 'var(--color-text-primary)'
      }}>
        Cache Manager
      </h3>
      
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-1)'
        }}>
          Cache Size: {cacheInfo.sizeKB} KB
        </p>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          Available: {cacheStorage.isAvailable() ? 'Yes' : 'No'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={clearExpiredCache}
          style={{
            fontSize: 'var(--text-xs)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer'
          }}
        >
          Clear Expired
        </button>
        <button
          onClick={clearAllCache}
          style={{
            fontSize: 'var(--text-xs)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--color-bg-destructive)',
            border: '1px solid var(--color-border-destructive)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-on-primary)',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}; 