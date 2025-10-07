# Sitemap Extension: Authors & Briefs

## Problem Statement

The current sitemap generation function (`src/app/sitemap.ts`) only includes static pages, articles, and publishers. This leaves two major content types undiscoverable by search engines:
- **Author pages** at `/authors/:slug`
- **Brief pages** at `/briefs/:slug`

**Key Issues:**
- Author pages are not indexed by search engines, reducing discoverability of author profiles
- Brief pages (company research content) are missing from the sitemap, limiting SEO potential
- Incomplete sitemap reduces overall site crawlability and search visibility

**Goal:** Extend the sitemap generator to include all authors and published briefs, ensuring comprehensive SEO coverage for all dynamic content.

## Design Solution

### Data Sources

**Authors:**
- Table: `authors`
- Fields: `slug`, `updated_at`, `created_at`
- Filter: None (all authors are active)
- URL pattern: `/authors/:slug`

**Briefs:**
- Table: `briefs`
- Fields: `slug`, `updated_at`, `published_at`, `status`
- Filter: `status = 'published'` (exclude drafts)
- URL pattern: `/briefs/:slug`

### SEO Parameters

**Authors:**
- Priority: `0.7` (same as publishers at root level)
- Change Frequency: `weekly` (authors update content periodically)
- Last Modified: Use `updated_at` or fall back to `created_at`

**Briefs:**
- Priority: `0.8` (same as articles, as briefs are key content)
- Change Frequency: `weekly` (briefs are evergreen company research)
- Last Modified: Use `updated_at` or fall back to `published_at`

### Implementation Approach

1. Add two new Supabase queries to fetch authors and briefs
2. Add error handling for each query (consistent with existing article/publisher pattern)
3. Map the data to sitemap format
4. Add comprehensive logging for debugging
5. Include in final sitemap return array

## Implementation Plan

1. **Phase 1**: Add Supabase queries for authors and briefs with error handling
2. **Phase 2**: Map data to sitemap format with appropriate priorities and frequencies
3. **Phase 3**: Update logging to include new content types
4. **Phase 4**: Test build-time generation and verify sitemap output

## Success Criteria

- All active authors appear in sitemap at `/authors/:slug`
- All published briefs appear in sitemap at `/briefs/:slug`
- Error handling prevents sitemap generation failures
- Logging provides visibility into what's being included
- Sitemap validates against sitemap.xml schema
- Build-time generation remains fast and efficient

