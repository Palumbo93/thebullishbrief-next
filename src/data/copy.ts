/**
 * Centralized copy for branded marketing content
 * News and newsletter focused messaging for The Bullish Brief
 */

export const BRAND_COPY = {
  // Core brand messaging
  tagline: "Early signals. Clear context.",

  // Authentication modals
  auth: {
    signUp: {
      title: "Get Briefed",
      features: [
        "The Bullish Brief in your inbox",
        "Timely coverage of moves that matter",
        "Early ticker calls with clear rationale",
        "Free to join, no subscription required"
      ]
    },
    signIn: {
      welcome: "Welcome back. Get briefed."
    }
  },


  // Briefs Action Panel CTA
  briefsActionPanel: {
    title: "The Bullish Brief",
    description: "Early signals. Clear context.",
    features: [
      "Timely briefs by email when news moves markets",
      "Early ticker calls, explained in plain language",
      "Context that shows why it matters and what to watch",
      "Completely free, no credit card required"
    ],
    cta: "Subscribe Free",
    // Variants for testing
    headlineVariants: [
      { title: "Catch the Move Early", description: "Timely briefs and early ticker calls with the context to act." },
      { title: "Be First to the Signal", description: "Focused reporting on catalysts before the crowd notices." },
      { title: "News With an Edge", description: "Clear coverage, early calls, zero fluff." }
    ]
  }
} as const;

// Type definitions for better type safety
export type BrandCopy = typeof BRAND_COPY;
export type AuthCopy = BrandCopy['auth'];
