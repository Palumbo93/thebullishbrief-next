# Centralized Toast System Design

## Problem Statement

Currently, toast notifications are implemented as individual component state (e.g., in ProfileSection), which leads to:
- Code duplication across components
- Inconsistent toast behavior
- No global toast management
- Potential for overlapping toasts
- Complex state management in each component

We need a centralized toast system that provides a clean API for showing notifications from anywhere in the app while maintaining the current visual design.

## Requirements

### Functional Requirements
- Show success and error toast notifications
- Auto-dismiss toasts after 5 seconds
- Allow manual dismissal via close button
- Support multiple simultaneous toasts (queue/stack)
- Maintain exact current visual design and animations
- Provide simple API for components to show toasts

### Non-Functional Requirements
- Performance: Minimal re-renders
- Accessibility: Proper ARIA labels and keyboard support
- Type Safety: Full TypeScript support
- Maintainability: Clean separation of concerns

## Architecture

### Component Structure
```
ToastProvider (Context)
├── ToastContainer (Renderer)
│   └── Toast (Individual toast - existing component)
└── useToast (Hook for consumers)
```

### Data Flow
1. Component calls `toast.success()` or `toast.error()`
2. ToastContext adds toast to queue with unique ID
3. ToastContainer renders all active toasts
4. Auto-dismiss timer removes toast after 5s
5. Manual close removes toast immediately

## Implementation Plan

### 1. Toast Context (`contexts/ToastContext.tsx`)
```typescript
interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error';
  timestamp: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}
```

### 2. Toast Hook (`hooks/useToast.ts`)
```typescript
const useToast = () => {
  const context = useContext(ToastContext);
  return {
    success: (message: string) => context.showToast(message, 'success'),
    error: (message: string) => context.showToast(message, 'error'),
  };
};
```

### 3. Toast Container (`components/ToastContainer.tsx`)
- Renders all active toasts
- Handles positioning and stacking
- Manages individual toast lifecycle

### 4. Integration Points
- Add ToastProvider to App.tsx root
- Add ToastContainer to Layout component
- Update existing components to use useToast hook

## Design Decisions

### Toast Positioning
- **Decision**: Fixed positioning at top-center
- **Rationale**: Maintains current design, doesn't interfere with content
- **Alternative**: Toast portal for better z-index control

### Multiple Toast Handling
- **Decision**: Stack toasts vertically with 16px gap
- **Rationale**: Shows all messages, clear visual separation
- **Alternative**: Queue system (one at a time) - simpler but less informative

### Auto-Dismiss Timing
- **Decision**: Keep 5-second timer per toast
- **Rationale**: Maintains current UX, proven timing
- **Alternative**: Different timing for success vs error

### State Management
- **Decision**: React Context with useReducer
- **Rationale**: Simple, built-in, no external dependencies
- **Alternative**: Redux/Zustand - overkill for this use case

## Visual Design

### Toast Stacking
```
┌─────────────────┐ ← Newest toast (top: 16px)
│  Success Toast  │
└─────────────────┘
        ↓ 16px gap
┌─────────────────┐ ← Second toast (top: 76px)
│  Error Toast    │   
└─────────────────┘
```

### Animation
- Each toast slides in independently
- Existing toasts shift down when new ones appear
- Smooth transitions using CSS transforms

## Migration Plan

### Phase 1: Infrastructure
1. Create ToastContext and ToastProvider
2. Create useToast hook
3. Create ToastContainer component
4. Integrate into App.tsx

### Phase 2: Component Updates
1. Update ProfileSection to use new system
2. Remove old Toast implementation from ProfileSection
3. Test functionality matches exactly

### Phase 3: Cleanup
1. Remove individual toast implementations
2. Update any other components using toasts
3. Document usage for team

## API Examples

### Basic Usage
```typescript
// In any component
const toast = useToast();

const handleSuccess = () => {
  toast.success('Profile updated successfully');
};

const handleError = () => {
  toast.error('Failed to update profile');
};
```

### Current ProfileSection Migration
```typescript
// Before
const [toast, setToast] = useState<{...} | null>(null);
const showToast = (message: string, type: 'success' | 'error') => {
  setToast({ message, type });
};

// After  
const toast = useToast();
// Direct calls: toast.success('message') or toast.error('message')
```

## Testing Strategy

### Unit Tests
- ToastContext state management
- useToast hook behavior
- ToastContainer rendering logic

### Integration Tests
- Toast display and dismissal
- Multiple toast stacking
- Auto-dismiss timing

### Manual Testing
- Visual consistency with current design
- Animation smoothness
- Accessibility (screen readers, keyboard navigation)

## Risk Assessment

### Low Risk
- Breaking existing toast functionality
- Performance impact (minimal state)

### Mitigation
- Maintain exact same Toast component
- Gradual migration approach
- Comprehensive testing

## Success Metrics

1. **Functionality**: All existing toast behaviors work identically
2. **Developer Experience**: Simpler API reduces code by ~80% in components
3. **User Experience**: No visual or behavioral changes
4. **Maintainability**: Single source of truth for toast logic

## Future Enhancements

- Different toast types (info, warning)
- Custom positioning options
- Toast actions (undo, retry)
- Persistence across page navigation
- Rich content support (HTML, React nodes)
