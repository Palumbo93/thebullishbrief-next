/**
 * Microsoft Clarity Type Definitions
 * For heatmaps and session recordings only (cookie-free configuration)
 */

declare global {
  interface Window {
    clarity: {
      (action: 'set', key: 'cookies' | 'track', value: boolean): void;
      (action: string, ...args: any[]): void;
      q?: any[];
    };
  }
}

export {};
