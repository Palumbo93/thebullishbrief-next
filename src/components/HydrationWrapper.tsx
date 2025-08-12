"use client";

import React, { useEffect, useState } from 'react';
import { ClientProviders } from './ClientProviders';

interface HydrationWrapperProps {
  children: React.ReactNode;
}

/**
 * HydrationWrapper - Ensures client-side providers only render after hydration
 * This prevents SSR conflicts while maintaining functionality
 */
export const HydrationWrapper: React.FC<HydrationWrapperProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR and initial hydration, render children without providers
  if (!isHydrated) {
    return <>{children}</>;
  }

  // After hydration, wrap with client providers
  return <ClientProviders>{children}</ClientProviders>;
};
