# Admin Page TODO List

## 🎯 **Production-Level Admin Interface Development**

### **Phase 1: Core Infrastructure** 
*Status: Complete*

#### **1. Modal System Overhaul**
- [x] **Convert Article Create/Edit modals to full-screen overlays**
  - [x] Replace current small modals with full-screen modal components
  - [x] Add proper backdrop and animation transitions
  - [x] Implement responsive design for mobile/tablet
  - [x] Add keyboard shortcuts (Esc to close, Ctrl+S to save)
  - [x] Add loading states during save operations
  - [x] Add form validation with error messages

#### **2. Search and Filtering System**
- [x] **Add search functionality to ArticleManager**
  - [x] Search by title, subtitle, author, category
  - [x] Real-time search with debouncing
  - [x] Search highlighting in results
  - [x] Clear search functionality
  - [x] Search history/persistence

- [x] **Add advanced filtering**
  - [x] Filter by status (draft, published, archived)
  - [x] Filter by category
  - [x] Filter by author
  - [x] Filter by date range
  - [x] Filter by featured status
  - [x] Filter by tags
  - [x] Save filter preferences

#### **3. Navigation and Tab System**
- [x] **Create admin navigation tabs**
  - [x] Articles tab (current)
  - [x] Categories tab
  - [x] Authors tab
  - [x] Tags tab
  - [x] Analytics tab
  - [x] Users tab

- [x] **Implement tab switching**
  - [x] URL-based routing for tabs
  - [x] Tab state management
  - [x] Tab-specific breadcrumbs
  - [x] Tab persistence across sessions

#### **4. Common Components Refactoring**
- [x] **Create reusable header components**
  - [x] Create `ManagerHeader.tsx` component
  - [x] Extract title, description, and action button logic
  - [x] Make it configurable for different managers
  - [x] Support different action buttons (Create, Import, etc.)

- [x] **Create reusable search components**
  - [x] Create `SearchBar.tsx` component
  - [x] Extract search input, clear button, and filter toggle
  - [x] Make it configurable for different search fields
  - [x] Support advanced filters and sorting options
  - [x] Add debounced search functionality

- [x] **Create reusable table components**
  - [x] Create `DataTable.tsx` component
  - [x] Extract table structure and row click handling
  - [x] Make it configurable for different data types
  - [x] Support custom column renderers
  - [x] Add loading states and empty states
  - [x] Refactor TagManager to use DataTable component
  - [x] Refactor AuthorManager to use DataTable component
  - [x] Refactor CategoryManager to use DataTable component
  - [x] Refactor UserManager to use DataTable component

- [x] **Create reusable modal components (for non-article managers)**
  - [x] Create `EditModal.tsx` component
  - [x] Create `DeleteModal.tsx` component
  - [x] Create `CreateModal.tsx` component
  - [x] Extract common modal structure (overlay, header, content, actions)
  - [x] Make them configurable for different forms/data types
  - [x] Implement keyboard shortcuts (Esc to close, Ctrl+S to save)
  - [x] Add loading states for actions (save, delete, create)
  - [x] Add form validation and error handling
  - [x] Implement textarea fields on their own lines (full width)
- [x] **Refactor existing managers to use new modal components**
  - [x] Update TagManager to use new modal components
  - [x] Update CategoryManager to use new modal components
  - [x] Update AuthorManager to use new modal components
  - [x] Update UserManager to use new modal components

- [x] **Refactor existing managers**
  - [x] Update ArticleManager to use new components
  - [x] Update CategoryManager to use new components
  - [x] Update AuthorManager to use new components
  - [x] Update TagManager to use new components
  - [x] Update UserManager to use new components

### **Phase 2: Content Management Integration**
*Status: In Progress*

#### **4. Database Layer Refactoring** *(High Priority)*
- [x] **Create dedicated database service layer**
  - [x] Create `src/services/database.ts` for all database operations
  - [x] Move all Supabase calls from UI components to service layer
  - [x] Create typed service functions for each entity (categories, authors, tags, articles, users)
  - [x] Implement proper error handling and logging in service layer
  - [x] Add retry logic and connection pooling
  - [x] Create database hooks (useCategories, useAuthors, useTags, useArticles, useUsers)
  - [x] Update all managers to use service layer instead of direct Supabase calls *(5/5 complete)*
  - [ ] Add caching layer for frequently accessed data
  - [ ] Implement optimistic updates for better UX

#### **5. Category Management Integration**
- [x] **Enhance Category Forms** *(Keep current inline modal style)*
  - [x] Category name input with validation
  - [x] Category slug auto-generation
  - [x] Category description editor
  - [x] Featured status toggle
  - [x] Sort order input
  - [x] Delete category with confirmation
  - [x] Add proper form validation and error handling

- [x] **Integrate categories with articles**
  - [x] Replace text input with dropdown/select
  - [x] Show category in article list
  - [x] Link to category management from article forms
  - [x] Category autocomplete in article forms

#### **6. Author Management Integration**
- [x] **Enhance Author Forms** *(Keep current inline modal style)*
  - [x] Author name input with validation
  - [x] Author slug auto-generation
  - [x] Author email input with validation
  - [x] Author bio editor
  - [x] Author avatar upload *(Store in Supabase storage)*
  - [x] Social media links (linkedin_url, twitter_handle, website_url)
  - [x] Author statistics (article_count, total_views)
  - [x] Author featured status
  - [x] Add proper form validation and error handling

- [x] **Integrate authors with articles**
  - [x] Replace text input with dropdown/select
  - [x] Show author in article list
  - [x] Link to author management from article forms
  - [x] Author autocomplete in article forms

#### **7. Tag Management Integration**
- [x] **Enhance Tag Forms** *(Keep current inline modal style)*
  - [x] Tag name input with validation
  - [x] Tag slug auto-generation
  - [x] Tag description editor
  - [x] Tag featured status toggle
  - [x] Tag usage statistics
  - [x] Delete tag with confirmation
  - [x] Add proper form validation and error handling

- [x] **Integrate tags with articles**
  - [x] Multi-select tag input
  - [x] Tag chips display
  - [x] Tag autocomplete
  - [x] Link to tag management from article forms
  - [x] Tag suggestions based on content

### **Phase 3: Enhanced Article Management**
*Status: Not Started*

#### **6. Database Service Integration** *(Cross-cutting concern)*
  - [x] **Update all existing managers to use service layer**
    - [x] Refactor CategoryManager to use `useCategories` hook
    - [x] Refactor AuthorManager to use `useAuthors` hook
    - [x] Refactor TagManager to use `useTags` hook
    - [x] Refactor UserManager to use `useUsers` hook
    - [x] Refactor ArticleManager to use `useArticles` hook *(Adapter pattern implemented)*
  - [ ] Ensure all CRUD operations go through service layer
  - [ ] Add proper loading states and error handling
  - [ ] Implement optimistic updates for better UX

#### **7. Enhanced Article Management**
- [ ] **Improve article list**
  - [ ] Add pagination for large lists

- [ ] **Enhanced article forms**
  - [ ] Rich text editor for content
  - [ ] Image upload for featured images *(Store in Supabase storage)*
  - [ ] Featured image alt text
  - [ ] Slug generation
  - [ ] Excerpt field

#### **8. Database Schema Updates**
- [ ] **Update article interface to match database**
  - [ ] Update Article interface to match database schema
  - [ ] Add proper relationships (author_id, category_id)
  - [ ] Add tags relationship via `article_tags` table
  - [ ] Add missing fields (slug, excerpt, featured_image_url, featured_image_alt, etc.)
  - [ ] Update TypeScript interfaces
  - [x] **Supabase Storage Setup**
  - [x] Configure Supabase storage buckets for images
  - [x] Set up storage policies for article images
  - [x] Set up storage policies for author avatars
  - [x] Create image upload utilities
  - [x] Handle image resizing and optimization

- [ ] **Update API calls**
  - [ ] Update article creation to use proper relationships
  - [ ] Update article editing to handle relationships
  - [ ] Add proper error handling for foreign key constraints
  - [ ] Add optimistic updates
  - [ ] Add proper loading states

### **Phase 4: Analytics and User Management**
*Status: Not Started*


#### **10. User Management**
- [ ] **Create UserManager component**
  - [ ] List all users with search
  - [ ] User role management
  - [ ] User activity tracking
  - [ ] User permissions
  - [ ] User statistics
  - [ ] User Exporting with Onboarding Preference Data

### **Phase 5: UI/UX Improvements**
*Status: Not Started*

#### **11. UI/UX Improvements**
- [ ] **Add loading states**
  - [ ] Skeleton loaders for lists
  - [ ] Loading spinners for actions
  - [ ] Progress indicators for bulk operations
  - [ ] Shimmer effects

- [ ] **Add error handling**
  - [ ] Error boundaries
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms
  - [ ] Offline support

- [ ] **Add success feedback**
  - [ ] Toast notifications
  - [ ] Success animations
  - [ ] Confirmation dialogs
  - [ ] Undo functionality

#### **12. Performance Optimizations**
- [ ] **Implement pagination**
  - [ ] Server-side pagination for large datasets
  - [ ] Virtual scrolling for long lists
  - [ ] Lazy loading for images
  - [ ] Infinite scroll

- [ ] **Add caching**
  - [ ] Cache frequently accessed data
  - [ ] Optimistic updates
  - [ ] Background data refresh
  - [ ] Service worker for offline support

### **Phase 6: Security and Mobile**
*Status: Not Started*

#### **13. Security and Permissions**
- [ ] **Role-based access control**
  - [ ] Admin-only features
  - [ ] Editor permissions
  - [ ] Author permissions
  - [ ] Permission checks throughout UI
  - [ ] Audit logging

#### **14. Mobile Responsiveness**
- [ ] **Optimize for mobile**
  - [ ] Force Desktop: Say this screen is too small go on laptop

---

## **Progress Tracking**

### **Completed Items**
- ✅ Modal System Overhaul - Full-screen modals with keyboard shortcuts and improved UX
- ✅ Search and Filtering System - Comprehensive search and filtering with real-time results
- ✅ Navigation and Tab System - URL-based tab navigation with state management

### **In Progress**
*None yet*

### **Next Up**
1. **Test Article Creation and Image Uploads** *(Phase 3 Priority)*
   - Verify that article creation works with proper status field
   - Test image uploads with proper session management
   - Test cleanup functionality when modals are cancelled
   - Test that storage buckets are working correctly
   - Test featured image upload functionality
2. **Author Avatar Integration** *(Phase 2 Priority)*
   - Add avatar upload to author forms
   - Display avatars in author list
   - Avatar preview and management

### **Recently Completed**
- ✅ **Fixed TipTap Duplicate Extension Warning** - Disabled `link` extension in StarterKit to avoid conflict
- ✅ **Fixed React JSX Attribute Warning** - Removed `<style jsx>` tag and replaced with CSS class
- ✅ **Fixed Storage Bucket Creation Errors** - Removed client-side bucket creation since buckets are created via Supabase migration
- ✅ **Fixed Article Creation Errors** - Added proper slug generation and field mapping in ArticleCreateModal and ArticleEditModal
- ✅ **Fixed Featured Image Upload** - Updated to use proper UUID-based temporary uploads with session tracking and cleanup
- ✅ **Updated Image Upload Modal** - Removed image URL field and replaced with drag-and-drop upload area matching featured image design
- ✅ **Fixed Article Edit Modal** - Added proper data loading for featured images, tags, and improved form state management
- ✅ **Enhanced Featured Image in Edit Modal** - Replaced URL/alt text fields with drag-and-drop upload area matching create modal design
- ✅ **Fixed RichTextEditor Content Loading** - Added useEffect to properly update editor content when content prop changes
- ✅ **Fixed Featured Image Display in Edit Modal** - Added missing featured_image_url and featured_image_alt to convertToModalArticle function
- ✅ **Fixed Unsaved Changes Detection** - Improved featured image change detection logic to properly compare original vs current image state
- ✅ **Synchronized Create and Edit Modals** - Fixed discrepancies between ArticleCreateModal and ArticleEditModal:
  - Added missing `featured_image_url` and `featured_image_alt` to Article interface and formData
  - Updated unsaved changes logic to match Edit modal approach
  - Changed Status from dropdown to button toggles to match Edit modal
  - Moved Status section to top of form to match Edit modal order
  - Added missing imports (Globe, Archive) and getStatusColor function
  - **Fixed Form Section Order** - Reordered sections to match Edit modal exactly: Status → Title → Subtitle → Slug → Featured Image → Metadata Row → Tags → Content Editor
- ✅ **Fixed Modal Full-Screen Display** - Updated both ArticleCreateModal and ArticleEditModal to use React Portals (createPortal) to render modals at document.body level, ensuring they appear above all other content including sidebar
- ✅ **Enhanced Modal Scrollbar Styling** - Added custom sleek scrollbar styling to both modals with thin width, subtle colors, and hover effects for a more polished appearance
- ✅ **Streamlined Modal UI** - Removed keyboard shortcuts section and added Cancel/Save buttons to top banner in both Create and Edit modals for better UX
- ✅ **Cleaned Up Modal Headers** - Removed tacky icons and back buttons, simplified header design to just show title and description with Cancel/Save buttons on the right
- ✅ **Fixed Article ID Display** - Updated ModalArticle interface to use string IDs instead of numbers to properly handle UUIDs from database, fixing NaN display issue
- ✅ **Added Published Date Field** - Added published_at field to article forms with datetime-local input, updated service layer and UI components to support editable published dates
- ✅ **Created Database Migration** - Created migration file for published_at field enhancements (indexes, triggers, constraints) - ready to apply when Supabase CLI auth is resolved
- ✅ **Added Delete/Duplicate Buttons to Edit Modal** - Added delete and duplicate buttons to ArticleEditModal header with proper styling and functionality
- ✅ **Removed Description Field from Tags** - Successfully applied migration to remove description column from tags table, updated service layer and UI components to remove all references to tag descriptions
- ✅ **Added Delete Confirmation Modal** - Integrated ArticleDeleteModal with ArticleEditModal to show confirmation dialog before deleting articles
- ✅ **Enhanced Tag Selector** - Replaced TagSelector with TagSelectorButton and TagSelectorModal for better UX with popup modal, Clear All/Apply buttons, and Add tag functionality
- ✅ **Fixed Published Date Handling** - Set default to today in ArticleCreateModal and properly load/compare published_at values in ArticleEditModal
- ✅ **Fixed CreateModal Form Persistence** - Prevented form data from disappearing when modal loses focus by only initializing once and clearing on close
- ✅ **Fixed ArticleDeleteModal Visibility** - Moved delete modal inside Edit Article portal with proper z-index stacking to ensure visibility
- ✅ **Fixed Delete Button Functionality** - Moved delete modal inside main portal and added debug logging to ensure proper rendering
- ✅ **Fixed ArticleEditModal Syntax Error** - Corrected JSX structure by rendering delete modal as separate portal at same level as main modal
- ✅ **Fixed Adjacent JSX Elements Error** - Wrapped both portals in React fragment to resolve "Adjacent JSX elements must be wrapped" error
- ✅ **Completely Rewrote ArticleEditModal** - Fixed all syntax errors by completely rewriting the component with proper structure and both portals wrapped in React fragment
- ✅ **Fixed Featured Field String-to-Boolean Conversion** - Updated all database services (Category, Author, Tag, Article) to properly convert string 'true'/'false' values to boolean for featured/premium fields
- ✅ **Fixed Edit Modal Boolean-to-String Conversion** - Updated EditModal and CreateModal to convert boolean values to strings for select fields when initializing form data
- ✅ **Fixed Create Modal Default Values** - Added proper defaultValue: 'false' for featured fields in CategoryManager and AuthorManager createFields
- ✅ **Fixed Rich Text Editor Paste Color Handling** - Added CSS rules to override any pasted color styles while preserving all formatting (bold, italic, lists, etc.)
- ✅ **Fixed Tag Selector Modal Z-Index** - Added portal rendering for CreateModal in TagSelectorModal to ensure "Add Tag" button is visible and properly layered
- ✅ **Removed Featured Field from Tags** - Created migration to remove featured field from tags table and updated all code references (including TagSelectorModal createFields)
- ✅ **Fixed Tag Creation in TagSelectorModal** - Added create function to useAllTags hook and removed featured field from handleDuplicateTag
- ✅ **Removed Excerpt Field from Articles** - Created migration to remove excerpt field from articles table and updated all code references
- ✅ **Fixed TagSelectorModal Selected Tags Visibility** - Fixed color contrast issue by updating --color-text-inverse to white and ensuring selected tags are visible
- ✅ **Fixed Tag Selection and Article-Tag Relationships** - Added tag creation to handleCreateArticle and improved tag selection logic in TagSelectorModal
- ✅ **Fixed Article-Tag Database Errors** - Removed non-existent fields from getTagsForArticle query and added missing RLS policies for article_tags table
- ✅ **Fixed Color Contrast Issues** - Fixed white-on-white text in buttons, datetime-local calendar icon, and updated all buttons to use capsule shape (radius-full)
- ✅ **Created Reusable StatusSelector Component** - Replaced ugly status selectors with clean, minimal component without colors or icons
- ✅ **Fixed Tag Creation Index Issues** - Fixed tag selection state management when creating new tags, added validation for selected tag IDs, and fixed color contrast in TagSelectorModal

### **Recently Completed**
- ✅ **Fixed Article Edit Modal** - Restored full-screen `ArticleEditModal` component for proper editing experience
- ✅ **Removed inline modal** - Replaced with proper full-screen modal matching create experience
- ✅ **Maintained row-click functionality** - Articles table rows still clickable to open edit modal
- ✅ **Created ManagerHeader component** - Extracted common header structure across all managers
- ✅ **Refactored all managers** - Updated ArticleManager, CategoryManager, AuthorManager, TagManager, and UserManager to use ManagerHeader
- ✅ **Created SearchBar component** - Extracted search functionality with optional filter support
- ✅ **Updated ArticleManager** - Now uses SearchBar with full filter functionality
- ✅ **Updated other managers** - CategoryManager, AuthorManager, TagManager, and UserManager now use SearchBar without filters
- ✅ **Created reusable modal components** - Built `EditModal`, `DeleteModal`, and `CreateModal` for non-article managers
- ✅ **Implemented TagManager with new modals** - Successfully refactored TagManager to use reusable modal components
- ✅ **Enhanced modal UX** - Added keyboard shortcuts, loading states, and improved textarea layout (full width)
- ✅ **Fixed UserManager error** - Resolved null role handling in `getRoleColor` function
- ✅ **Completed modal refactoring** - Successfully refactored CategoryManager, AuthorManager, and UserManager to use reusable modal components
- ✅ **Phase 1 Complete** - All core infrastructure components are now refactored and ready for Phase 2
- ✅ **Universal slug utilities** - Created `generateSlug`, `isSlugUnique`, and `generateUniqueSlug` functions in `src/lib/utils.ts`
- ✅ **Category Management Integration** - Enhanced forms with slug auto-generation, validation, and improved table display
- ✅ **Database schema alignment** - Updated CategoryManager to match actual database schema (removed non-existent SEO fields)
- ✅ **Author Management Integration** - Enhanced forms with slug auto-generation, social media fields, and improved table display
- ✅ **Database service layer** - Created production-level database service layer with typed services and React hooks
- ✅ **CategoryManager refactoring** - Updated CategoryManager to use new service layer instead of direct Supabase calls
- ✅ **Real-time slug generation** - Added auto-slug generation in CreateModal and EditModal when name/title fields change
- ✅ **AuthorManager refactoring** - Updated AuthorManager to use useAuthors hook and service layer
- ✅ **TagManager refactoring** - Updated TagManager to use useTags hook and service layer
- ✅ **UserManager refactoring** - Updated UserManager to use useUsers hook and service layer
- ✅ **Service layer integration** - Successfully refactored CategoryManager, AuthorManager, TagManager, and UserManager to use dedicated service layer
- ✅ **ArticleManager service layer integration** - Implemented adapter pattern to bridge modal interfaces with service layer
- ✅ **Category and Author Integration** - Replaced text inputs with dropdown/select components in article forms
- ✅ **Tag Integration with Articles** - Implemented multi-select tag input, TagSelector component, and article-tag service layer
- ✅ **Supabase Storage Setup** - Created comprehensive storage utilities, image upload hooks, and reusable ImageUpload component
- ✅ **Rich Text Editor Integration** - Implemented modern TipTap editor with full formatting capabilities, tables, images, and beautiful UI
- ✅ **Native URL & Image Modals** - Created beautiful native popups for link and image insertion with preview and validation
- ✅ **Enhanced List Styling** - Fixed bullet and number colors to appear in foreground color
- ✅ **Fixed Form Submission Issues** - Resolved modal opening causing main form submission using React portals and proper event handling
- ✅ **Updated ArticlePage for HTML Content** - Replaced ReactMarkdown with HTML rendering and added proper CSS styling
- ✅ **Connected Image Uploads to Supabase** - Updated ImageUploadModal to support file uploads to Supabase storage
- ✅ **Fixed Form Submission Issues** - Resolved image modal form submission conflicts
- ✅ **Fixed TipTap Extensions** - Removed duplicate extensions to eliminate warnings
- ✅ **Implemented Upload Session Management** - Created proper UUID-based upload sessions with cleanup
- ✅ **Fixed Storage Bucket Issues** - Added automatic bucket creation and proper session management
- ✅ **Created Supabase Storage Buckets** - Set up article-images, author-avatars, and featured-images buckets with proper RLS policies
- ✅ **Fixed Article Creation Issues** - Added missing status field and improved error handling
- ✅ **Added Featured Image Upload Field** - Added featured image upload section to article forms
- ✅ **Implemented Featured Image Upload Functionality** - Added drag & drop, file upload, and preview functionality

### **Blocked Items**
*None yet*

---

## **Notes**
- Priority order: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
- Each phase should be completed before moving to the next
- Testing should be done alongside development, not just at the end
- Mobile responsiveness should be considered throughout development, not just at the end 