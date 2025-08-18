/**
 * Centralized copy for branded marketing content
 * Premium, Wall Street-ready messaging for The Briefed
 */

export const BRAND_COPY = {
  // Core brand messaging
  tagline: "Always Ahead. Always Bullish.",

  // Authentication modals
  auth: {
    signUp: {
      title: "Always Ahead. Always Bullish.",
      features: [
        "Real-time market discussions with serious traders",
        "Elite AI prompts to get the most out of LLMs",
        "Free to join, no subscription required"
      ]
    },
    signIn: {
      welcome: "Welcome Back, Let's Get You Briefed"
    }
  },

  // Onboarding flow - first slide only
  onboarding: {
    welcome: {
      title: "The Market Edge, Delivered",
      description: "You’re in. Now let’s get you into the right conversations, insights, and tools."
    }
  },

  // Bull Room auth overlay
  bullRoom: {
    authOverlay: {
      description: "Sign up to join high-level market conversations with other traders and investors.",
      cta: "Free to join • No credit card required"
    }
  },

  // AI Vault
  aiVault: {
    subtitle: "High-performance AI prompts for ChatGPT, Claude, and Perplexity"
  },

  // Briefs Action Panel CTA
  briefsActionPanel: {
    title: "The Bullish Brief",
    description: "Always Ahead. Always Bullish.",
    features: [
      "Early Market Briefings",
      "Bull Room Strategy Chats",
      "Exclusive AI Prompt Library"
    ],
    cta: "Secure Your Edge Now",
    // Variants for testing
    headlineVariants: [
      { title: "Ahead of the Market. Ahead of the Pack.", description: "Market-moving intelligence delivered before the competition reacts." },
      { title: "While Others React, You Profit.", description: "Get the brief that puts you in front of the trade, every time." },
      { title: "Your First-Mover Advantage", description: "Fast, clear, and decisive intelligence for traders who lead, not follow." }
    ]
  }
} as const;

// Type definitions for better type safety
export type BrandCopy = typeof BRAND_COPY;
export type AuthCopy = BrandCopy['auth'];
export type OnboardingCopy = BrandCopy['onboarding'];
