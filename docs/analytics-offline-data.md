# Analytics Offline Data

This document explains how to use the offline data feature for analytics when you hit API rate limits.

## Overview

When the Microsoft Clarity API hits its daily rate limit, the Analytics Manager now provides a way to download the current data as JSON, which can be used as offline default data for development.

## How to Use

### 1. Download Data When Rate Limited

When you see the rate limit warning in the Analytics Manager:

1. Click the **"Download JSON"** button (blue button next to "Export CSV")
2. The system will download a JSON file with the current analytics data
3. The filename will be: `traffic-sources-{page}-last-{days}-days.json`

### 2. Use Downloaded Data for Development

1. Save the downloaded JSON file to your project (e.g., in `src/data/analytics-offline-data.json`)
2. The JSON structure includes:
   - `metadata`: Information about when the data was exported, which page, etc.
   - `data`: The actual analytics data array

### 3. Example JSON Structure

```json
{
  "metadata": {
    "exportedAt": "2024-01-15T10:30:00.000Z",
    "page": "all",
    "numOfDays": 3,
    "totalSources": 5,
    "isRateLimited": true
  },
  "data": [
    {
      "source": "Google",
      "sessions": 1875,
      "pageViews": 2835,
      "engagementTime": 180,
      "scrollDepth": 75,
      "bounceRate": 45,
      "brokerageClicks": 225,
      "mediumIntentVisitors": 469,
      "highIntentVisitors": 351,
      "mediumIntentPercentage": 25.0,
      "highIntentPercentage": 18.7
    }
    // ... more sources
  ]
}
```

## Implementation Details

### Files Added/Modified

- **`src/components/admin/TrafficSourceAnalytics.tsx`**: Added `exportJsonData()` function and "Download JSON" button
- **`src/utils/analyticsOfflineData.ts`**: Utility functions for loading offline data
- **`src/data/analytics-sample-data.json`**: Example of the JSON structure

### Key Features

1. **Simple Download**: One-click JSON download when rate limited
2. **Rich Metadata**: Includes export timestamp, page filter, and rate limit status
3. **Complete Data**: All analytics metrics are preserved in the JSON
4. **Development Ready**: Can be used as offline default data

### Usage in Code

The `analyticsOfflineData.ts` utility provides:

- `loadOfflineAnalyticsData()`: Load saved JSON data
- `generateMockAnalyticsData()`: Generate mock data as fallback

## Benefits

1. **No Data Loss**: When rate limited, you can still access the data you've already fetched
2. **Development Continuity**: Use real data for development instead of random mock data
3. **Simple Implementation**: Minimal code changes, maximum benefit
4. **Flexible**: Works with any page filter and time range

## Next Steps

To fully implement offline data loading:

1. Update `loadOfflineAnalyticsData()` in `analyticsOfflineData.ts` to load from your saved JSON file
2. Modify the error handling in `TrafficSourceAnalytics.tsx` to use offline data when available
3. Consider adding a file upload feature to load different datasets

This approach provides the simplest solution for handling rate limits while maintaining development productivity.
