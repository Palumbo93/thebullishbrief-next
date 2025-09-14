import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createServerQueryClient, createClientQueryClient } from '../lib/queryClient';

interface SSRProvidersProps {
  children: React.ReactNode;
}

/**
 * SSRProviders - Server-side rendering compatible providers
 * This component creates a QueryClient that works for both SSR and client-side
 */
export const SSRProviders: React.FC<SSRProvidersProps> = ({ children }) => {
  // Create a new QueryClient for each request
  const queryClient = React.useMemo(() => {
    // Use server configuration for SSR, client configuration for browser
    if (typeof window === 'undefined') {
      return createServerQueryClient();
    } else {
      return createClientQueryClient();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
