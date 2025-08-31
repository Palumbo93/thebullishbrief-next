# Brokerage Widget Geolocation Enhancement

## Problem Statement

Currently, the BrokerageWidget shows the same set of brokerages to all users regardless of their geographic location. This creates a suboptimal user experience as users in the US see Canadian brokerages (Questrade, TD, RBC, etc.) that may not be relevant to them, and vice versa.

## Goals

1. **Geographic Relevance**: Show US brokerages to US users and Canadian brokerages to Canadian users
2. **Fallback Strategy**: Gracefully handle cases where geolocation fails or is unavailable
3. **Performance**: Minimize impact on page load times
4. **Privacy**: Respect user privacy while providing relevant content
5. **Maintainability**: Keep the solution simple and maintainable

## Technical Approach

### 1. IP Geolocation Service

**Primary Option: ipapi.co**
- Free tier: 1,000 requests/day
- Provides country code, region, city
- Simple REST API
- Good accuracy for country-level detection

**Alternative: ipify + ipgeolocation.io**
- ipify for IP detection
- ipgeolocation.io for geolocation
- More complex but potentially more accurate

### 2. Architecture

```
Client Request → Next.js API Route → IP Geolocation Service → Filter Brokerages → Return to Client
```

**API Route**: `/api/geolocation/brokerages`
- Server-side IP detection (more accurate than client-side)
- Caching to reduce API calls
- Fallback to default brokerages if geolocation fails

### 3. Brokerage Configuration Updates

**Current Structure**:
```json
{
  "brokerages": [
    { "id": "questrade", "name": "Questrade", ... },
    { "id": "wealthsimple", "name": "Wealthsimple", ... }
  ]
}
```

**Proposed Structure**:
```json
{
  "brokerages": {
    "CA": [
      { "id": "questrade", "name": "Questrade", ... },
      { "id": "wealthsimple", "name": "Wealthsimple", ... }
    ],
    "US": [
      { "id": "schwab", "name": "Charles Schwab", ... },
      { "id": "fidelity", "name": "Fidelity", ... },
      { "id": "etrade", "name": "E*TRADE", ... }
    ]
  }
}
```

### 4. Implementation Plan

#### Phase 1: API Route & Geolocation Service
1. Create `/api/geolocation/brokerages` endpoint
2. Integrate ipapi.co service
3. Add caching mechanism (Redis or in-memory)
4. Implement fallback logic

#### Phase 2: Brokerage Configuration
1. Update `brokerageConfig.json` structure
2. Add US brokerages to configuration
3. Maintain backward compatibility

#### Phase 3: BrokerageWidget Updates
1. Modify component to use geolocation API
2. Add loading states
3. Implement error handling
4. Add fallback to current behavior

#### Phase 4: Testing & Optimization
1. Test with different IP addresses
2. Performance optimization
3. Error handling refinement

### 5. Caching Strategy

**In-Memory Cache** (Simple approach):
- Cache country detection results for 24 hours
- Key: IP address
- Value: Country code

**Redis Cache** (Scalable approach):
- Better for production with multiple instances
- TTL: 24 hours
- Key: IP address
- Value: Country code

### 6. Error Handling

**Fallback Hierarchy**:
1. Try geolocation API
2. If API fails, use user's country preference (if available)
3. If no preference, show all brokerages (current behavior)
4. If all fails, show Canadian brokerages (current default)

### 7. Performance Considerations

- **Lazy Loading**: Only fetch geolocation when BrokerageWidget is rendered
- **Caching**: Cache results to avoid repeated API calls
- **Timeout**: Set reasonable timeout for geolocation API (2-3 seconds)
- **Non-blocking**: Don't block page load for geolocation

### 8. Privacy Considerations

- **No Personal Data**: Only collect country-level information
- **No Storage**: Don't store IP addresses in database
- **Transparency**: Document geolocation usage in privacy policy
- **Opt-out**: Consider allowing users to manually select region

## Implementation Details

### API Route Structure

```typescript
// /api/geolocation/brokerages
export async function GET(request: NextRequest) {
  try {
    // Get client IP
    const ip = getClientIP(request);
    
    // Check cache first
    const cachedCountry = await getCachedCountry(ip);
    if (cachedCountry) {
      return NextResponse.json({ country: cachedCountry });
    }
    
    // Fetch from geolocation service
    const country = await fetchCountryFromIP(ip);
    
    // Cache result
    await cacheCountry(ip, country);
    
    return NextResponse.json({ country });
  } catch (error) {
    // Return fallback
    return NextResponse.json({ country: 'CA' });
  }
}
```

### BrokerageWidget Updates

```typescript
const BrokerageWidget: React.FC<BrokerageWidgetProps> = ({ ... }) => {
  const [country, setCountry] = useState<string>('CA');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserCountry().then(setCountry).finally(() => setLoading(false));
  }, []);
  
  // Filter brokerages based on country
  const availableBrokerages = getBrokeragesForCountry(country);
  
  if (loading) {
    return <BrokerageWidgetSkeleton />;
  }
  
  // Rest of component...
};
```

## Testing Strategy

### Unit Tests
- API route functionality
- Brokerage filtering logic
- Error handling scenarios

### Integration Tests
- End-to-end geolocation flow
- Caching behavior
- Fallback mechanisms

### Manual Testing
- Test with VPN to different countries
- Test with invalid IP addresses
- Test API service failures

## Rollout Plan

1. **Development**: Implement and test locally
2. **Staging**: Deploy to staging with test IPs
3. **Production**: Gradual rollout with monitoring
4. **Monitoring**: Track API usage and error rates

## Success Metrics

- **Accuracy**: >95% correct country detection
- **Performance**: <500ms additional load time
- **Reliability**: <1% failure rate
- **User Experience**: Reduced bounce rate on brokerage widget

## Future Enhancements

1. **Region-specific brokerages**: Show different brokerages by state/province
2. **User preference override**: Allow manual region selection
3. **Analytics**: Track which brokerages are most clicked by region
4. **A/B Testing**: Test different brokerage configurations

## Risks & Mitigation

**Risk**: Geolocation API failures
**Mitigation**: Robust fallback mechanisms

**Risk**: Performance impact
**Mitigation**: Caching and lazy loading

**Risk**: Privacy concerns
**Mitigation**: Clear documentation and minimal data collection

**Risk**: API rate limits
**Mitigation**: Caching and monitoring
