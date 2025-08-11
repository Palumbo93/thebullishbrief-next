# SSR Migration Design Document

## Problem Statement

The current application uses client-side rendering with a Vercel API route that generates meta tags and redirects to the React app. This approach has significant SEO limitations:

1. **Not true SSR**: Search engines see a redirect rather than the actual content
2. **Poor Core Web Vitals**: Client-side rendering causes layout shifts and slower initial load
3. **Limited SEO benefits**: Meta tags are generated but the actual content isn't server-rendered
4. **Redirect overhead**: Extra HTTP request for each page load

## Solution Overview

Migrate from Vite + React Router to **Vite + React Router + SSR** using one of the following approaches:

### Option 1: Vite SSR Plugin (Recommended)
- Use `@vitejs/plugin-react` with SSR capabilities
- Implement server-side rendering with hydration
- Maintain existing React Router setup
- Deploy to Vercel with SSR support

### Option 2: Next.js Migration
- Complete migration to Next.js framework
- Built-in SSR/SSG capabilities
- Automatic code splitting and optimization
- More complex migration but better long-term solution

## Recommended Approach: Vite SSR Plugin

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Server        │    │   Database      │
│                 │    │                 │    │                 │
│ React App       │◄──►│ SSR Server      │◄──►│ Supabase        │
│ (Hydrated)      │    │ (Vite SSR)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Implementation Plan

#### Phase 1: Setup SSR Infrastructure
1. Install SSR dependencies
2. Create server entry point
3. Configure Vite for SSR
4. Set up server-side routing

#### Phase 2: Implement SSR for Articles
1. Create SSR-compatible article components
2. Implement server-side data fetching
3. Add meta tag generation
4. Test hydration

#### Phase 3: Extend to Other Pages
1. Home page SSR
2. Author pages SSR
3. Brief pages SSR
4. Search page SSR

#### Phase 4: Optimization
1. Implement caching strategies
2. Add ISR (Incremental Static Regeneration)
3. Optimize bundle sizes
4. Performance monitoring

### Technical Implementation

#### Dependencies to Add
```json
{
  "compression": "^1.7.4",
  "serve-static": "^1.15.0",
  "@types/compression": "^1.7.5",
  "@types/serve-static": "^1.15.5"
}
```

#### File Structure Changes
```
src/
├── client/
│   ├── main.tsx          # Client entry point
│   └── App.tsx           # Client app
├── server/
│   ├── entry-server.tsx  # Server entry point
│   └── render.tsx        # SSR render function
├── shared/
│   ├── App.tsx           # Shared app component
│   └── routes.tsx        # Shared routing logic
└── vite.config.ts        # Updated Vite config
```

#### Server Entry Point
```typescript
// src/server/entry-server.tsx
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { App } from '../shared/App'

export function render(url: string, context: any) {
  const html = renderToString(
    <StaticRouter location={url} context={context}>
      <App />
    </StaticRouter>
  )
  return html
}
```

#### Client Entry Point
```typescript
// src/client/main.tsx
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '../shared/App'

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

### SEO Benefits

1. **True Server-Side Rendering**: Content is rendered on the server
2. **Better Core Web Vitals**: Faster First Contentful Paint (FCP)
3. **Improved SEO**: Search engines see actual content immediately
4. **Social Media Sharing**: Proper Open Graph tags and Twitter Cards
5. **Accessibility**: Better screen reader support

### Performance Considerations

1. **Caching Strategy**: Implement Redis or similar for session caching
2. **Bundle Optimization**: Code splitting for better performance
3. **ISR Implementation**: Static generation with revalidation
4. **CDN Integration**: Leverage Vercel's edge network

### Migration Risks

1. **Complexity**: SSR adds complexity to the build process
2. **Hydration Mismatches**: Server and client must render identically
3. **State Management**: Careful handling of client-side state
4. **Build Time**: Longer build times with SSR

### Success Metrics

1. **SEO Performance**: Improved search rankings
2. **Core Web Vitals**: Better LCP, FID, CLS scores
3. **User Experience**: Faster perceived load times
4. **Social Sharing**: Proper preview cards on social media

## Implementation Timeline

- **Week 1**: Setup SSR infrastructure and basic rendering
- **Week 2**: Implement article page SSR
- **Week 3**: Extend to other critical pages
- **Week 4**: Optimization and testing
- **Week 5**: Deployment and monitoring

## Next Steps

1. Review and approve this design document
2. Create implementation branch
3. Begin Phase 1 implementation
4. Set up testing environment
5. Plan deployment strategy
