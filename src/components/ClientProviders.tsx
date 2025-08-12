"use client";

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { HydrationProvider } from '../contexts/HydrationContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthModalProvider } from '../contexts/AuthModalContext';
import { AdminProvider } from '../contexts/AdminContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ConfirmProvider } from '../contexts/ConfirmContext';
import { MobileHeaderProvider } from '../contexts/MobileHeaderContext';
import { createClientQueryClient } from '../lib/queryClient';

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * ClientProviders - Wraps all client-side context providers
 * QueryClient is now handled by SSRProviders at the layout level
 */
export const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  // Create a new QueryClient for each request to avoid SSR issues
  const [queryClient] = React.useState(() => createClientQueryClient());

  return (
    <HydrationProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthModalProvider>
            <AdminProvider>
              <AnalyticsProvider gtmId="GTM-KK9MF7D7">
                <ToastProvider>
                  <ConfirmProvider>
                    <MobileHeaderProvider>
                      {children}
                    </MobileHeaderProvider>
                  </ConfirmProvider>
                </ToastProvider>
              </AnalyticsProvider>
            </AdminProvider>
          </AuthModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HydrationProvider>
  );
};
