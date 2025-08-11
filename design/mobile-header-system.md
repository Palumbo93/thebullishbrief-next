# Mobile Header System Design

## Problem Statement

The current mobile header implementation is basic and doesn't provide page-specific functionality. We need a comprehensive mobile header system that adapts to different page contexts with appropriate branding, navigation, and action buttons like a mobile app.

## Requirements

### Page-Specific Header Layouts

1. **Home Page & Search Page**
   - Layout: `(Menu, Main Logo) | Spacer | Search Icon`
   - Search icon opens search page

2. **Article Page**
   - Layout: `(Menu, Main Logo) | Spacer | Bookmark Button, Share Button`
   - Bookmark functionality with authentication checks
   - Share sheet integration

3. **Brief Page**
   - Layout: `(Menu, Company Logo/Ticker) | Spacer | Share Button`
   - Company branding with logo and ticker display
   - Share functionality

### Design Principles

- **Reusable Components**: Create modular components for different header elements
- **Consistent Spacing**: Follow design system spacing and typography
- **Mobile-First**: Optimized for touch interactions and mobile UX
- **Brand Consistency**: Maintain visual consistency across all pages
- **Performance**: Lightweight and efficient rendering

## Technical Design

### Component Architecture

```
MobileHeader (Root Container)
├── MobileHeaderSection (Left, Center, Right)
├── MobileHeaderButton (Action buttons)
├── MobileHeaderLogo (Logo display)
└── MobileHeaderBranding (Company info)
```

### Component Specifications

#### MobileHeader
- Fixed positioned container
- Grid layout with 3 sections: left, center (spacer), right
- Consistent height (56px)
- Backdrop blur and background styling
- Z-index management

#### MobileHeaderSection
- Flexible container for grouping elements
- Alignment options (left, center, right)
- Gap management between child elements

#### MobileHeaderButton
- Standardized button component
- Icon and text support
- Hover/active states
- Accessibility attributes
- Loading states

#### MobileHeaderLogo
- Logo display with fallback
- Size variants (main logo vs company logo)
- Responsive image handling

#### MobileHeaderBranding
- Company name and ticker display
- Logo + text combination
- Compact ticker badge styling

### Page Integration

Each page will configure its header through props:

```typescript
interface MobileHeaderConfig {
  leftSection: {
    showMenu: boolean;
    logo?: {
      type: 'main' | 'company';
      src?: string;
      alt?: string;
      fallback?: string;
    };
    branding?: {
      name: string;
      tickers?: string[];
      logoUrl?: string;
    };
  };
  rightSection: {
    buttons: Array<{
      type: 'search' | 'bookmark' | 'share';
      icon: React.ComponentType;
      onClick: () => void;
      active?: boolean;
      loading?: boolean;
    }>;
  };
}
```

### Styling System

- Use CSS custom properties for consistent theming
- Responsive breakpoints at 768px
- Smooth transitions for interactions
- Focus management for accessibility
- Dark mode compatibility

### State Management

- Header configuration passed down from page components
- Action handlers (bookmark, share, search) managed at page level
- Loading states for async actions
- Error handling for failed actions

## Implementation Plan

1. **Core Components**: Build reusable header components
2. **Page Configurations**: Define header configs for each page type
3. **Layout Integration**: Update Layout component to use new system
4. **Mobile Styles**: Implement responsive behavior
5. **Testing**: Validate across different screen sizes and page types

## Success Criteria

- Headers display correctly on all specified page types
- Action buttons work as expected (search, bookmark, share)
- Responsive behavior works across mobile breakpoints
- Performance impact is minimal
- Code is maintainable and extensible
- Accessibility standards are met
