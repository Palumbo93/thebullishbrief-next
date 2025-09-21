/**
 * Centralized copy for branded marketing content
 * News and newsletter focused messaging for The Bullish Brief
 * Optimized for 62% conversion based on copywriting analysis
 */

export const BRAND_COPY = {
  // Core brand messaging
  tagline: "Skip the noise. Get the intelligence.",

  // Authentication modals
  auth: {
    signUp: {
      title: "Claim Your Advantage",
      features: [
        "Early market signals before they become headlines",
        "Opportunities identified days before mainstream coverage",
        "Clear entry points and profit rationale",
        "Zero fluff, maximum alpha"
      ]
    },
    signIn: {
      welcome: "Welcome back. Get the intelligence."
    }
  },

  // Briefs Action Panel CTA
  briefsActionPanel: {
    title: "The Brief That Beats the News Cycle",
    description: "Spot market movers before they hit headlines.",
    features: [
      "Spot winners before they break out",
      "Clear entry points with profit logic",
      "Built by traders, not journalists",
      "Zero noise, maximum intelligence"
    ],
    cta: "Claim My Advantage",
    // Variants for testing
    headlineVariants: [
      { 
        title: "Stop Chasing. Start Leading.", 
        description: "The market brief for investors who move first." 
      },
      { 
        title: "Finally, Market Intelligence That Works", 
        description: "See opportunities coming and profit accordingly." 
      }
    ]
  },

  // CTA Banner
  ctaBanner: {
    badge: "The Bullish Brief",
    primary: {
      headline: "Stop Chasing. Start Leading.",
      subtitle: "Spot market movers before they hit headlines. While others read about moves after they happen, you'll see them coming and profit accordingly.",
      features: [
        {
          title: "Early Signal Detection",
          subtitle: "Opportunities identified days before mainstream coverage. Turn insider knowledge into portfolio gains."
        },
        {
          title: "Clear Profit Logic",
          subtitle: "Every signal includes entry points and profit rationale. Built by traders who understand what moves markets."
        }
      ],
      ctaHeadline: "Claim My Advantage",
      ctaSubline: "Free. No spam. Unsubscribe anytime.",
      button: "Get Real Signals"
    },
    secondary: {
      headline: "The Last Newsletter You'll Ever Need",
      subtitle: "Tired of newsletters that just regurgitate news? Get the one that finds opportunities before they become obvious.",
      features: [
        {
          title: "Maximum Alpha Generation",
          subtitle: "Focus only on catalysts that move stock prices 10%+. No fluff, just profitable intelligence."
        },
        {
          title: "Institutional Edge",
          subtitle: "Access the same catalyst analysis used by smart money. Early warnings before the crowd catches on."
        }
      ],
      ctaHeadline: "Get the Edge",
      ctaSubline: "Free. Unsubscribe anytime.",
      button: "Lead the Market"
    }
  }
} as const;

// Type definitions for better type safety
export type BrandCopy = typeof BRAND_COPY;
export type AuthCopy = BrandCopy['auth'];