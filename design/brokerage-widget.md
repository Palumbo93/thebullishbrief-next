# BrokerageWidget Design Document

## Overview
A widget component that provides quick links to view stock tickers across major Canadian brokerage platforms, integrated into the BriefsActionPanel.

## Problem Statement
Users viewing stock briefs need quick access to view ticker information across major Canadian brokerage platforms without manually navigating to each site and searching for the ticker.

## Requirements

### Functional Requirements
- Accept ticker symbol as prop (e.g., "SPTZ.CN", "SHOP.TO")
- Generate quick links to major Canadian brokerages
- Use JSON configuration for brokerage link templates
- Display brokerage logos for visual appeal
- Open links in new tabs
- Handle Canadian exchange formats (.CN, .TO, etc.)
- Integrate seamlessly with BriefsActionPanel styling

### Non-Functional Requirements
- Responsive design matching existing action panel patterns
- Fast loading with optimized logos
- Accessible with proper ARIA labels
- SEO-friendly with proper rel attributes

## Target Brokerages

### Primary (Phase 1)
1. **Questrade** - Online discount broker
2. **Wealthsimple Trade** - Commission-free trading
3. **TD Direct Investing** - Major bank brokerage
4. **RBC Direct Investing** - Major bank brokerage

### Secondary (Phase 2)
5. **BMO InvestorLine** - Bank brokerage
6. **Scotia iTRADE** - Bank brokerage
7. **CIBC Investor's Edge** - Bank brokerage
8. **Interactive Brokers** - Professional platform

## Logo Sourcing Strategy

### Logo Acquisition
1. **Official Sources**
   - Company media kits/press pages
   - Official websites (homepage logos)
   - Wikipedia pages (verified logos)

2. **Third-party Sources**
   - SeekLogo.com (high-quality vectors)
   - Company annual reports
   - Official mobile app icons

3. **Technical Specifications**
   - Format: SVG preferred, PNG fallback
   - Size: 32x32px for compact display
   - Background: Transparent
   - Quality: High-resolution for retina displays

### Usage Compliance
- Review brand guidelines for each brokerage
- Ensure fair use for informational linking
- Maintain original proportions and colors
- No modification of logos without permission

## Database Schema

### Brief Table Extension
Add new column to briefs table:
```sql
ALTER TABLE briefs 
ADD COLUMN brokerage_links JSONB;
```

### Brokerage Links JSON Structure
```json
{
  "questrade": "https://myportal.questrade.com/investing/summary/quote/SPTZ.CN",
  "wealthsimple": "https://www.wealthsimple.com/en-ca/trade/stock/SPTZ.CN",
  "td_direct": "https://webbroker.td.com/waw/brk/quote?symbol=SPTZ.CN",
  "rbc_direct": "https://www.rbcdirectinvesting.com/trading/quote/SPTZ.CN"
}
```

## Technical Architecture

### Component Structure
```
BrokerageWidget/
├── BrokerageWidget.tsx          # Main component
├── brokerageConfig.json         # Brokerage configuration file
└── logos/                       # Logo assets
    ├── questrade.svg
    ├── wealthsimple.svg
    ├── td-direct.svg
    └── ...
```

### Brokerage Configuration File
```json
{
  "brokerages": [
    {
      "id": "questrade",
      "name": "Questrade",
      "logoPath": "/images/brokerages/questrade.svg"
    },
    {
      "id": "wealthsimple",
      "name": "Wealthsimple Trade", 
      "logoPath": "/images/brokerages/wealthsimple.svg"
    },
    {
      "id": "td_direct",
      "name": "TD Direct Investing",
      "logoPath": "/images/brokerages/td-direct.svg"
    },
    {
      "id": "rbc_direct",
      "name": "RBC Direct Investing",
      "logoPath": "/images/brokerages/rbc-direct.svg"
    }
  ]
}
```

### Component Interface
```typescript
interface BrokerageWidgetProps {
  brokerageLinks: BrokerageLinksData | null;
  className?: string;
}

interface BrokerageLinksData {
  [brokerageId: string]: string; // brokerage id -> direct link
}

interface BrokerageConfig {
  id: string;
  name: string;
  logoPath: string;
}
```

## UI/UX Design

### Layout
- Grid layout similar to existing ticker items
- Logo + name + "View on [Brokerage]" pattern
- Hover effects matching action panel styling
- Mobile-responsive single column

### Visual Design
```css
.brokerage-widget {
  /* Similar to .briefs-tickers-section */
  padding: 2rem 1.5rem;
  border-top: 0.5px solid var(--color-border-primary);
}

.brokerage-item {
  /* Similar to .briefs-ticker-item */
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg-tertiary);
  border: 0.5px solid var(--color-border-primary);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
```

### Accessibility
- Alt text for logos
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly

## Integration with BriefsActionPanel

### Placement Options
1. **Replace existing ticker section** - Show both tickers and brokerage links
2. **Separate section** - Add new "Quick Trade" section
3. **Combined section** - Integrate into "Related Tickers" section

### Recommended Approach
Add as separate section after "Related Tickers":
```tsx
{/* Related Tickers - existing */}
<div className="briefs-tickers-section">...</div>

{/* Brokerage Widget - new */}
{brief?.brokerage_links && (
  <BrokerageWidget 
    brokerageLinks={brief.brokerage_links}
  />
)}
```

## Implementation Phases

### Phase 1: Core Widget
- [ ] Add brokerage_links column to briefs table
- [ ] Create BrokerageWidget component
- [ ] Implement configuration system
- [ ] Source and optimize logos for Questrade, Wealthsimple
- [ ] Integrate into BriefsActionPanel
- [ ] Basic styling and responsive design

### Phase 2: Expansion
- [ ] Add TD Direct, RBC Direct Investing
- [ ] URL template validation
- [ ] Exchange-specific filtering
- [ ] Enhanced error handling

### Phase 3: Enhancement
- [ ] Add remaining major brokerages
- [ ] Logo caching optimization
- [ ] Analytics tracking for clicks
- [ ] A/B testing for placement

## Technical Considerations

### Performance
- Lazy load logos
- Cache brokerage configuration
- Minimize bundle size impact

### Error Handling
- Fallback for missing logos
- Invalid ticker handling
- Network error graceful degradation

### Testing Strategy
- Unit tests for URL generation
- Visual regression tests for logos
- Accessibility testing
- Cross-browser compatibility

## Success Metrics
- Click-through rate to brokerage platforms
- User engagement with ticker-related content
- Reduced bounce rate on brief pages
- Positive user feedback

## Future Enhancements
- Real-time price integration
- Brokerage account balance integration
- Custom brokerage preferences
- International brokerage support
