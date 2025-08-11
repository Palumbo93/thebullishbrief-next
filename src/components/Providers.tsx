"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AuthProvider } from '../contexts/AuthContext';
import { AuthModalProvider } from '../contexts/AuthModalContext';
import { AdminProvider } from '../contexts/AdminContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ConfirmProvider } from '../contexts/ConfirmContext';
import { MobileHeaderProvider } from '../contexts/MobileHeaderContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
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
  );
};
