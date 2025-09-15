# Feature Purging - Design Document

## Problem Statement

We need to remove four key features that are no longer aligned with the simplified news publication design philosophy. These features add complexity without contributing to the core news publication experience and should be completely eliminated from the codebase.

**Core Value:** Simplify the codebase by removing features that add complexity without contributing to the core news publication experience, reducing maintenance burden and improving system performance.

**Key Requirements:**
1. Remove featured color styling system completely from articles, admin, and database
2. Eliminate article comments system entirely including database tables and all UI components
3. Remove Bull Room feature completely including admin interface, UI components, and all database tables
4. Remove AI Vault feature completely including admin interface, UI components, and all database tables

## Feature Analysis

### 1. Featured Color Styling System

**Current Implementation:**
- Database field: `articles.featured_color` (text, hex color values)
- Admin interfaces: Color picker in `ArticleEditModal`, `ArticleCreateModal`, `BriefEditModal`
- Migration: `20250131184500_add_featured_color_to_articles.sql`
- Briefs migration: `20250104000001_add_featured_color_to_briefs.sql`
- Type definitions in `hooks/useArticles.ts` and `database.types.ts`

**Files to Modify:**
- `src/components/admin/ArticleEditModal.tsx` (lines 832-872)
- `src/components/admin/ArticleCreateModal.tsx` (lines 742-780)
- `src/components/admin/BriefEditModal.tsx` (lines 1324-1360)
- `src/hooks/useArticles.ts` (line 33: featured_color field)
- `src/lib/database.types.ts` (featured_color references)
- Database migrations needed to drop column

### 2. Article Comments System

**Current Implementation:**
- Database tables: `article_comments`, `comment_reactions`
- Core component: `src/components/articles/ArticleComments.tsx` (747 lines)
- Hooks: `src/hooks/useArticleComments.ts`, `src/hooks/useArticleCommentsState.ts`
- Types: `src/types/comment.types.ts`
- Multiple database migrations for comments system
- Integration in article pages

**Database Tables:**
- `article_comments` - Main comments table with nested replies
- `comment_reactions` - Like/reaction system for comments
- Related triggers and indexes

**Files to Remove:**
- `src/components/articles/ArticleComments.tsx`
- `src/hooks/useArticleComments.ts`
- `src/hooks/useArticleCommentsState.ts`
- `src/types/comment.types.ts`

**Files to Modify:**
- Any components importing/using ArticleComments
- Database migrations to drop tables

### 3. Bull Room Feature

**Current Implementation:**
- Database tables: `bull_rooms`, `bull_room_messages`, `bull_room_reactions`, etc.
- Admin management: `src/components/admin/BullRoomManager.tsx`
- Complete feature folder: `src/components/BullRoom/` (39 files)
- Page components: `src/page-components/BullRoomPage.tsx`
- App routes: `src/app/bull-room/`
- Hooks: Multiple bull room related hooks
- Real-time messaging system
- Navigation integration

**Database Tables:**
- `bull_rooms` - Room definitions
- `bull_room_messages` - Chat messages
- `bull_room_reactions` - Message reactions
- Related triggers, indexes, and RLS policies

**Directories to Remove:**
- `src/components/BullRoom/` (entire directory)
- `src/app/bull-room/` (entire directory)

**Files to Remove:**
- `src/page-components/BullRoomPage.tsx`
- `src/hooks/useBullRooms.ts`
- `src/hooks/useBullRoomMessages.ts`
- `src/hooks/useBullRoomRealtime.ts`
- `src/hooks/useBullRoomActions.ts`
- `src/hooks/useBullRoomState.ts`
- `src/hooks/useBullRoomUI.ts`
- `src/hooks/useMessageEdit.ts`
- `src/hooks/useAdminBullRooms.ts`
- `src/hooks/useAdminBullRoomActions.ts`
- `src/components/admin/BullRoomManager.tsx`
- `src/components/admin/BullRoomCreateModal.tsx`
- `src/components/admin/BullRoomEditModal.tsx`
- `src/components/admin/BullRoomDeleteModal.tsx`
- `src/services/bullRoomMessages.ts`
- `src/services/bullRoomFileUpload.ts`
- `src/types/bullRoom.types.ts`

### 4. AI Vault Feature

**Current Implementation:**
- Database tables: `ai_prompts`, `ai_prompt_categories`, `prompt_fields`
- Page component: `src/page-components/AIVault.tsx`
- Component: `src/components/aivault/PromptModal.tsx`
- App route: `src/app/aivault/page.tsx`
- Migration: `20250121000005_create_ai_prompts.sql`

**Database Tables:**
- `ai_prompts` - AI prompt definitions
- `ai_prompt_categories` - Prompt categorization
- `prompt_fields` - Dynamic form fields for prompts

**Files to Remove:**
- `src/page-components/AIVault.tsx`
- `src/components/aivault/` (entire directory)
- `src/app/aivault/page.tsx`

## Implementation Plan

### Phase 1: Featured Color Removal
1. **Database Migration**
   - Create migration to drop `featured_color` column from `articles` table
   - Create migration to drop `featured_color` column from `briefs` table

2. **Admin Interface Cleanup**
   - Remove featured color picker from ArticleEditModal
   - Remove featured color picker from ArticleCreateModal  
   - Remove featured color picker from BriefEditModal

3. **Type Definition Updates**
   - Remove featured_color from Article interface
   - Update database types

### Phase 2: Comments System Removal
1. **Component Removal**
   - Delete ArticleComments component
   - Remove all comment-related hooks
   - Remove comment types

2. **Integration Cleanup**
   - Remove ArticleComments from article pages
   - Remove comment-related imports and state

3. **Database Migration**
   - Create migration to drop comment tables
   - Drop `article_comments` table
   - Drop `comment_reactions` table
   - Clean up related triggers and indexes

### Phase 3: Bull Room Feature Removal
1. **Component and Directory Removal**
   - Delete entire `src/components/BullRoom/` directory
   - Delete entire `src/app/bull-room/` directory
   - Remove BullRoomPage component
   - Remove all bull room related hooks
   - Remove admin bull room components

2. **Navigation Cleanup**
   - Remove Bull Room from navigation menus
   - Remove bull room routes
   - Clean up sidebar references

3. **Database Migration**
   - Create migration to drop all bull room tables
   - Drop `bull_rooms`, `bull_room_messages`, `bull_room_reactions`
   - Clean up all related triggers, indexes, and RLS policies

### Phase 4: AI Vault Feature Removal
1. **Component Removal**
   - Delete AIVault page component
   - Delete aivault component directory
   - Remove aivault app route

2. **Navigation Cleanup**
   - Remove AI Vault from navigation menus
   - Clean up sidebar references

3. **Database Migration**
   - Create migration to drop AI prompt tables
   - Drop `ai_prompts`, `ai_prompt_categories`, `prompt_fields`
   - Clean up related indexes and constraints

### Phase 5: Final Cleanup
1. **Import and Reference Cleanup**
   - Search for any remaining references to removed features
   - Clean up unused imports
   - Remove dead code

2. **Navigation and Layout Updates**
   - Update Layout.tsx and Sidebar.tsx
   - Remove navigation items for removed features
   - Update mobile navigation

3. **Database Types Regeneration**
   - Run database type regeneration script
   - Update database.types.ts
   - Update database.aliases.ts

## Database Migrations Required

### 1. Drop Featured Color Columns
```sql
-- Drop featured_color from articles
ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "featured_color";

-- Drop featured_color from briefs  
ALTER TABLE "public"."briefs" DROP COLUMN IF EXISTS "featured_color";
```

### 2. Drop Comments System
```sql
-- Drop comment tables and dependencies
DROP TABLE IF EXISTS "public"."comment_reactions" CASCADE;
DROP TABLE IF EXISTS "public"."article_comments" CASCADE;

-- Drop related indexes and triggers
-- (Clean up will be automatic with CASCADE)
```

### 3. Drop Bull Room System
```sql
-- Drop all bull room related tables
DROP TABLE IF EXISTS "public"."bull_room_reactions" CASCADE;
DROP TABLE IF EXISTS "public"."bull_room_messages" CASCADE; 
DROP TABLE IF EXISTS "public"."bull_rooms" CASCADE;

-- Drop any related functions, triggers, or views
-- (Clean up will be automatic with CASCADE)
```

### 4. Drop AI Vault System
```sql
-- Drop AI prompt system tables
DROP TABLE IF EXISTS "public"."prompt_fields" CASCADE;
DROP TABLE IF EXISTS "public"."ai_prompts" CASCADE;
DROP TABLE IF EXISTS "public"."ai_prompt_categories" CASCADE;

-- Drop related indexes and constraints
-- (Clean up will be automatic with CASCADE)
```

## Risk Assessment

### High Risk
- **Database Operations**: Dropping tables with potential foreign key dependencies
- **Navigation Impact**: Removing core navigation items may affect user experience
- **Dead Code**: May leave orphaned imports or references

### Medium Risk  
- **Type Safety**: Database type regeneration may cause temporary TypeScript errors
- **Feature Dependencies**: Other components may have unexpected dependencies on removed features

### Low Risk
- **Featured Color**: Simple column removal with minimal dependencies
- **Admin Interface**: Self-contained admin components

## Testing Strategy

### 1. Pre-Removal Verification
- Identify all current usages of features to be removed
- Document any unexpected dependencies
- Verify database relationships

### 2. Post-Removal Testing
- Ensure application builds without TypeScript errors
- Verify all navigation works correctly
- Test admin interface functionality
- Confirm database migrations run successfully

### 3. Regression Testing
- Test article creation/editing workflows
- Verify brief creation/editing workflows  
- Test all remaining admin functionality
- Ensure mobile navigation works correctly

## Success Metrics

### Technical Benefits
- **Bundle Size Reduction**: Target 15-20% reduction in JavaScript bundle size
- **Database Simplification**: Remove 8+ database tables
- **Code Reduction**: Remove 100+ files and 10,000+ lines of code
- **Type Safety**: Cleaner type definitions without unused interfaces

### Performance Benefits
- **Faster Builds**: Fewer files to compile
- **Reduced Memory Usage**: Less JavaScript to load and parse
- **Simplified Queries**: Fewer database operations
- **Cleaner Codebase**: Easier maintenance and debugging

### User Experience
- **Simplified Navigation**: Cleaner, more focused navigation
- **Faster Load Times**: Reduced bundle size improves performance
- **Reduced Complexity**: Fewer features to maintain and debug

## Timeline Estimate

- **Phase 1 (Featured Color):** 1 day
- **Phase 2 (Comments):** 1-2 days  
- **Phase 3 (Bull Room):** 2-3 days
- **Phase 4 (AI Vault):** 1 day
- **Phase 5 (Cleanup):** 1 day

**Total Estimated Duration:** 6-8 days

## Dependencies

### External
- Database migration execution access
- Ability to regenerate TypeScript types

### Internal  
- Understanding of current feature usage
- Coordination with any ongoing development work
- Testing of admin interface changes

---

*This design document provides a comprehensive plan for removing legacy features and simplifying the codebase to align with the modern news publication architecture.*
