/**
 * Utility for loading offline analytics data when API rate limits are hit
 */

import { ExtendedTrafficData } from '../components/admin/TrafficSourceAnalytics';

export interface OfflineAnalyticsData {
  metadata: {
    exportedAt: string;
    page: string;
    numOfDays: number;
    totalSources: number;
    isRateLimited: boolean;
  };
  data: ExtendedTrafficData[];
}

/**
 * Load offline analytics data from a JSON file
 * This can be used when the API is rate limited
 */
export const loadOfflineAnalyticsData = async (): Promise<OfflineAnalyticsData | null> => {
  try {
    // In a real implementation, you would load from a file you've downloaded
    // For now, we'll return null to indicate no offline data is available
    // You can replace this with actual file loading logic
    
    // Example of how you might load from a local file:
    // const response = await fetch('/data/analytics-sample-data.json');
    // if (response.ok) {
    //   return await response.json();
    // }
    
    return null;
  } catch (error) {
    console.error('Error loading offline analytics data:', error);
    return null;
  }
};

/**
 * Generate mock data for development when offline data is not available
 */
export const generateMockAnalyticsData = (page: string = 'all', numOfDays: number = 3): OfflineAnalyticsData => {
  const baseMultiplier = page === '/' ? 1.5 : page === '/briefs' ? 1.2 : page === '/articles' ? 1.0 : 0.8;
  const intentMultiplier = page === '/briefs' ? 1.4 : page === '/articles' ? 1.2 : 1.0;
  
  const mockData: ExtendedTrafficData[] = [
    {
      source: 'Google',
      sessions: Math.floor(1250 * baseMultiplier),
      pageViews: Math.floor(1890 * baseMultiplier),
      engagementTime: 180,
      scrollDepth: 75,
      bounceRate: page === '/' ? 45 : page === '/briefs' ? 35 : 50,
      brokerageClicks: Math.floor(1250 * baseMultiplier * 0.12 * intentMultiplier),
      mediumIntentVisitors: Math.floor(1250 * baseMultiplier * 0.25 * intentMultiplier),
      highIntentVisitors: Math.floor(1250 * baseMultiplier * 0.187 * intentMultiplier),
      mediumIntentPercentage: 25.3 * intentMultiplier,
      highIntentPercentage: 18.7 * intentMultiplier,
    },
    {
      source: 'Direct',
      sessions: Math.floor(890 * baseMultiplier),
      pageViews: Math.floor(1120 * baseMultiplier),
      engagementTime: 210,
      scrollDepth: 82,
      bounceRate: page === '/' ? 38 : page === '/briefs' ? 28 : 45,
      brokerageClicks: Math.floor(890 * baseMultiplier * 0.15 * intentMultiplier),
      mediumIntentVisitors: Math.floor(890 * baseMultiplier * 0.321 * intentMultiplier),
      highIntentVisitors: Math.floor(890 * baseMultiplier * 0.224 * intentMultiplier),
      mediumIntentPercentage: 32.1 * intentMultiplier,
      highIntentPercentage: 22.4 * intentMultiplier,
    },
    {
      source: 'Facebook',
      sessions: Math.floor(560 * baseMultiplier),
      pageViews: Math.floor(672 * baseMultiplier),
      engagementTime: 95,
      scrollDepth: 58,
      bounceRate: 62,
      brokerageClicks: Math.floor(560 * baseMultiplier * 0.08 * intentMultiplier),
      mediumIntentVisitors: Math.floor(560 * baseMultiplier * 0.182 * intentMultiplier),
      highIntentVisitors: Math.floor(560 * baseMultiplier * 0.121 * intentMultiplier),
      mediumIntentPercentage: 18.2 * intentMultiplier,
      highIntentPercentage: 12.1 * intentMultiplier,
    },
    {
      source: 'Twitter/X',
      sessions: Math.floor(320 * baseMultiplier),
      pageViews: Math.floor(456 * baseMultiplier),
      engagementTime: 120,
      scrollDepth: 68,
      bounceRate: 55,
      brokerageClicks: Math.floor(320 * baseMultiplier * 0.10 * intentMultiplier),
      mediumIntentVisitors: Math.floor(320 * baseMultiplier * 0.217 * intentMultiplier),
      highIntentVisitors: Math.floor(320 * baseMultiplier * 0.143 * intentMultiplier),
      mediumIntentPercentage: 21.7 * intentMultiplier,
      highIntentPercentage: 14.3 * intentMultiplier,
    },
    {
      source: 'LinkedIn',
      sessions: Math.floor(180 * baseMultiplier),
      pageViews: Math.floor(234 * baseMultiplier),
      engagementTime: 240,
      scrollDepth: 88,
      bounceRate: 35,
      brokerageClicks: Math.floor(180 * baseMultiplier * 0.18 * intentMultiplier),
      mediumIntentVisitors: Math.floor(180 * baseMultiplier * 0.358 * intentMultiplier),
      highIntentVisitors: Math.floor(180 * baseMultiplier * 0.249 * intentMultiplier),
      mediumIntentPercentage: 35.8 * intentMultiplier,
      highIntentPercentage: 24.9 * intentMultiplier,
    }
  ];

  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      page,
      numOfDays,
      totalSources: mockData.length,
      isRateLimited: true
    },
    data: mockData
  };
};

/**
 * Instructions for using offline data:
 * 
 * 1. When you hit rate limits, click the "Download JSON" button in the Analytics Manager
 * 2. Save the downloaded file to your project (e.g., in src/data/analytics-offline-data.json)
 * 3. Update the loadOfflineAnalyticsData function to load from your saved file
 * 4. The component will automatically use this data when the API is rate limited
 * 
 * Example usage in TrafficSourceAnalytics component:
 * 
 * ```typescript
 * // In the catch block when rate limited:
 * const offlineData = await loadOfflineAnalyticsData();
 * if (offlineData) {
 *   setData(offlineData.data);
 * } else {
 *   // Fallback to generated mock data
 *   const mockData = generateMockAnalyticsData(selectedPage, numOfDays);
 *   setData(mockData.data);
 * }
 * ```
 */
