# Account Settings Page Design

## Problem Statement

Users need a centralized location to manage their account information, preferences, and settings. Currently, users can only log out from the avatar menu, but there's no way to view or modify their account details, preferences, or manage their data.

## Requirements

### Functional Requirements
1. **Profile Management**
   - Display current user information (email, username)
   - Allow editing of email (with validation and OTP verification)
   - Allow editing of username (with uniqueness validation)
   - Show account creation date and last login
   - Newsletter subscription toggle

2. **Onboarding Data**
   - Display onboarding responses (investor type, experience, risk tolerance, interests, country)
   - Show onboarding completion status
   - Edit button that opens the existing OnboardingModal for updates

3. **Notification Preferences**
   - Email notification settings
   - Article update notifications
   - Brief notifications
   - Newsletter preferences
   - Marketing communications

3. **Security Settings**
   - Email OTP authentication management
   - Session management
   - Login history
   - Account security overview

4. **Data Management**
   - Export user data (bookmarks, preferences, etc.)
   - Account deletion with proper warnings
   - Data retention settings

5. **Navigation & Access**
   - Accessible from sidebar avatar menu
   - Breadcrumb navigation back to main app
   - Responsive design for mobile/tablet

### Non-Functional Requirements
1. **Design Consistency**
   - Follow existing design system (minimalist black/white theme)
   - Match current page layouts and styling
   - Use existing UI components where possible

2. **User Experience**
   - Clean, minimalistic interface (no icons as per user preference)
   - Intuitive navigation and form interactions
   - Clear feedback for all actions
   - Proper loading states and error handling

3. **Performance**
   - Fast loading times
   - Efficient data fetching
   - Optimistic updates where appropriate

## Technical Design

### Page Structure
```
/account-settings
├── Profile Section
│   ├── Email (editable with OTP verification)
│   ├── Username (editable with uniqueness validation)
│   ├── Newsletter Subscription (toggle)
│   └── Account Info (creation date, last login)
├── Onboarding Section
│   ├── Investor Type (display only)
│   ├── Experience Level (display only)
│   ├── Risk Tolerance (display only)
│   ├── Interests (display only)
│   ├── Country (display only)
│   ├── Onboarding Status
│   └── Edit Button (opens OnboardingModal)
├── Notification Preferences Section
│   ├── Email Notifications
│   ├── Article Updates
│   ├── Brief Notifications
│   ├── Newsletter Preferences
│   └── Marketing Communications
├── Security Section
│   ├── Email OTP Authentication Status
│   ├── Session Management
│   └── Account Security Overview
└── Data Management Section
    ├── Export Data
    └── Delete Account
```

### Component Architecture
```
AccountSettingsPage
├── AccountSettingsLayout
│   ├── SettingsHeader
│   ├── SettingsNavigation
│   └── SettingsContent
│       ├── ProfileSection
│       ├── PreferencesSection
│       ├── SecuritySection
│       └── DataManagementSection
└── SettingsForm (reusable)
```

### Data Flow
1. **Initial Load**: Fetch user data from AuthContext and any additional user preferences
2. **Form Updates**: Optimistic updates with rollback on error
3. **Data Persistence**: Update Supabase user metadata and custom user preferences table
4. **State Management**: Use React state for form data, AuthContext for user data

### API Integration
- **User Data**: From AuthContext (email) and user_profiles table (username, newsletter_subscribed, preferences)
- **Profile Updates**: Update user_profiles table for username, newsletter_subscribed, and preferences
- **Onboarding Data**: Update preferences JSONB field with onboarding responses
- **Notification Preferences**: New notification_preferences JSONB column in user_profiles table
- **Email Updates**: Use Supabase Auth API to update email with OTP verification
- **Security**: Supabase Auth API for session management
- **Data Export**: Generate JSON export of user data from user_profiles and related tables

## Implementation Plan

### Phase 1: Basic Structure
1. Create AccountSettingsPage component
2. Add route to Routes.tsx
3. Add "Account Settings" link to sidebar avatar menu
4. Implement basic layout and navigation

### Phase 2: Profile Management
1. Create ProfileSection component
2. Implement display name and username editing
3. Add form validation and error handling
4. Connect to Supabase for data persistence

### Phase 3: Onboarding & Notification Preferences
1. Create OnboardingSection component (display only with edit button)
2. Create NotificationPreferencesSection component
3. Integrate OnboardingModal for editing onboarding data
4. Add notification preferences storage (new column)
5. Add newsletter subscription toggle

### Phase 4: Data Management
1. Create DataManagementSection component
2. Implement data export functionality
3. Add account deletion with proper warnings
4. Add confirmation modals for destructive actions

### Phase 5: Polish & Testing
1. Add loading states and error handling
2. Implement responsive design
3. Add comprehensive testing
4. Performance optimization

## File Structure
```
src/
├── pages/
│   └── AccountSettingsPage.tsx
├── components/
│   └── account/
│       ├── AccountSettingsLayout.tsx
│       ├── ProfileSection.tsx
│       ├── OnboardingSection.tsx
│       ├── NotificationPreferencesSection.tsx
│       ├── SecuritySection.tsx
│       └── DataManagementSection.tsx
└── services/
    └── accountService.ts
```

## Success Criteria
1. Users can access account settings from the sidebar avatar menu
2. Users can edit their email (with OTP verification)
3. Users can edit their username (with uniqueness validation)
4. Users can toggle newsletter subscription
5. Users can view their onboarding responses
6. Users can edit onboarding responses via OnboardingModal
7. Users can manage notification preferences
8. Users can export their data
9. Users can delete their account with proper warnings
10. The interface matches the existing design system
11. The page is fully responsive
12. All forms have proper validation and error handling

## Risks & Mitigation
1. **Data Loss**: Implement proper confirmation dialogs for destructive actions
2. **Form Validation**: Use comprehensive client-side validation with server-side verification
3. **Performance**: Implement efficient data fetching and caching
4. **Security**: Ensure all sensitive operations require proper authentication
5. **User Experience**: Provide clear feedback for all actions and proper error messages 