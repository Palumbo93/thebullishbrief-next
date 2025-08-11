# Legal Pages – Design Document

## Problem Statement
We need to add all required legal pages (Terms, Privacy, Cookies, Disclaimer) that render within the existing layout, keep a consistent look and feel, and are easy to maintain via data files. The `LegalFooter` should link to these routes.

## Goals
- Reusable `LegalPage` template that renders any legal document from a data file
- Routes for: `/terms`, `/privacy`, `/cookies`, `/disclaimer`
- Update `LegalFooter` to navigate to these routes (no more inert buttons)
- Keep styling consistent with `design-system.css` and render inside `Layout`

## Non-Goals
- CMS integration (out of scope now)
- Markdown parsing pipeline (we’ll use typed TS data for now)

## Architecture

### Data shape
```ts
// src/data/legal/types.ts
export interface LegalSection {
  id: string;            // for anchors and TOC
  title: string;
  body: string;          // plain text or basic HTML string
}

export interface LegalDocument {
  slug: 'terms' | 'privacy' | 'cookies' | 'disclaimer';
  title: string;
  effectiveDate?: string; // ISO date string
  updatedDate?: string;   // optional
  sections: LegalSection[];
}
```

### Data files
- `src/data/legal/terms.ts` exports `termsDocument: LegalDocument`
- `src/data/legal/privacy.ts` exports `privacyDocument: LegalDocument`
- `src/data/legal/cookies.ts` exports `cookiesDocument: LegalDocument`
- `src/data/legal/disclaimer.ts` exports `disclaimerDocument: LegalDocument`
- `src/data/legal/index.ts` exports a map `{ [slug]: LegalDocument }`

### Template component
- `src/components/legal/LegalPageTemplate.tsx`
- Props: `{ doc: LegalDocument }`
- Renders:
  - Page header: title, effective date
  - Optional table of contents (anchors to sections)
  - Sections with ids for deep-linking
  - Uses existing spacing, typography, borders from `design-system.css`

### Page wrapper
- `src/pages/LegalPage.tsx`
- Reads the current slug from route (mapping static routes to a slug param or via route prop)
- Imports the document from `src/data/legal`
- Renders `LegalPageTemplate`

### Routes
Add to `src/components/Routes.tsx`:
- `/terms` → `LegalPage` with slug `terms`
- `/privacy` → `LegalPage` with slug `privacy`
- `/cookies` → `LegalPage` with slug `cookies`
- `/disclaimer` → `LegalPage` with slug `disclaimer`

### Footer
- Update `src/components/LegalFooter.tsx` to use `<Link to="/terms">` etc.

### Visibility and Layout
- Pages render inside existing `Layout` (no special casing needed)
- Explore sidebar can remain visible on these routes, or we can hide it if desired (default: visible). Optional follow-up: hide Explore on legal pages by adding a path check in `getCurrentLocation` and the sidebar condition.

## Implementation Plan

### Phase 1 – Scaffolding
1. Add types `src/data/legal/types.ts`
2. Add documents `terms.ts`, `privacy.ts`, `cookies.ts`, `disclaimer.ts`, and `index.ts`
3. Create `LegalPageTemplate.tsx`
4. Create `pages/LegalPage.tsx`

### Phase 2 – Routing + Footer
1. Add routes in `src/components/Routes.tsx`
2. Update `src/components/LegalFooter.tsx` buttons to links

### Phase 3 – Polish
1. Add anchors and basic TOC
2. Ensure focus/keyboard navigation
3. Ensure responsive spacing matches design system

## Open Questions
- Should Explore sidebar be hidden on legal pages?
- Do we want markdown support later? If yes, we can migrate `body` to markdown and add a lightweight parser.

## Testing
- Navigate to each route and verify content loads
- Check deep linking `#section-id`
- Verify mobile/desktop spacing and readability

## Rollout
- Implement on a feature branch: `feat/legal-pages`
- Open PR for review and merge
