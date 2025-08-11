# AIVault Cleanup and Supabase Integration

## Problem Statement

The current AIVault component has too much complexity with mock data that includes unnecessary features like usage tracking, favoriting, tags, and last used dates. We need to simplify the component and connect it to a proper Supabase database with a clean, focused schema.

## Requirements

1. **Simplify the data model** - Remove usage tracking, favoriting, tags, and last used dates
2. **Create a clean database schema** for AI prompts
3. **Connect to Supabase** with proper CRUD operations
4. **Maintain the core functionality** - search, categories, and prompt usage
5. **Keep the UI clean and minimal** as per user preferences

## Design

### Database Schema

```sql
-- AI Prompts table
CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    intended_llm TEXT NOT NULL,
    original_credit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt Fields table (for fill-in-the-blank fields)
CREATE TABLE prompt_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES ai_prompts(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    placeholder TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    field_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'textarea', 'select'
    options TEXT[], -- for select fields
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Simplified Data Model

```typescript
interface PromptField {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  sort_order: number;
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  intendedLLM: string;
  originalCredit: string;
  fields: PromptField[];
  createdAt: string;
  updatedAt: string;
}
```

### Database Service

Create a new `PromptService` in `src/services/database.ts` with:
- `getAll()` - Get all prompts
- `getByCategory(category: string)` - Get prompts by category
- `search(query: string)` - Search prompts by title, description, or content
- `create(prompt: Partial<Prompt>)` - Create new prompt
- `update(id: string, updates: Partial<Prompt>)` - Update prompt
- `delete(id: string)` - Delete prompt

### Component Cleanup

1. **Remove unnecessary state**:
   - Remove `useCount`, `lastUsed`, `isFavorite` from Prompt interface
   - Remove favoriting functionality
   - Remove usage tracking
   - Remove tags

2. **Simplify the UI**:
   - Keep search functionality
   - Keep category filtering
   - Keep the prompt modal for usage
   - Remove favorite buttons and usage stats
   - Remove tag display

3. **Connect to Supabase**:
   - Replace mock data with real database calls
   - Add loading states
   - Add error handling

## Implementation Plan

### Phase 1: Database Setup
1. Create migration for `ai_prompts` and `prompt_fields` tables
2. Add RLS policies for security
3. Create indexes for performance

### Phase 2: Service Layer
1. Add `PromptService` to `database.ts`
2. Add types for prompts and fields
3. Implement CRUD operations

### Phase 3: Component Cleanup
1. Remove unnecessary state and UI elements
2. Connect to real database
3. Add loading and error states
4. Test functionality

### Phase 4: Testing
1. Test database operations
2. Test search and filtering
3. Test prompt modal functionality

## Files to Modify

1. `supabase/migrations/` - Add new migration
2. `src/services/database.ts` - Add PromptService
3. `src/components/AIVault.tsx` - Clean up component
4. `src/hooks/` - Add usePrompts hook if needed

## Success Criteria

- [ ] Clean, simplified database schema
- [ ] Working CRUD operations for prompts
- [ ] Functional search and category filtering
- [ ] Clean UI without unnecessary features
- [ ] Proper error handling and loading states
- [ ] All tests passing 