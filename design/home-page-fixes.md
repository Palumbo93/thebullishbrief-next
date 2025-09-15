# Home Page Fixes - Design Document

## Problem Statement

The home page has several UI/UX issues that need to be addressed to improve consistency, readability, and visual hierarchy. These issues include inconsistent author display, misaligned visual elements, confusing section titles, and lack of proper component organization.

**Core Value:** Create a clean, consistent, and intuitive home page experience that properly displays content hierarchy and maintains visual coherence across all sections.

**Key Requirements:**
1. Fix author display logic to remove dots when no author is present
2. Redesign featured brief styling to match page consistency 
3. Correct date display logic across different content types
4. Improve section naming for better content clarity
5. Clean up content layout and author display in grid sections
6. Organize code into modular, reusable components
7. Ensure mobile-responsive design across all sections

## Current Issues Analysis

### Issue 1: Author Display Logic
- **Problem:** Dots (•) appear even when no author is present
- **Location:** Multiple sections throughout home page
- **Impact:** Poor visual hierarchy and confusing metadata display

### Issue 2: Featured Brief Styling
- **Problem:** Featured brief capsule doesn't visually align with rest of page design
- **Location:** Hero section when featured brief is displayed
- **Impact:** Inconsistent visual hierarchy and design language

### Issue 3: Date Display Logic
- **Problem:** 
  - Featured Brief shows date (shouldn't)
  - Featured Article doesn't show date (should)
  - Regular articles show date (correct)
- **Location:** Hero section and article grids
- **Impact:** Inconsistent content metadata display

### Issue 4: Section Title Overlap
- **Problem:** "Latest Stories" and "Latest News" are too similar and confusing
- **Location:** Section headers
- **Impact:** Poor content organization and user understanding

### Issue 5: Category Display Issues
- **Problem:** 
  - Category appears above image in top news grid (undesirable)
  - "By [blank]" appears when author is empty
- **Location:** Primary article in featured section
- **Impact:** Poor visual layout and confusing author attribution

### Issue 6: Component Organization
- **Problem:** All home page sections are inline in page.tsx
- **Location:** Entire home page structure
- **Impact:** Poor maintainability and code organization

### Issue 7: Mobile Adaptation
- **Problem:** Home page sections may not be properly mobile-optimized
- **Location:** All sections
- **Impact:** Poor mobile user experience

## Proposed Solution

### 1. Create Home Components Structure
```
src/components/home/
├── HeroSection.tsx          # Main featured content
├── FeaturedStoriesGrid.tsx  # Editorial grid layout  
├── LatestNewsGrid.tsx       # Recent articles grid
├── index.ts                 # Export barrel
```

### 2. Fix Author Display Logic
- Create helper function to handle author metadata display
- Only show dots (•) when both fields are present
- Apply consistently across all sections

### 3. Redesign Featured Brief Styling
- Align visual design with article styling patterns
- Ensure consistent spacing and typography
- Remove date display for briefs

### 4. Update Section Naming
- Change "Latest Stories" to "Featured Stories" 
- Change "Latest News" to "More Stories"
- Ensure clear content hierarchy

### 5. Improve Grid Layout
- Move category below title in primary article
- Fix empty author display logic
- Improve visual spacing and alignment

### 6. Mobile Responsive Design
- Implement proper mobile layouts for all sections
- Test responsive breakpoints
- Ensure touch-friendly interactions

## Implementation Plan

### Phase 1: Component Structure
1. Create `components/home/` directory
2. Extract HeroSection component with improved styling
3. Extract FeaturedStoriesGrid component with fixed layout
4. Extract LatestNewsGrid component with corrected metadata

### Phase 2: Fix Display Logic
1. Create author metadata helper functions
2. Fix date display logic for different content types
3. Update section titles and content hierarchy
4. Remove category above image in featured grid

### Phase 3: Mobile Optimization
1. Add responsive design to all home components
2. Test mobile layouts and interactions
3. Ensure proper touch targets and spacing

### Phase 4: Integration & Testing
1. Update main page.tsx to use new components
2. Test all functionality and visual consistency
3. Verify mobile responsive behavior

## Technical Considerations

### Component Props Interface
```typescript
interface HeroSectionProps {
  heroContent: Article | Brief | null;
  onArticleClick: (id: string, title: string, slug?: string) => void;
  onBriefClick: (id: string, title: string, slug?: string) => void;
}

interface FeaturedStoriesGridProps {
  articles: Article[];
  onArticleClick: (id: string, title: string, slug?: string) => void;
}

interface LatestNewsGridProps {
  articles: Article[];
  onArticleClick: (id: string, title: string, slug?: string) => void;
}
```

### Helper Functions
```typescript
// Format metadata with proper dot display logic
const formatMetadata = (items: (string | null | undefined)[]): string => {
  return items.filter(Boolean).join(' • ');
};

// Check if content should show date
const shouldShowDate = (content: Article | Brief, isHero: boolean): boolean => {
  if ('company_name' in content) return false; // Brief
  return !isHero; // Articles show date unless in hero
};
```

### Mobile Breakpoints
- Use existing CSS custom properties for consistency
- Implement grid layout changes at appropriate breakpoints
- Ensure touch-friendly interaction areas

## Success Metrics

### Visual Consistency
- All sections follow same design language
- Proper metadata display without empty fields
- Consistent spacing and typography

### Code Organization
- Modular, reusable components
- Clear separation of concerns
- Improved maintainability

### Mobile Experience
- Proper responsive behavior
- Touch-friendly interactions
- Optimized layout for small screens

### User Experience
- Clear content hierarchy
- Intuitive section organization
- Consistent interaction patterns

## Risk Assessment

### Low Risk
- Component extraction and organization
- CSS and styling improvements
- Mobile responsive updates

### Medium Risk
- Changing section titles may affect user expectations
- Layout changes could impact existing user behavior

### Mitigation Strategies
- Maintain existing functionality while improving presentation
- Test responsive design thoroughly
- Keep component interfaces simple and clear

## Dependencies

### Internal
- Existing article and brief hooks
- Current CSS design system
- Layout and styling patterns

### External
- No new external dependencies required
- Uses existing React patterns and TypeScript

---

*This design document outlines the approach for fixing home page issues while maintaining code quality and user experience.*
