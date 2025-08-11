# Desktop Sonic Strategy Layout Design

## Problem Statement

The current sonic-strategy page is optimized for mobile with a single-column layout. We need to adapt it for desktop to provide a better user experience with:

1. **Left Column**: Interactive table of contents with video widget
2. **Center Column**: Main content sections
3. **Right Column**: Action menu, sign-up form, ticker widget, and company tickers

## Design Solution

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        BriefHeader                            │
├─────────────┬─────────────────────────┬───────────────────────┤
│             │                         │                       │
│   Left      │       Center            │      Right            │
│  Column     │      Content            │     Column            │
│             │                         │                       │
│ • TOC       │ • Hero Section         │ • Action Menu         │
│ • Video     │ • Treasury Revolution  │ • Sign-up Form        │
│   Widget    │ • Pattern Section      │ • Ticker Widget       │
│             │ • Technology Section   │ • Company Tickers     │
│             │ • Metrics Section      │                       │
│             │ • Milestones Section   │                       │
│             │ • Speed Section        │                       │
│             │ • Market Cap Section   │                       │
│             │ • Revenue Section      │                       │
│             │ • Team Section         │                       │
│             │ • Legal Disclaimer     │                       │
└─────────────┴─────────────────────────┴───────────────────────┘
```

### Component Architecture

#### 1. BriefHeader (Updated from BriefMobileHeader)
- **Responsive**: Works on both mobile and desktop
- **Desktop**: Full-width header with logo, navigation, and action button
- **Mobile**: Compact header with hamburger menu
- **Features**: 
  - Logo on left
  - Center action button (conditional)
  - Menu button on right (mobile only)

#### 2. Left Column - Table of Contents
- **Interactive TOC**: Clickable sections that scroll to content
- **Active State**: Highlights current section based on scroll position
- **Video Widget**: Fixed at bottom of left column
- **Sticky**: Remains visible while scrolling main content

#### 3. Center Column - Main Content
- **Responsive Width**: Adapts to screen size
- **Sections**: All existing sections from mobile version
- **Scroll Behavior**: Smooth scrolling with TOC highlighting

#### 4. Right Column - Action Panel
- **Action Menu**: Quick access buttons
- **Sign-up Form**: Lead capture form
- **Ticker Widget**: TradingView widget for SPTZ
- **Company Tickers**: List of all company tickers by market
- **Sticky**: Remains visible while scrolling

### Responsive Breakpoints

- **Mobile (< 768px)**: Single column layout (current)
- **Tablet (768px - 1024px)**: Two column layout (TOC + Content)
- **Desktop (> 1024px)**: Three column layout (TOC + Content + Action Panel)

### Implementation Plan

#### Phase 1: Update BriefHeader
1. Rename `BriefMobileHeader.tsx` to `BriefHeader.tsx`
2. Add desktop styles and responsive behavior
3. Update `BriefsLayout.tsx` to use new component

#### Phase 2: Create Desktop Layout Structure
1. Update `BriefsLayout.tsx` to support desktop layout
2. Add responsive grid system
3. Implement left column with TOC and video widget

#### Phase 3: Implement Right Column Components
1. Create action menu component
2. Create company tickers component
3. Integrate existing sign-up form and ticker widget

#### Phase 4: Content Adaptation
1. Update content sections for desktop layout
2. Implement smooth scrolling and TOC highlighting
3. Optimize video widget positioning

### Technical Specifications

#### Grid System
```css
/* Mobile */
.briefs-layout {
  display: flex;
  flex-direction: column;
}

/* Tablet */
@media (min-width: 768px) {
  .briefs-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 0;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .briefs-layout {
    grid-template-columns: 280px 1fr 320px;
  }
}
```

#### Column Specifications
- **Left Column**: 280px fixed width
- **Center Column**: Flexible width
- **Right Column**: 320px fixed width

#### Sticky Elements
- **Header**: Fixed at top
- **Left Column**: Sticky TOC with video widget at bottom
- **Right Column**: Sticky action panel

### Content Sections for TOC

1. Hero Section
2. Treasury Revolution
3. The Pattern Is Clear
4. Technology Overview
5. Sonic Metrics
6. Milestones
7. Speed Comparison
8. Market Cap
9. Revenue Model
10. Team

### Company Tickers by Market

#### US Markets
- **MSTR** - MicroStrategy
- **SBET** - Sharplink Gaming
- **SRM** - SRM Entertainment
- **SONN** - Sonnet BioTherapeutics

#### Canadian Markets
- **SPTZ** - Sonic Strategy (CSE)

#### Crypto Markets
- **$SONC** - Sonic (Sonic blockchain)
- **$SONCF** - Sonic (Futures)

### Success Metrics

1. **Desktop Engagement**: Increased time on page for desktop users
2. **Navigation**: Improved content discovery through TOC
3. **Conversion**: Higher lead capture through prominent sign-up form
4. **Performance**: Maintained fast loading times
5. **Accessibility**: WCAG 2.1 AA compliance

### Implementation Notes

- Maintain existing mobile experience
- Use CSS Grid for responsive layout
- Implement intersection observer for TOC highlighting
- Ensure video widget works in both mobile and desktop contexts
- Preserve all existing functionality and animations 