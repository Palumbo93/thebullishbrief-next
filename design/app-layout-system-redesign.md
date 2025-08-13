# App Layout System Redesign

## Problem Statement

The current app layout system has several issues that make it non-enterprise-grade:

1. **Hidden scrollbars** - Using `.hide-scrollbar` class extensively creates poor UX and accessibility issues
2. **Hacky CSS Grid layout** - Dynamic column widths with inline styles make maintenance difficult
3. **Fixed height problems** - `100vh` causes issues on mobile devices with dynamic viewports
4. **Complex overflow management** - Multiple scrollable areas with inconsistent behaviors
5. **Mobile layout complexity** - Overlay systems and complex state management

## Design Goals

1. **Proper scrollbar management** - Show scrollbars where appropriate, style them consistently
2. **Clean layout architecture** - Use CSS Grid/Flexbox properly with semantic structure
3. **Responsive design** - Mobile-first approach with proper breakpoints
4. **Accessibility** - Ensure proper keyboard navigation and screen reader support
5. **Performance** - Optimize for smooth scrolling and transitions
6. **Maintainability** - Clear separation of concerns and reusable components

## Proposed Architecture

### 1. Layout Structure

```
RootLayout (html/body)
├── AppContent (providers)
    ├── Layout (main layout wrapper)
        ├── Sidebar (fixed left navigation)
        ├── MainContent (scrollable main area)
        │   ├── Header (optional, sticky)
        │   ├── Content (page-specific content)
        │   └── Footer (optional)
        └── SidePanels (optional right panels)
            ├── ArticleComments (article pages)
            ├── BriefActionPanel (brief pages)
            └── ExploreWidget (home/explore pages)
```

### 2. CSS Architecture

#### Global Styles
- Remove `.hide-scrollbar` classes
- Implement consistent scrollbar styling
- Use CSS custom properties for layout dimensions
- Implement proper viewport height handling

#### Layout Components
- Use CSS Grid for main layout
- Use Flexbox for component-level layouts
- Implement proper overflow handling
- Use semantic HTML structure

### 3. Responsive Strategy

#### Desktop (1024px+)
- Fixed sidebar (80px width)
- Main content area (flexible)
- Optional right panels (400px each)
- Proper scrollbar visibility

#### Tablet (768px - 1023px)
- Collapsed sidebar (60px width)
- Main content area
- Hidden right panels (moved to mobile overlays)

#### Mobile (0px - 767px)
- Hidden sidebar (moved to drawer)
- Full-width main content
- Overlay panels for sidebars
- Bottom navigation or hamburger menu

### 4. Scrollbar Strategy

#### Global Scrollbar Styling
```css
/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-secondary);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-primary) var(--color-bg-secondary);
}
```

#### Component-Level Scrollbars
- Main content: Always visible
- Sidebars: Always visible
- Modals: Custom styled
- Mobile overlays: Hidden (native mobile scrolling)

### 5. Implementation Plan

#### Phase 1: Foundation
1. Update global CSS with proper scrollbar styling
2. Remove `.hide-scrollbar` classes
3. Implement CSS custom properties for layout dimensions
4. Create base layout components

#### Phase 2: Layout Components
1. Refactor `Layout.tsx` to use proper CSS Grid
2. Create reusable layout components
3. Implement proper responsive breakpoints
4. Fix viewport height issues

#### Phase 3: Sidebar System
1. Refactor `Sidebar.tsx` for better structure
2. Implement proper mobile drawer
3. Create sidebar state management
4. Add smooth transitions

#### Phase 4: Content Areas
1. Refactor main content area
2. Implement proper overflow handling
3. Create side panel components
4. Add proper loading states

#### Phase 5: Mobile Optimization
1. Implement proper mobile navigation
2. Create mobile overlay system
3. Optimize touch interactions
4. Add proper safe area handling

### 6. Technical Specifications

#### CSS Custom Properties
```css
:root {
  /* Layout dimensions */
  --sidebar-width: 80px;
  --sidebar-width-tablet: 60px;
  --sidebar-width-mobile: 0px;
  --side-panel-width: 400px;
  --side-panel-width-brief: 340px;
  --header-height: 56px;
  --mobile-header-height: 56px;
  
  /* Breakpoints */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  
  /* Z-index scale */
  --z-sidebar: 100;
  --z-header: 200;
  --z-overlay: 1000;
  --z-modal: 2000;
}
```

#### Component Structure
```typescript
interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showComments?: boolean;
  showActionPanel?: boolean;
  showExplore?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}
```

#### Responsive Hooks
```typescript
const useLayoutBreakpoint = () => {
  // Returns 'mobile' | 'tablet' | 'desktop'
};

const useSidebarState = () => {
  // Manages sidebar visibility and state
};
```

### 7. Benefits

1. **Better UX**: Proper scrollbars provide visual feedback
2. **Accessibility**: Screen readers can understand layout structure
3. **Maintainability**: Clean, semantic CSS structure
4. **Performance**: Optimized scrolling and transitions
5. **Responsive**: Proper mobile-first design
6. **Developer Experience**: Clear component structure and props

### 8. Migration Strategy

1. **Gradual migration**: Implement new system alongside old
2. **Feature flags**: Use feature flags for progressive rollout
3. **Testing**: Comprehensive testing across devices and browsers
4. **Documentation**: Update component documentation
5. **Training**: Team training on new layout system

## Next Steps

1. Review and approve this design document
2. Create implementation branch
3. Begin Phase 1 implementation
4. Set up testing framework
5. Create component documentation
