# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run dev:network` - Start dev server accessible on local network

### Testing
This project does not currently have a test framework configured. When adding tests, consider the existing stack (React + TypeScript + Vite).

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **State Management**: TanStack Query (React Query) + React Context
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OTP (passwordless)
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AuthModal/      # Complete auth system (signin/signup/OTP)
│   ├── BullRoom/       # Real-time chat components
│   ├── admin/          # Admin panel components
│   └── ui/             # Basic UI primitives
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── pages/              # Page components
├── styles/             # Global styles and design system
└── types/              # TypeScript type definitions
```

### Key Architecture Patterns

#### Routing Architecture
- **Standard Layout**: Uses `Layout` component for main app sections
- **Briefs Layout**: Special standalone layout for `/briefs/*` routes (no loading screen)
- **Protected Routes**: Admin routes require `user.isAdmin` check
- **Route Structure**:
  - `/` - HomePage
  - `/bull-room/:roomId` - Real-time chat rooms
  - `/aivault` - AI content section
  - `/alphaarena` - Trading/competition section
  - `/admin` - Admin panel (protected)
  - `/articles/:slug` - Article detail pages
  - `/briefs/*` - Landing pages with standalone layout

#### Authentication System
- **Passwordless**: OTP-based authentication via Supabase
- **Multi-modal**: Supports both signin and signup flows
- **Admin System**: JWT claims + database `user_profiles.is_admin` with caching
- **Context**: `AuthContext` provides user state and auth methods globally

#### Data Management
- **Primary**: TanStack Query for server state with 5min stale time
- **Cache Strategy**: Multi-layer caching (see CACHING.md)
  - React Query cache (memory)
  - Local Storage cache (persistent)
  - TTL-based expiration
- **Database**: Supabase client with type safety via `database.types.ts`

#### Component Organization
- **Feature-based**: AuthModal/, BullRoom/, admin/ are complete feature modules
- **Atomic Design**: ui/ contains basic components, composed into larger features
- **Mobile-first**: MobileHeader, MobileSidebarDrawer for responsive design

### Environment Configuration
Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

The app gracefully handles missing Supabase credentials for development.

### Database Schema (Key Tables)
- `user_profiles` - Extended user data with admin flags and preferences
- `articles` - Content management with categories, tags, featured status
- `bull_rooms` - Chat room definitions
- `messages` - Real-time chat messages

### Special Features
- **Real-time Chat**: Bull Room system using Supabase real-time subscriptions
- **Article System**: Full CMS with categories, tags, bookmarks, view tracking
- **Admin Panel**: User management, content management, analytics
- **Caching System**: Comprehensive multi-layer caching (detailed in CACHING.md)
- **Mobile Responsive**: Dedicated mobile navigation and sidebar

### Development Notes
- The app uses conditional layouts - briefs routes skip the loading screen and main layout
- Admin functionality is protected both client-side and database-level
- The caching system is production-optimized with development debug tools
- Authentication is completely passwordless using email OTP
- Real-time features use Supabase subscriptions, not WebSockets

### Code Conventions
- TypeScript strict mode enabled
- Functional components with hooks
- Custom hooks for data fetching (`useArticles`, `useAuth`, etc.)
- CSS-in-JS for component styles, Tailwind for utilities
- Import paths use absolute imports from `src/`