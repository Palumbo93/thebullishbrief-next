# Automatic Build Triggers Design Document

## Problem Statement

The current workflow requires manual build triggering after creating or editing articles, briefs, and authors. This creates friction in the content management process and can lead to content being created but not visible on the live site until someone remembers to trigger a build.

**Goals:**
- Automatically trigger full builds ('all' type) whenever content is created/edited
- Simplify BuildTrigger component to only have one "Build All" option
- Provide real-time deployment status feedback via popup notifications
- Integrate seamlessly with existing admin workflows

## Technical Requirements

### 1. Automatic Build Triggers
- Hook into existing content creation/editing flows:
  - Article creation (`ArticleCreateModal`)
  - Article editing (`ArticleEditModal`) - especially when slug changes
  - Brief creation (`BriefCreateModal`) 
  - Brief editing (`BriefEditModal`) - especially when slug changes
  - Author creation (`AuthorManager`)
  - Author editing (`AuthorManager`) - especially when slug changes

### 2. Build Status Tracking
- Leverage Vercel's webhooks API for deployment status updates
- Track deployment states: `pending`, `building`, `ready`, `error`
- Store deployment status in React context/state management
- Display real-time status via popup notifications

### 3. User Interface
- Simplify `BuildTrigger.tsx` to single "Build All" button
- Add deployment status popup component
- Show build progress indicators in relevant modals
- Non-blocking UI - content creation/editing should not wait for build completion

## Architecture Design

### 1. Build Trigger Hook (`useBuildTrigger`)
```typescript
interface BuildStatus {
  isBuilding: boolean;
  lastBuildTime: string | null;
  deploymentId: string | null;
  status: 'idle' | 'pending' | 'building' | 'ready' | 'error';
  error: string | null;
}

export function useBuildTrigger() {
  const triggerBuild = async (reason?: string) => Promise<void>;
  const buildStatus: BuildStatus;
  return { triggerBuild, buildStatus };
}
```

### 2. Deployment Status Context
```typescript
interface DeploymentContextType {
  currentDeployment: BuildStatus;
  deploymentHistory: BuildStatus[];
  subscribe: (callback: (status: BuildStatus) => void) => () => void;
}
```

### 3. Vercel Webhook Handler (`/api/deployment-webhook`)
- Receive deployment status updates from Vercel
- Update deployment status in real-time
- Trigger popup notifications via Server-Sent Events (SSE) or polling

### 4. Build Status Popup Component
- Toast-style notifications for build status updates
- Shows: "Build started...", "Build in progress...", "Build completed ✅", "Build failed ❌"
- Auto-dismiss successful builds, persist error states
- Click to view deployment details

## Implementation Plan

### Phase 1: Core Infrastructure (30 minutes)
1. Create `useBuildTrigger` hook with simplified API
2. Update `/api/trigger-build` to always use 'all' type
3. Simplify `BuildTrigger.tsx` component

### Phase 2: Automatic Triggers (45 minutes)
1. Add build triggers to article creation/editing
2. Add build triggers to brief creation/editing  
3. Add build triggers to author creation/editing
4. Implement slug change detection for targeted builds

### Phase 3: Status Tracking (60 minutes)
1. Create Vercel deployment webhook endpoint
2. Implement deployment status context
3. Create build status popup component
4. Add real-time status updates

### Phase 4: Integration & Testing (30 minutes)
1. Integrate popup notifications with all build triggers
2. Test automatic build flows
3. Handle edge cases and error states

## File Changes

### New Files
- `src/hooks/useBuildTrigger.ts` - Build trigger hook
- `src/contexts/DeploymentContext.tsx` - Deployment status management
- `src/components/admin/BuildStatusPopup.tsx` - Status notification popup
- `src/app/api/deployment-webhook/route.ts` - Vercel webhook handler

### Modified Files
- `src/components/admin/BuildTrigger.tsx` - Simplify to single button
- `src/components/admin/ArticleCreateModal.tsx` - Add auto-build trigger
- `src/components/admin/ArticleEditModal.tsx` - Add auto-build trigger
- `src/components/admin/BriefCreateModal.tsx` - Add auto-build trigger
- `src/components/admin/BriefEditModal.tsx` - Add auto-build trigger
- `src/components/admin/AuthorManager.tsx` - Add auto-build trigger
- `src/app/api/trigger-build/route.ts` - Always use 'all' type, return deployment ID

## Technical Considerations

### 1. Performance
- Build triggers are async and non-blocking
- Content creation/editing completes immediately
- Build status updates happen in background

### 2. Error Handling
- Failed builds don't block content operations
- Clear error messaging in popup notifications
- Retry mechanisms for failed webhook deliveries

### 3. Rate Limiting
- Debounce multiple rapid content changes
- Prevent duplicate builds for same content changes
- Respect Vercel deployment limits

### 4. User Experience
- Clear visual feedback on build status
- Non-intrusive notifications
- Ability to dismiss or view build details

## Deployment Checklist

- [ ] Set up Vercel deployment webhook in dashboard
- [ ] Configure `VERCEL_DEPLOY_HOOK_URL` environment variable
- [ ] Test webhook endpoint with Vercel
- [ ] Verify build triggers work in all content modals
- [ ] Test build status popup notifications
- [ ] Validate error handling and edge cases

## Success Metrics

- Content creators no longer need to manually trigger builds
- Build status is clearly communicated to users
- Zero missed deployments due to forgotten manual triggers
- Improved content publishing workflow efficiency
