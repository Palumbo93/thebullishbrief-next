# Mobile ScrollingPopup Component Design

## Problem Statement

We need to create a mobile-only ScrollingPopup component that houses the SidebarJoinCTA content as a popup that appears during scroll interactions. This will provide better mobile UX by presenting the join CTA in a non-intrusive popup format instead of taking up permanent screen real estate.

**Value:** Improves mobile conversion rates by presenting the join CTA at optimal moments during content consumption without disrupting the reading experience.

**Requirements:**
- Mobile-only visibility (hidden on desktop/tablet)  
- Houses the existing SidebarJoinCTA component
- Scroll-triggered behavior with smart timing
- Non-intrusive popup design with smooth animations
- Easy dismissal mechanism

## Design Solution

### Component Architecture
- Use `useIsMobile()` hook for mobile detection
- Scroll-based trigger at 30% of content
- Auto-hide at 70% scroll (user is engaged)
- Slide-up animation from bottom
- Session-based dismissal tracking

### Integration
- Add to BriefPage after main content
- Only render on mobile devices
- Position fixed at bottom with proper z-index
- Wrap existing SidebarJoinCTA component

## Implementation Plan

### Phase 1: Core Component
1. ✅ Create ScrollingPopup component
2. ✅ Integrate into BriefPage  
3. ✅ Test functionality
