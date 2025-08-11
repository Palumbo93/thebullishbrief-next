# Article Comments System Design (Simplified)

## Problem Statement

We need a dedicated comment system for articles that is completely separate from the existing chat widget. The chat widget will remain for general discussions, while article comments will be article-specific and provide a better reading experience.

## Requirements

1. **Separate from Chat Widget** - Completely independent system
2. **Article-Specific** - Comments tied to individual articles
3. **Threaded Comments** - Support for replies and nested discussions
4. **Rich Features** - Editing, deleting, reactions, moderation
5. **Load Once** - Comments load once per page visit (no real-time)
6. **Mobile Optimized** - Works well on all devices

## Database Schema

### Article Comments Table
```sql
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_article_comments_parent_id ON article_comments(parent_id);
CREATE INDEX idx_article_comments_created_at ON article_comments(created_at);
```

### Comment Reactions Table
```sql
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES article_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Indexes
CREATE INDEX idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON comment_reactions(user_id);
```

## Component Architecture

### 1. ArticleComments Component
```typescript
interface ArticleCommentsProps {
  articleId: string;
  articleTitle: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}
```

### 2. CommentItem Component
```typescript
interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReaction: (commentId: string, reactionType: string) => void;
  depth?: number;
}
```

### 3. CommentForm Component
```typescript
interface CommentFormProps {
  articleId: string;
  parentId?: string;
  onSuccess: () => void;
  placeholder?: string;
}
```

## Data Flow (Simplified)

### Hooks Structure
```typescript
// Main hook for fetching comments (load once)
useArticleComments(articleId: string)

// Mutation hooks (trigger refetch on success)
useCreateComment()
useUpdateComment()
useDeleteComment()
useAddReaction()
useRemoveReaction()
```

### State Management (Simplified)
- Comments load once when component mounts
- Refetch comments after successful mutations
- No real-time subscriptions needed
- Simple loading states

## UI/UX Design

### Layout Integration
- Comments appear as a sidebar on article pages (similar to chat widget)
- Collapsible interface with smooth animations
- Sticky header with comment count
- Simple pagination (load more button)

### Comment Features
- **Threading**: Nested replies with visual indentation
- **Editing**: Inline editing with rich text support
- **Reactions**: Emoji reactions (like, love, laugh, etc.)
- **Moderation**: Report inappropriate comments
- **Timestamps**: Relative time display
- **User Avatars**: Consistent with existing design

### Mobile Experience
- Full-width comments on mobile
- Swipe gestures for actions
- Optimized touch targets
- Keyboard-friendly input

## State Management (Simplified)

### Local State
```typescript
interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  hasMore: boolean;
  replyingTo: string | null;
  editingComment: string | null;
  expandedThreads: Set<string>;
}
```

### Persistence
- Comment expansion state in localStorage
- User preferences for comment display
- Draft comments (auto-save)

## Security & Moderation

### Row Level Security (RLS)
```sql
-- Users can only see published comments
CREATE POLICY "Users can view published comments" ON article_comments
  FOR SELECT USING (true);

-- Users can only create/edit their own comments
CREATE POLICY "Users can manage their own comments" ON article_comments
  FOR ALL USING (auth.uid() = user_id);

-- Users can only react to comments once per type
CREATE POLICY "Users can manage their own reactions" ON comment_reactions
  FOR ALL USING (auth.uid() = user_id);
```

### Moderation Features
- Report inappropriate comments
- Admin moderation interface
- Auto-moderation for spam detection
- Comment approval workflow (optional)

## Performance Considerations (Simplified)

### Caching Strategy
- Cache comments by article ID
- Simple pagination (20 comments per page)
- Refetch on mutations (no optimistic updates)
- No background sync needed

### Database Optimization
- Proper indexing on frequently queried columns
- Simple queries (no complex real-time logic)
- Efficient querying for threaded comments

## Implementation Phases

### Phase 1: Core Infrastructure (1-2 days)
1. Database schema creation
2. Basic CRUD operations
3. Simple comment display

### Phase 2: Advanced Features (1-2 days)
1. Threading and replies
2. Reactions system
3. Editing and deletion

### Phase 3: Polish & Optimization (1 day)
1. Mobile optimization
2. Performance tuning
3. Moderation features

## Integration Points

### ArticlePage Integration
- Add comments sidebar to ArticlePage
- Pass article metadata to comments component
- Handle comment state persistence

### Layout Integration
- Comments widget in Layout component
- Similar to chat widget but article-specific
- Conditional rendering based on current page

## Success Metrics

- Comment engagement rate
- Time spent on article pages
- User retention after commenting
- Mobile vs desktop usage patterns
- Comment quality (reports, moderation actions)

## Key Simplifications

1. **No Real-time**: Comments load once, refetch on actions
2. **No Optimistic Updates**: Wait for server response
3. **No Complex State**: Simple loading/error states
4. **No Background Sync**: No offline support needed
5. **No Real-time Subscriptions**: No Supabase real-time needed 