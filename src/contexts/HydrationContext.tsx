"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface HydrationContextType {
  isHydrated: boolean;
}

const HydrationContext = createContext<HydrationContextType>({
  isHydrated: false,
});

interface HydrationProviderProps {
  children: React.ReactNode;
}

/**
 * HydrationProvider - Tracks hydration state for the app
 * This prevents hydration mismatches during SSR
 */
export const HydrationProvider: React.FC<HydrationProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <HydrationContext.Provider value={{ isHydrated }}>
      {children}
    </HydrationContext.Provider>
  );
};

/**
 * Hook to check if the component is hydrated
 * Use this to prevent SSR/client mismatches
 */
export const useIsHydrated = (): boolean => {
  const context = useContext(HydrationContext);
  return context.isHydrated;
};
