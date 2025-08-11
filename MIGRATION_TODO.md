# Next.js Migration Todo List

## Problem Statement

The current application uses client-side rendering with a Vercel API route that generates meta tags and redirects to the React app. This approach has significant SEO limitations:

1. **Not true SSR**: Search engines see a redirect rather than the actual content
2. **Poor Core Web Vitals**: Client-side rendering causes layout shifts and slower initial load
3. **Limited SEO benefits**: Meta tags are generated but the actual content isn't server-rendered
4. **Redirect overhead**: Extra HTTP request for each page load

## Solution Overview

Migrate from Vite + React Router to **Vite + React Router + SSR**

## Phase 1: Core Infrastructure & Layout

### 1. Context Providers Setup ✅
- [x] **AuthContext** - Convert to work with Next.js
- [x] **MobileHeaderContext** - Adapt for Next.js
- [x] **ToastContext** - Set up in root layout
- [x] **ConfirmContext** - Set up in root layout
- [x] **AdminContext** - Set up in root layout
- [x] **AnalyticsContext** - Set up in root layout

### 2. Layout & Auth Components
- [x] **Layout.tsx** - Convert from React Router to Next.js App Router
  - [x] Replace `useLocation` with Next.js `usePathname`
  - [x] Replace `useNavigate` with Next.js `useRouter`
  - [x] Convert `Link` components to Next.js `Link`
  - [x] Adapt mobile header configuration logic
  - [x] Fix responsive grid layout
  - [x] Handle article comments sidebar logic

- [x] **Sidebar.tsx** - Convert navigation
  - [x] Replace React Router `Link` with Next.js `Link`
  - [x] Convert `useLocation` to `usePathname`
  - [x] Fix active state logic for Next.js routing
  - [x] Adapt user menu and auth buttons

- [x] **MobileHeader.tsx** - Convert mobile navigation
  - [x] Adapt for Next.js routing
  - [x] Fix mobile header configuration system
  - [x] Handle dynamic header states

- [x] **MobileSidebarDrawer.tsx** - Convert mobile sidebar
  - [x] Replace React Router navigation
  - [x] Fix mobile navigation logic

- [x] **AUTH MODAL SYSTEM** - Critical auth integration issues
  - [x] **AuthModalContext** - Created context provider for global auth modal state management
    - [x] Manage `showAuthModal` and `authModalMode` state
    - [x] Handle auto-closing when user authenticates
    - [x] Check and show onboarding for new users
    - [x] Provide auth handlers via context
  - [x] **AppContent component** - Created global modals wrapper
    - [x] Render `AuthModal` globally in app root
    - [x] Render `OnboardingModal` globally in app root
    - [x] Render `ToastContainer` and `ConfirmModal` globally
    - [x] Ensure modals work across all pages
  - [x] **Layout Integration** - Updated Layout to use auth modal context
    - [x] Remove auth props from Layout interface
    - [x] Connect Layout to use global auth handlers from context
    - [x] Update Sidebar and MobileSidebarDrawer to use context handlers
  - [x] **Testing & Verification** - Verify auth system works
    - [x] Test auth buttons trigger modals correctly
    - [x] Verify user menu shows for authenticated users
    - [x] Test mobile auth flows work properly
    - [x] Verify onboarding shows for new users

### 3. Core Components ✅
- [x] **ExploreWidget** - Convert to Next.js
- [x] **ArticleComments** - Convert to Next.js
- [x] **TickerTapeWidget** - Convert to Next.js
- [x] **AuthModal** - Convert to Next.js
- [x] **ToastContainer** - Set up in layout
- [x] **ConfirmModal** - Set up in layout

## Phase 2: All Pages Migration

### 4. Article Pages ✅
- [x] **Article Page** (`/articles/[slug]`)
  - [x] Create `src/app/articles/[slug]/page.tsx`
  - [x] Implement server-side rendering
  - [x] Add proper metadata generation
  - [x] Convert article data fetching to server-side
  - [x] Handle article comments system
  - [x] Implement bookmark functionality
  - [x] Add social sharing
  - [x] Handle mobile header configuration
  - [x] Implement view tracking

### 5. Author Pages ✅
- [x] **Author Page** (`/authors/[slug]`)
  - [x] Create `src/app/authors/[slug]/page.tsx`
  - [x] Implement server-side rendering
  - [x] Add proper metadata generation
  - [x] Convert author data fetching to server-side
  - [x] Handle author articles list
  - [x] Implement author profile display

### 6. Home Page ✅
- [x] **Home Page** (`/`)
  - [x] Convert `src/app/page.tsx` to use real data
  - [x] Implement server-side rendering for featured articles
  - [x] Add proper metadata
  - [x] Handle category filtering
  - [x] Implement ticker tape widget
  - [x] Add explore widget sidebar

### 7. Search & Explore Pages ✅
- [x] **Search Page** (`/search`)
  - [x] Create `src/app/search/page.tsx`
  - [x] Implement search functionality
  - [x] Handle search results display
  - [x] Add search filters

- [x] **Explore Page** (`/explore`)
  - [x] Create `src/app/explore/page.tsx`
  - [x] Implement explore functionality
  - [x] Handle category browsing

- [x] **Brief Page** (`/briefs/[slug]`)
  - [x] Integrated action panel into main Layout (eliminated need for separate BriefsLayout)
  - [x] Create `src/app/briefs/[slug]/page.tsx`
  - [x] Implement server-side rendering
  - [x] Add proper metadata generation
  - [x] Don't let robots crawl this page, dont want on Google or anything.
  - [x] Convert brief data fetching to server-side
  - [x] Handle brief action panel system
  - [x] Add social sharing
  - [x] Handle mobile header configuration
  - [x] Implement view tracking

### 8. User Pages ✅
- [x] **Account Settings** (`/account-settings`)
  - [x] Create `src/app/account-settings/page.tsx`
  - [x] Copy over AccountSettingsPage.tsx to new -next /pages folder
  - [x] Update the file to migrate to Next.JS (useRouter, remove react-router deps)
  - [x] Implement user profile management
  - [x] Handle preferences and settings

- [x] **Bookmarks** (`/bookmarks`)
  - [x] Create `src/app/bookmarks/page.tsx`
  - [x] Copy over BookmarksPage.tsx to new -next /pages folder  
  - [x] Update the file to migrate to Next.JS (useRouter, remove react-router deps)
  - [x] Implement bookmarks list
  - [x] Handle bookmark management

### 9. Feature Pages ✅
- [x] **Bull Room** (`/bull-room`)
  - [x] Create `src/app/bull-room/page.tsx`
  - [x] Create `src/app/bull-room/[roomSlug]/page.tsx`
  - [x] Copy over BullRoomPage.tsx to new -next /pages folder
  - [x] Update the file to migrate to Next.JS (useRouter, remove react-router deps)
  - [x] Convert all Tailwind classes to inline styles with CSS variables
  - [x] Fix chat area layout and message input positioning
  - [x] Implement hover effects using React state instead of CSS group-hover
  - [x] Handle real-time messaging functionality

- [x] **AI Vault** (`/aivault`)
  - [x] Create `src/app/aivault/page.tsx`
  - [x] Copy over AIVault.tsx to new -next /pages folder
  - [x] Update the file to migrate to Next.JS (useRouter, remove react-router deps)
  - [x] Implement AI prompts system
  - [x] Handle prompt management

### 10. Admin Pages ✅
- [x] **Admin Dashboard** (`/admin`)
  - [x] Create `src/app/admin/page.tsx`
  - [x] CP Copy over in terminal the old /src/pages/AdminPage.tsx to our new -next /pages folder
  - [x] Update the file to migrate to Next.JS
  - [x] Implement admin functionality
  - [x] Handle user management
  - [x] Implement content management

### 11. OTHER PAGES ✅
- [x] **Legal Pages** (`/terms`, `/privacy`, `/cookies`, `/disclaimer`)
  - [x] Create `src/app/terms/page.tsx`
  - [x] Create `src/app/privacy/page.tsx`  
  - [x] Create `src/app/cookies/page.tsx`
  - [x] Create `src/app/disclaimer/page.tsx`
  - [x] Copy over LegalPage.tsx to new -next /pages folder
  - [x] Update the file to migrate to Next.JS (useRouter, remove react-router deps)
  - [x] Add mobile adaptation matching AccountSettingsPage design
  - [x] Implement responsive navigation with horizontal scrolling on mobile
  - [x] Handle layout integration with proper styling

- [x] **NotFound Page** (`/not-found`)
  - [x] Create `src/app/not-found.tsx`
  - [x] Copy over NotFoundPage.tsx to new -next /pages folder
  - [x] Update the file to migrate to Next.JS (useRouter, remove react-router deps)
  - [x] Implement 404 page functionality
  - [x] Handle navigation and layout integration

## Phase 4: Utilities & Hooks

### 11. Data Fetching
- [ ] **Database utilities** - Convert to work with Next.js
- [ ] **Supabase client** - Set up for server-side rendering
- [ ] **Query hooks** - Adapt for Next.js
- [ ] **Server-side data fetching** - Implement for SSR pages

### 12. Utilities
- [ ] **Analytics** - Set up for Next.js
- [ ] **SEO utilities** - Implement metadata generation
- [ ] **Mobile header configs** - Adapt for Next.js
- [ ] **Reading time utils** - Convert to work with SSR

## Phase 5: Testing & Optimization

### 13. Testing
- [ ] **Test all pages** - Ensure functionality works
- [ ] **Test mobile responsiveness** - Verify mobile layout
- [ ] **Test SEO** - Verify meta tags and structured data
- [ ] **Test performance** - Check Core Web Vitals

### 14. Optimization
- [ ] **Image optimization** - Use Next.js Image component
- [ ] **Font optimization** - Use Next.js font optimization
- [ ] **Bundle optimization** - Optimize for performance
- [ ] **Caching** - Implement proper caching strategies

## Phase 6: Deployment

### 15. Deployment Preparation ✅
- [x] **Project structure** - Copy essential files from original project
  - [x] Copy `auth-email-templates/` directory
  - [x] Copy `design/` directory  
  - [x] Copy `docs/` directory
  - [x] Copy `supabase/` directory (migrations, config)
  - [x] Copy `todo/` directory
  - [x] Copy `scripts/` directory
  - [x] Copy `CACHING.md`
  - [x] Copy `CLAUDE.md`
  - [x] Copy `vercel.json`

### 16. Deployment Setup
- [ ] **Environment variables** - Set up for production
- [ ] **Vercel configuration** - Configure for deployment
- [ ] **Database migrations** - Ensure all migrations are applied
- [ ] **Domain setup** - Configure custom domain
- [ ] **Move to new repository** - Create standalone Next.js project
- [ ] **GitHub repository** - Push to new repo
- [ ] **Production deployment** - Deploy to Vercel

## Notes

### Key Considerations:
1. **Maintain exact same functionality** - No feature regression
2. **Preserve mobile experience** - Mobile header and navigation must work identically
3. **SEO optimization** - Articles and authors must have proper SSR
4. **Performance** - Should be faster with Next.js optimization
5. **User experience** - No disruption to existing users

### Migration Order:
1. Start with context providers and layout
2. Migrate ALL pages systematically
3. Convert utilities and hooks
4. Finally optimization and testing

### Testing Strategy:
- Test each component/page after migration
- Verify mobile functionality works
- Check SEO meta tags are correct
- Ensure performance is maintained or improved
