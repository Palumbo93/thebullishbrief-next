# Brief Mobile Header Logo Replacement

## Problem Statement

Currently, on brief pages, the mobile header displays company tickers (like "NASDAQ:AAPL") in the left section next to the menu button. This creates visual clutter and inconsistency with other pages that show The Bullish Brief's main logo. We want to replace the ticker display with the main bull logo for a cleaner, more branded mobile header experience.

## Requirements

### Functional Requirements
- Replace ticker display with The Bullish Brief main logo on brief pages mobile header
- Maintain menu button functionality in left section
- Preserve share and more action buttons in right section  
- Keep logo clickable behavior (opens action panel)
- Ensure responsive design works across mobile devices

### Non-Functional Requirements
- Maintain visual consistency with other page mobile headers
- Preserve accessibility features (ARIA labels, keyboard navigation)
- No performance impact on mobile header rendering

## Current Implementation

The mobile header for brief pages currently uses:

```typescript
// In mobileHeaderConfigs.ts - brief configuration
brief: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
  leftSection: {
    showMenu: true,
    branding: {  // Currently shows company tickers
      companyName: props.companyName,
      tickers: props.tickers,
      onClick: props.onLogoClick
    }
  },
  rightSection: {
    actions: [share, more buttons]
  }
})
```

This uses `MobileHeaderBranding` component which displays ticker badges.

## Proposed Solution

### Approach
Replace the `branding` configuration with `logo` configuration in the brief mobile header setup, matching the pattern used by home, article, and other page types.

### Implementation Plan

1. **Update Mobile Header Configuration**
   - Modify `mobileHeaderConfigs.ts` brief configuration
   - Change from `branding` to `logo` in left section
   - Use `type: 'main'` to show The Bullish Brief logo

2. **Preserve Functionality**
   - Keep `onClick` handler for action panel opening
   - Maintain all existing ARIA labels and accessibility features
   - Ensure right section actions remain unchanged

### Code Changes

**File: `src/utils/mobileHeaderConfigs.ts`**
```typescript
// Brief Page: (Menu, Main Logo) | Spacer | More Button, Share Button  
brief: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
  leftSection: {
    showMenu: true,
    logo: {  // Changed from 'branding' to 'logo'
      type: 'main',
      alt: 'The Bullish Brief Logo',
      fallback: 'TB',
      onClick: props.onLogoClick
    }
  },
  rightSection: {
    actions: [
      ...(props.onShareClick ? [{
        type: 'share' as const,
        onClick: props.onShareClick
      }] : []),
      ...(props.onMoreClick ? [{
        type: 'more' as const,
        onClick: props.onMoreClick,
        active: props.moreActive
      }] : [])
    ]
  },
  onMenuClick: props.onMenuClick
})
```

### Visual Impact

**Before:**
```
[Menu] [NASDAQ:AAPL] [NASDAQ:MSFT] | Spacer | [Share] [More]
```

**After:**
```
[Menu] [Bull Logo] | Spacer | [Share] [More]
```

### Benefits

1. **Consistency**: All page types now show the main logo in mobile header
2. **Cleaner Design**: Removes ticker clutter from mobile header
3. **Better Branding**: Reinforces The Bullish Brief brand identity
4. **Simplified Layout**: Reduces cognitive load on mobile users

### Risks & Considerations

1. **Ticker Information Loss**: Tickers will no longer be immediately visible in header
   - **Mitigation**: Tickers remain available in the action panel (accessed via More button)
   - **Mitigation**: Tickers are still prominently displayed in the main content area

2. **User Behavior Change**: Users accustomed to seeing tickers in header
   - **Impact**: Low - tickers are still accessible via action panel
   - **Benefit**: Cleaner, less cluttered mobile experience

### Testing Plan

1. **Visual Testing**
   - Verify logo displays correctly on various mobile devices
   - Confirm consistent sizing with other page mobile headers
   - Test both light and dark themes

2. **Functional Testing**
   - Verify logo click opens action panel
   - Confirm menu button still works
   - Test share and more buttons remain functional

3. **Accessibility Testing**
   - Verify ARIA labels are correct
   - Test keyboard navigation
   - Confirm screen reader compatibility

## Implementation Timeline

- **Phase 1**: Update mobile header configuration (30 minutes)
- **Phase 2**: Testing and validation (15 minutes) 
- **Total Estimated Time**: 45 minutes

## Success Criteria

- ✅ Brief pages mobile header shows main logo instead of tickers
- ✅ Logo click functionality preserved (opens action panel)
- ✅ Visual consistency with other page mobile headers
- ✅ No regression in mobile header functionality
- ✅ Accessibility features maintained
