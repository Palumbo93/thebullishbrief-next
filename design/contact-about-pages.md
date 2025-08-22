# Contact & About Pages – Design Document

## Problem Statement

We need to extend the existing legal navigation system to include two additional pages:
1. **Contact page** (`/contact`) - Display contact email (info@bullishbrief.com) with a 48-hour response time message
2. **About page** (`/about`) - Display placeholder content for company information

These pages should integrate seamlessly with the existing legal page architecture and navigation system.

## Goals

- Add `/contact` and `/about` routes that use the existing legal page layout and navigation
- Extend the `LegalDocument` type system to support the new page types
- Update all navigation components to include the new pages
- Maintain consistency with existing legal page styling and behavior
- Provide meaningful content for both pages

## Non-Goals

- Complex contact forms or interactive elements
- Rich content management for the about page (placeholder content is sufficient)
- Separate layout systems (reuse existing legal page architecture)

## Architecture

### Type System Updates

Extend `src/data/legal/types.ts`:
```ts
export interface LegalDocument {
  slug: 'terms' | 'privacy' | 'disclaimer' | 'contact' | 'about';
  title: string;
  effectiveDate?: string;
  updatedDate?: string;
  sections: LegalSection[];
}
```

### Data Files

Create two new data files:

**`src/data/legal/contact.ts`**:
```ts
export const contactDocument: LegalDocument = {
  slug: 'contact',
  title: 'Contact Us',
  sections: [
    {
      id: 'contact-info',
      title: 'Get in Touch',
      body: `
        <p>We'd love to hear from you! For any questions, feedback, or support requests, please reach out to us at:</p>
        <p><strong>Email:</strong> <a href="mailto:info@bullishbrief.com">info@bullishbrief.com</a></p>
        <p>We typically respond to all inquiries within 48 hours during business days.</p>
      `
    }
  ]
};
```

**`src/data/legal/about.ts`**:
```ts
export const aboutDocument: LegalDocument = {
  slug: 'about',
  title: 'About Bullish Brief',
  sections: [
    {
      id: 'company-overview',
      title: 'Our Mission',
      body: `
        <p>Bullish Brief is your trusted source for market insights and financial analysis.</p>
        <p>This section will be expanded with detailed company information, team details, and our story.</p>
      `
    },
    {
      id: 'placeholder-section',
      title: 'More Information',
      body: `
        <p>Additional content about our services, values, and approach will be added here.</p>
      `
    }
  ]
};
```

### Navigation Updates

Update navigation in multiple components:

1. **`src/page-components/LegalPage.tsx`** - Add new nav items to the sidebar
2. **`src/components/LegalFooter.tsx`** - Add new footer links

### Route Creation

Create new Next.js app router pages:
- `src/app/contact/page.tsx`
- `src/app/about/page.tsx`

Both will follow the same pattern as existing legal pages.

### Data Registry Updates

Update `src/data/legal/index.ts` to include the new documents in the registry.

## Implementation Plan

### Phase 1 – Data & Types
1. Update `types.ts` to include new slugs
2. Create `contact.ts` and `about.ts` data files
3. Update `index.ts` to register new documents

### Phase 2 – Routes
1. Create `src/app/contact/page.tsx`
2. Create `src/app/about/page.tsx`

### Phase 3 – Navigation Updates
1. Update `LegalPage.tsx` navigation array
2. Update `LegalFooter.tsx` to include new links

### Phase 4 – Testing
1. Verify all routes work correctly
2. Test navigation between pages
3. Verify mobile responsiveness
4. Test contact email link functionality

## Content Specifications

### Contact Page Content
- Clear heading "Get in Touch"
- Email address: info@bullishbrief.com (as clickable mailto link)
- Response time expectation: "We typically respond to all inquiries within 48 hours during business days"
- Professional, friendly tone

### About Page Content
- Placeholder content that can be easily replaced
- Multiple sections to demonstrate the layout
- Professional tone consistent with brand

## Testing Checklist

- [ ] `/contact` route loads and displays correctly
- [ ] `/about` route loads and displays correctly
- [ ] Navigation sidebar includes new pages
- [ ] Footer includes new links
- [ ] Email link in contact page opens mail client
- [ ] Mobile navigation works correctly
- [ ] All pages maintain consistent styling
- [ ] Back button functionality works
- [ ] Active state highlighting works in navigation

## Rollout

- Implement on feature branch: `feat/contact-about-pages`
- Test all functionality
- Open PR for review and merge
