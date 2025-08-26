"use client";

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { HydrationProvider } from '../contexts/HydrationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthModalProvider } from '../contexts/AuthModalContext';
import { AdminProvider } from '../contexts/AdminContext';
import { ClarityProvider } from '../contexts/ClarityContext';
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
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthModalProvider>
              <AdminProvider>
                <ClarityProvider>
                  <ToastProvider>
                    <ConfirmProvider>
                      <MobileHeaderProvider>
                        {children}
                      </MobileHeaderProvider>
                    </ConfirmProvider>
                  </ToastProvider>
                </ClarityProvider>
              </AdminProvider>
            </AuthModalProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HydrationProvider>
  );
};
