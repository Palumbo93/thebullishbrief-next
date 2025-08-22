# Automatic Username Generation – Design Document

## Problem Statement

The current sign-up flow requires users to manually enter a username, which creates friction in the registration process. We want to automatically generate usernames from the email address (using the part before the @ symbol) and handle conflicts by appending numbers, making the sign-up process smoother and faster.

## Goals

- Remove the username field from the SignUpModal form
- Automatically generate usernames from email addresses using the part before @
- Implement client-side conflict resolution by appending incrementing numbers (e.g., john, john2, john3)
- Maintain all existing username validation and database constraints
- Preserve the ability for users to change their username later in account settings

## Non-Goals

- Changing the database schema or constraints
- Modifying the existing username validation rules
- Altering the account settings username editing functionality

## Architecture

### Current State Analysis

Currently:
- SignUpModal has both username and email fields
- Database trigger `create_user_profile()` uses `coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))`
- AuthContext already defaults to `email.split('@')[0]` when no username provided
- Database has conflict resolution using random suffixes in the trigger

### Proposed Changes

#### 1. Frontend Changes

**Remove Username Field from SignUpModal**:
- Remove username FormField from SignUpModal component
- Update form validation to only validate email
- Remove username from AuthFormData type for sign-up flow
- Update useAuthForm hook to not require username validation for sign-up

**Implement Smart Username Generation**:
- Create `generateUsername()` utility function
- Check username availability via Supabase query
- Append incremental numbers for conflicts (john, john2, john3, etc.)
- Sanitize email prefix (remove special characters, ensure minimum length)

#### 2. Username Generation Logic

```ts
// src/utils/usernameGeneration.ts
export const generateUsername = async (email: string): Promise<string> => {
  const baseUsername = sanitizeUsername(email.split('@')[0]);
  let username = baseUsername;
  let counter = 1;
  
  while (await isUsernameTaken(username)) {
    counter++;
    username = `${baseUsername}${counter}`;
  }
  
  return username;
};

const sanitizeUsername = (input: string): string => {
  // Remove special characters, ensure min length 3, max length per validation rules
  return input
    .replace(/[^a-zA-Z0-9_]/g, '')
    .substring(0, 20) // Max length from validation
    .padEnd(3, '0'); // Ensure minimum length
};
```

#### 3. Component Updates

**SignUpModal Changes**:
- Remove username FormField
- Remove username from form state
- Generate username automatically when sending OTP
- Pass generated username to sendOTP function

**Type Updates**:
- Update AuthFormData to make username optional for sign-up context
- Update validation functions to skip username validation for sign-up

#### 4. Integration Points

**AuthContext Integration**:
- The existing `sendOTP` function already accepts optional username
- Generated username will be passed through existing flow
- Database trigger will receive username in `raw_user_meta_data`

**Validation Updates**:
- Remove username validation from sign-up form validation
- Keep username validation for account settings (existing functionality)
- Update useAuthForm to conditionally validate username

## Implementation Plan

### Phase 1: Create Username Generation Utility
1. Create `src/utils/usernameGeneration.ts`
2. Implement username generation and conflict resolution logic
3. Add unit tests for username generation

### Phase 2: Update SignUpModal
1. Remove username FormField from SignUpModal
2. Update form validation to exclude username
3. Integrate username generation into form submission
4. Update form layout and styling

### Phase 3: Update Type System and Hooks
1. Update AuthFormData type to make username optional in sign-up context
2. Update useAuthForm hook to conditionally validate username
3. Update validation functions to handle sign-up vs settings contexts

### Phase 4: Testing and Refinement
1. Test username generation with various email formats
2. Test conflict resolution with existing usernames
3. Verify account settings username editing still works
4. Test edge cases (very short emails, emails with special characters)

## Technical Considerations

### Username Sanitization Rules
- Remove all special characters except underscores
- Convert to lowercase for consistency
- Ensure minimum 3 character length (pad with numbers if needed)
- Respect maximum length from existing validation (20 characters)

### Conflict Resolution Strategy
- Check username availability before sending OTP
- Use incremental numbering (john, john2, john3) for better UX
- Fall back to database-level conflict resolution if client-side fails

### Database Compatibility
- Existing database trigger remains as fallback
- Generated usernames follow existing validation rules
- No schema changes required

### Performance Considerations
- Username availability check adds one database query per sign-up
- Consider caching common username patterns
- Debounce username generation if email changes rapidly

## Success Metrics

- Reduced sign-up form abandonment rate
- Faster sign-up completion time
- Maintained username uniqueness (0 conflicts)
- No increase in support tickets about usernames
- Preserved account settings username editing functionality

## Rollback Plan

If issues arise:
1. Revert SignUpModal to include username field
2. Keep username generation utility for future use
3. All existing database constraints and triggers remain unchanged
4. Account settings functionality unaffected
