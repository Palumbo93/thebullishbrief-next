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
  },

 // CTA Banner
ctaBanner: {
  badge: "The Bullish Brief",
  primary: {
    headline: "Join the Institution-Grade Intelligence Network",
    subtitle: "Actionable market briefings and early ticker calls with clear rationale. Delivered when developments are material.",
    features: [
      {
        title: "Actionable Market Briefings",
        subtitle: "Focused coverage of catalysts, company updates, and macro shifts that move prices. No fluff, just what matters and why."
      },
      {
        title: "Early Ticker Calls",
        subtitle: "We flag underfollowed tickers and emerging themes before the crowd, with the setup, risks, and what to watch next."
      }
    ],
    ctaHeadline: "Get the Brief",
    ctaSubline: "Free. No spam. Unsubscribe anytime.",
    button: "Subscribe Free"
  },
  secondary: {
    headline: "News With An Edge",
    subtitle: "Concise reporting, early signals, and the context to act. Built for investors who move first.",
    features: [
      {
        title: "Catalyst Focus",
        subtitle: "Earnings, guidance, regulatory shifts, product launches, capital flows. Only events that change expectations."
      },
      {
        title: "Clarity and Context",
        subtitle: "Plain English on why it matters, possible paths from here, and the key indicators to monitor."
      }
    ],
    ctaHeadline: "Subscribe for Timely Briefs",
    ctaSubline: "Free. Unsubscribe anytime.",
    button: "Subscribe"
  }
}
} as const;

// Type definitions for better type safety
export type BrandCopy = typeof BRAND_COPY;
export type AuthCopy = BrandCopy['auth'];
