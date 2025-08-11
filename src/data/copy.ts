/**
 * Centralized copy for branded marketing content
 * This file contains all the marketing copy used across the application
 * to ensure consistency and easy maintenance.
 */

export const BRAND_COPY = {
  // Core brand messaging
  tagline: "Personalized market intelligence that moves faster than the competition.",
  
  // Authentication modals
  auth: {
    signUp: {
      title: "It's Always Bullish For The Briefed",
      features: [
        "Real-time discussions with other bulls",
        "AI prompts to get the most out of LLMs", 
        "Free to join, not a subscription service"
      ]
    },
    signIn: {
      welcome: "Welcome Back To The Briefed"
    }
  },

  // Onboarding flow - first slide only
  onboarding: {
    welcome: {
      title: "Personalized Market Intelligence",
      description: "Personalized market intelligence that moves faster than the competition."
    }
  },

  // Bull Room auth overlay
  bullRoom: {
    authOverlay: {
      description: "Sign up to participate in real-time discussions with other traders and investors.",
      cta: "Free to join • No credit card required"
    }
  },

  // AI Vault
  aiVault: {
    subtitle: "Top notch AI prompts to get the most out of ChatGPT, Claude, and Perplexity"
  }
} as const;

// Type definitions for better type safety
export type BrandCopy = typeof BRAND_COPY;
export type AuthCopy = BrandCopy['auth'];
export type OnboardingCopy = BrandCopy['onboarding'];
