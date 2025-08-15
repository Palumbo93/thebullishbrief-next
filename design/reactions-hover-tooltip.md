# Reactions Hover Tooltip Design

## Problem Statement

Users want to see who has reacted to messages when hovering over reaction buttons. Currently, the `MessageReactions` component only shows emoji and count, but doesn't provide visibility into which specific users have reacted.

## Requirements

- Show list of usernames when hovering over reaction buttons
- Maintain existing design system aesthetics
- Support both desktop and mobile interactions
- Handle cases where there are many users (truncation/overflow)
- Ensure accessibility and keyboard navigation
- Follow existing tooltip patterns in the codebase

## Design Solution

### 1. Component Architecture

Create a new `ReactionTooltip` component that:
- Renders a floating tooltip with user list
- Handles positioning relative to reaction button
- Manages hover state and timing
- Integrates with existing `MessageReactions` component

### 2. Data Structure

The reactions data is already available in the format:
```typescript
reactions: Record<string, string[]> // emoji -> array of user IDs
```

We need to:
- Map user IDs to usernames (from message context or user lookup)
- Handle cases where user data might not be available
- Support fallback to user ID if username unavailable

### 3. UI/UX Design

#### Tooltip Styling
- **Background**: `var(--color-bg-card)` with subtle border
- **Border**: `var(--color-border-primary)` 
- **Border Radius**: `var(--radius-lg)`
- **Shadow**: `var(--shadow-lg)` for depth
- **Padding**: `var(--space-3)` for content spacing
- **Max Width**: 280px to prevent overflow
- **Z-Index**: `var(--z-tooltip)` (1070)

#### Content Layout
- **Header**: "Reacted by" with emoji
- **User List**: Vertical list of usernames
- **Truncation**: Show "and X more" for lists > 5 users
- **Empty State**: "No reactions yet" when count is 0

#### Positioning
- **Default**: Above the reaction button
- **Fallback**: Below if not enough space above
- **Offset**: 8px from button edge
- **Arrow**: Small triangle pointing to button

### 4. Interaction Behavior

#### Hover Timing
- **Show Delay**: 300ms to prevent accidental triggers
- **Hide Delay**: 100ms to allow moving to tooltip content
- **Hide on Leave**: When mouse leaves both button and tooltip

#### Mobile Considerations
- **Touch**: Show on tap, hide on tap outside
- **Long Press**: Alternative trigger for mobile
- **Swipe**: Dismiss tooltip with swipe gesture

### 5. Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Support for focus management
- **High Contrast**: Ensure visibility in all themes
- **Reduced Motion**: Respect user preferences

## Implementation Plan

### Phase 1: Core Tooltip Component
1. Create `ReactionTooltip` component
2. Implement positioning logic
3. Add basic styling and animations
4. Handle hover state management

### Phase 2: Integration
1. Integrate with `MessageReactions` component
2. Add user data mapping
3. Handle edge cases (no users, many users)
4. Add mobile touch support

### Phase 3: Polish & Testing
1. Add accessibility features
2. Optimize performance
3. Add unit tests
4. Cross-browser testing

## Technical Details

### Component Props
```typescript
interface ReactionTooltipProps {
  emoji: string;
  userIds: string[];
  userMap: Record<string, string>; // userId -> username
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}
```

### Styling Variables
```css
--tooltip-bg: var(--color-bg-card);
--tooltip-border: var(--color-border-primary);
--tooltip-shadow: var(--shadow-lg);
--tooltip-radius: var(--radius-lg);
--tooltip-padding: var(--space-3);
--tooltip-max-width: 280px;
--tooltip-z-index: var(--z-tooltip);
```

### Animation
```css
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

## Success Metrics

- Tooltip appears within 300ms of hover
- Smooth animations with no jank
- Works correctly on all screen sizes
- Accessible to screen readers
- No performance impact on message rendering
- Users can easily see who reacted to messages

## Future Enhancements

- Click to expand full user list
- User avatars in tooltip
- Reaction timestamps
- Bulk reaction management
- Custom emoji reactions
