# Content Link Color Update

## Problem Statement

Currently, links within article and brief content use `var(--color-text-primary)` (white/black depending on theme), which makes them visually identical to regular text except for the underline. This reduces the visual hierarchy and makes it harder for users to identify clickable elements within content.

**Key Issues:**
- Links blend in with regular text content
- Poor visual hierarchy for clickable elements
- Inconsistent with UI patterns where primary color typically indicates interactive elements
- Reduces user awareness of available links within content

**Goal:** Update all content links to use `var(--color-primary)` to improve visual hierarchy, maintain consistency with the design system, and enhance user experience.

## Design Solution

### Color Strategy
- **Primary Links**: Use `var(--color-primary)` (#164fa7 - blue) for all content links
- **Maintain Underlines**: Keep text-decoration underline for accessibility
- **Hover States**: Remove underline on hover for interactive feedback
- **Consistency**: Apply to all link types within content (regular HTML links, Twitter handles, stock tickers)

### Scope of Changes
- **ArticlePage content**: Links within `.html-content` and `.brief-html-content` classes
- **BriefPage content**: Links within processed content areas
- **Dynamic links**: Twitter handles (@username) and stock tickers ($TICKER) processed by JavaScript
- **Maintain existing**: Keep current colors for navigation, UI buttons, and other interface elements

### Technical Approach
1. Update CSS rules for `.html-content a` to use `var(--color-primary)`
2. Update inline styles in JavaScript link processing functions
3. Ensure consistency across all content rendering paths

## Implementation Plan

### Phase 1: CSS Updates
- Update `.html-content a` styles in globals.css
- Ensure proper specificity with `!important` declarations
- Test across both light and dark themes

### Phase 2: JavaScript Processing
- Update `processTextWithLinks` in ArticlePage.tsx for Twitter handles and stock tickers
- Update `processTextWithLinks` in BriefPage.tsx for consistency
- Maintain existing functionality while updating colors

### Phase 3: Testing
- Test ArticlePage content links
- Test BriefPage content links  
- Test dynamically processed links (Twitter handles, stock tickers)
- Verify accessibility and readability

## Success Criteria

- All content links display in primary color (#164fa7)
- Links remain accessible and readable
- Hover states work correctly
- No visual regressions in other parts of the application
- Consistent styling across ArticlePage and BriefPage content
- Dynamic link processing maintains new color scheme

## Files to Modify

1. `src/app/globals.css` - Update `.html-content a` styles
2. `src/page-components/ArticlePage.tsx` - Update `processTextWithLinks` inline styles  
3. `src/page-components/BriefPage.tsx` - Update `processTextWithLinks` inline styles

## Rollback Plan

If issues arise, revert CSS changes to use `var(--color-text-primary)` and restore original inline style colors in JavaScript processing functions.
