# Country-Based Ticker and Brokerage Selection Enhancement

## Problem Statement

Currently, the BrokerageWidget fetches geolocation independently, and the ticker selection logic (`getFirstTickerSymbol`) simply picks the first available ticker without considering the user's geographic location. This creates suboptimal user experiences:

1. **Redundant geolocation calls**: Each BrokerageWidget instance fetches country data independently
2. **Irrelevant ticker displays**: Users see ticker exchanges that may not be relevant to their region
3. **Missed optimization opportunities**: Country data could benefit both brokerage filtering and ticker selection
4. **Performance overhead**: Multiple geolocation API calls per page

### Example Scenario
A brief with tickers `[{"CSE": "SPTZ"}, {"OTC": "DBKSF"}]`:
- **Canadian users** should see CSE:SPTZ (more relevant domestic exchange)
- **US users** should see OTC:DBKSF (more accessible US exchange)
- **Default fallback** to Canadian exchange for other regions

## Goals

1. **Centralized Geolocation**: Move country detection to BriefPage level for shared context
2. **Smart Ticker Selection**: Show country-appropriate ticker exchanges (CSE for Canada, OTC for US)
3. **Performance Optimization**: Single geolocation call per page load
4. **Enhanced User Experience**: More relevant ticker and brokerage information
5. **Flexible Configuration**: Support multiple exchanges per country with sensible defaults

## Technical Requirements

### Functional Requirements
- Fetch user country once at BriefPage level
- Pass country context to both BrokerageWidget and ticker selection logic
- Implement country-based ticker exchange selection (CSE for Canada, OTC for US)
- Support multiple exchange types per country with priority ordering
- Maintain backward compatibility with existing ticker data structure
- Default to Canadian exchanges when country detection fails

### Non-Functional Requirements
- Performance: Single geolocation API call per page
- Reliability: Graceful fallback when geolocation fails
- Maintainability: Clean separation of concerns
- Scalability: Easy to add new countries and exchange mappings

## Technical Architecture

### 1. Country Context Flow
```
BriefPage → Fetch Country → Pass to Components
    ↓
    ├── BrokerageWidget (receives country prop)
    └── Ticker Selection Logic (uses country for exchange selection)
```

### 2. Exchange Priority Mapping
```typescript
const EXCHANGE_PRIORITY = {
  CA: ['CSE', 'TSX', 'TSXV'],  // Canada: CSE first, then TSX, TSXV
  US: ['OTC', 'NASDAQ', 'NYSE'], // US: OTC first, then major exchanges
  DEFAULT: ['CSE', 'TSX', 'OTC'] // Fallback priority
};
```

### 3. Component Updates

#### BriefPage Changes
- Add geolocation fetch logic (moved from BrokerageWidget)
- Manage country state and loading states
- Pass country to BrokerageWidget and ticker selection
- Handle geolocation errors with fallback

#### BrokerageWidget Changes
- Remove internal geolocation logic
- Accept country as prop instead of fetching internally
- Remove loading states (handled by parent)
- Simplify component logic

#### Ticker Selection Updates
- Create new `getCountryAppropriateTickerSymbol` function
- Implement exchange priority logic based on country
- Maintain backward compatibility with existing `getFirstTickerSymbol`

## Implementation Plan

### Phase 1: Move Geolocation to BriefPage
1. Extract geolocation logic from BrokerageWidget
2. Add country state management to BriefPage
3. Implement loading and error states at page level
4. Update BrokerageWidget to accept country prop

### Phase 2: Country-Based Ticker Selection
1. Create exchange priority mapping configuration
2. Implement `getCountryAppropriateTickerSymbol` function
3. Update ticker widget generation logic in BriefPage
4. Add comprehensive error handling and fallbacks

### Phase 3: Testing & Optimization
1. Test with various ticker combinations and countries
2. Verify fallback behavior when geolocation fails
3. Performance testing for reduced API calls
4. Mobile and edge case testing

## Detailed Implementation

### 1. Updated BriefPage Structure
```typescript
const BriefPage: React.FC<BriefPageProps> = ({ briefSlug, onCreateAccountClick }) => {
  const [country, setCountry] = useState<string>('CA'); // Default Canada
  const [countryLoading, setCountryLoading] = useState(true);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // Fetch country on mount
  useEffect(() => {
    fetchUserCountry()
      .then(setCountry)
      .catch(error => {
        console.error('Geolocation failed:', error);
        setGeolocationError('Unable to detect location');
        // Keep default 'CA'
      })
      .finally(() => setCountryLoading(false));
  }, []);

  // Generate country-appropriate ticker widget
  const firstTickerSymbol = brief ? 
    getCountryAppropriateTickerSymbol(brief.tickers, country) : null;
    
  const tickerWidget = (
    <div>
      {firstTickerSymbol && (
        <TradingViewWidget symbol={firstTickerSymbol} />
      )}
      {brief?.widget_code && (
        <CustomWidget code={brief.widget_code} title="Additional Widget" />
      )}
    </div>
  );

  // Pass country to BrokerageWidget
  const briefActionPanel = brief ? {
    // ... existing props
    country,
    countryLoading,
    geolocationError
  } : null;
};
```

### 2. Enhanced Ticker Selection Logic
```typescript
// src/utils/tickerUtils.ts
interface ExchangePriorityMap {
  [countryCode: string]: string[];
}

const EXCHANGE_PRIORITY: ExchangePriorityMap = {
  CA: ['CSE', 'TSX', 'TSXV'], // Canadian exchanges in priority order
  US: ['OTC', 'NASDAQ', 'NYSE'], // US exchanges in priority order
  DEFAULT: ['CSE', 'TSX', 'OTC'] // Default fallback priority
};

export const getCountryAppropriateTickerSymbol = (
  tickers: any, 
  country: string = 'CA'
): string | null => {
  if (!tickers) return null;

  try {
    const exchangePriority = EXCHANGE_PRIORITY[country] || EXCHANGE_PRIORITY.DEFAULT;
    
    if (Array.isArray(tickers)) {
      // For each priority exchange, try to find a matching ticker
      for (const exchange of exchangePriority) {
        for (const ticker of tickers) {
          if (typeof ticker === 'object' && ticker !== null && ticker[exchange]) {
            return `${exchange}:${ticker[exchange]}`;
          }
        }
      }
      
      // Fallback to first available ticker
      return getFirstTickerSymbol(tickers);
    }
    
    // Handle single ticker object
    if (typeof tickers === 'object' && tickers !== null) {
      for (const exchange of exchangePriority) {
        if (tickers[exchange]) {
          return `${exchange}:${tickers[exchange]}`;
        }
      }
    }
  } catch (error) {
    console.error('Error getting country-appropriate ticker symbol:', error);
  }

  return null;
};
```

### 3. Updated BrokerageWidget Interface
```typescript
interface BrokerageWidgetProps {
  brokerageLinks: BrokerageLinksData | null;
  className?: string;
  briefId?: string;
  briefTitle?: string;
  location?: 'action_panel' | 'inline';
  country: string; // NEW: passed from parent
  geolocationError?: string | null; // NEW: error state from parent
}
```

### 4. Geolocation Utility
```typescript
// src/utils/geolocation.ts
export const fetchUserCountry = async (): Promise<string> => {
  try {
    const response = await fetch('/api/geolocation/brokerages');
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data');
    }
    
    const data = await response.json();
    return data.country || 'CA';
  } catch (error) {
    console.error('Error fetching user country:', error);
    throw error;
  }
};
```

## Example Ticker Selection Scenarios

### Scenario 1: Brief with CSE and OTC
```json
{
  "tickers": [{"CSE": "SPTZ"}, {"OTC": "DBKSF"}]
}
```
- **Canadian user**: Shows `CSE:SPTZ`
- **US user**: Shows `OTC:DBKSF`
- **Other countries**: Shows `CSE:SPTZ` (default)

### Scenario 2: Brief with Multiple Canadian Exchanges
```json
{
  "tickers": [{"TSX": "SHOP"}, {"TSXV": "ABCD"}]
}
```
- **Canadian user**: Shows `TSX:SHOP` (TSX has priority over TSXV)
- **US user**: Shows `TSX:SHOP` (falls back to first available)

### Scenario 3: Brief with Only US Exchange
```json
{
  "tickers": [{"NASDAQ": "AAPL"}]
}
```
- **All users**: Shows `NASDAQ:AAPL` (only option available)

## Performance Benefits

1. **Reduced API Calls**: Single geolocation request per page vs. multiple widget-level requests
2. **Faster Loading**: Parallel loading of country and brief data
3. **Better Caching**: Single country value cached for entire page session
4. **Improved UX**: Consistent loading states across all country-dependent components

## Backward Compatibility

- Existing `getFirstTickerSymbol` function remains unchanged
- BrokerageWidget accepts country as optional prop (defaults to 'CA')
- Ticker data structure remains the same
- Existing briefs continue to work without modification

## Error Handling & Fallbacks

1. **Geolocation API Failure**: Default to Canada ('CA')
2. **Invalid Country Code**: Use DEFAULT exchange priority
3. **No Matching Exchange**: Fall back to `getFirstTickerSymbol`
4. **Network Errors**: Show appropriate user messaging

## Testing Strategy

### Unit Tests
- `getCountryAppropriateTickerSymbol` with various ticker combinations
- Exchange priority logic for different countries
- Fallback behavior for edge cases

### Integration Tests
- BriefPage geolocation flow
- BrokerageWidget with country props
- Ticker widget generation with country context

### Manual Testing
- Test with VPN to different countries
- Test with various ticker combinations
- Test geolocation failure scenarios
- Mobile device testing

## Success Metrics

- **Performance**: 50% reduction in geolocation API calls
- **User Experience**: More relevant ticker displays for regional users
- **Reliability**: <1% failure rate with robust fallbacks
- **Maintainability**: Clean separation of concerns, easier testing

## Future Enhancements

1. **Regional Exchange Support**: Province/state-specific exchange preferences
2. **User Preference Override**: Allow manual country/exchange selection
3. **Analytics**: Track which exchanges are most relevant by region
4. **Intelligent Caching**: Cache country preferences per user session
5. **Multi-Exchange Display**: Show multiple relevant exchanges per country

## Risk Mitigation

**Risk**: Breaking existing ticker display
**Mitigation**: Comprehensive fallback to existing `getFirstTickerSymbol`

**Risk**: Geolocation privacy concerns  
**Mitigation**: Country-level detection only, no personal data stored

**Risk**: Performance regression
**Mitigation**: Single API call optimization, thorough performance testing

**Risk**: Complex country/exchange mapping
**Mitigation**: Simple, configurable mapping with clear defaults
