"use client";

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { HydrationProvider } from '../contexts/HydrationContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthModalProvider } from '../contexts/AuthModalContext';
import { AdminProvider } from '../contexts/AdminContext';
import { DatafastProvider } from '../contexts/DatafastContext';
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
  // Create a stable QueryClient instance
  const queryClient = React.useMemo(() => createClientQueryClient(), []);

  return (
    <HydrationProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthModalProvider>
            <AdminProvider>
              <DatafastProvider siteId="689dde00a1c832b545b78a9f">
                <ToastProvider>
                  <ConfirmProvider>
                    <MobileHeaderProvider>
                      {children}
                    </MobileHeaderProvider>
                  </ConfirmProvider>
                </ToastProvider>
              </DatafastProvider>
            </AdminProvider>
          </AuthModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HydrationProvider>
  );
};
