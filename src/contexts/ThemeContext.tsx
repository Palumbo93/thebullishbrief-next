"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme; // The actual theme being applied (follows system)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a safe default for SSR
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme preference, defaulting to light
  const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    // Check if the browser supports prefers-color-scheme
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Default to light theme for devices that don't support media queries
    return 'light';
  };

  // Initialize theme from system preference on mount
  useEffect(() => {
    setMounted(true);
    const systemTheme = getSystemTheme();
    setTheme(systemTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [mounted]);

  // Update document class when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    // Update document class for theme switching
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update the data-theme attribute for better CSS targeting
    root.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  // Keep toggleTheme for any existing usage, but it won't do anything since we follow system
  const toggleTheme = () => {
    // No-op since we automatically follow system theme
  };

  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
