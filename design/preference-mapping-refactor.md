# Preference Mapping System Refactor

## Problem Statement

The current `preferenceMapping.ts` file has multiple sources of truth for preference mappings:
- Individual mapping objects (`INVESTOR_TYPE_MAP`, `EXPERIENCE_MAP`, etc.)
- `ONBOARDING_OPTIONS` object
- `COUNTRY_MAP` with external dependencies

This creates maintenance issues where:
- Changes need to be made in multiple places
- Inconsistencies can arise between different mapping sources
- The code is harder to maintain and extend
- There's duplication of preference data

We need to refactor this to make `ONBOARDING_OPTIONS` the single source of truth, with all other mappings derived from it.

## Requirements

### Functional Requirements
- `ONBOARDING_OPTIONS` becomes the single source of truth for all preference data
- All mapping objects (`INVESTOR_TYPE_MAP`, `EXPERIENCE_MAP`, etc.) are derived from `ONBOARDING_OPTIONS`
- Maintain backward compatibility for existing functions
- Support for countries that aren't in `ONBOARDING_OPTIONS` (using countries-list as fallback)
- Type safety for all preference types

### Non-Functional Requirements
- Performance: Efficient mapping generation
- Maintainability: Single source of truth reduces maintenance burden
- Extensibility: Easy to add new preference types or options
- Type Safety: Full TypeScript support with proper types

## Architecture

### Data Flow
```
ONBOARDING_OPTIONS (Single Source)
├── Derived Mapping Objects
│   ├── INVESTOR_TYPE_MAP
│   ├── EXPERIENCE_MAP
│   ├── RISK_TOLERANCE_MAP
│   ├── INTERESTS_MAP
│   └── COUNTRY_MAP (with fallback)
└── Helper Functions
    ├── formatPreferenceValue
    ├── getAvailableOptions
    ├── getOnboardingOptions
    └── isRoomVisibleToUser
```

### TypeScript Interfaces
```typescript
interface PreferenceOption {
  id: string;
  label: string;
  desc?: string;
}

interface OnboardingOptions {
  investorType: PreferenceOption[];
  experience: PreferenceOption[];
  riskTolerance: PreferenceOption[];
  interests: PreferenceOption[];
  country: PreferenceOption[];
}
```

## Implementation

### 1. Single Source of Truth
- `ONBOARDING_OPTIONS` is now the only place where preference options are defined
- All options include `id`, `label`, and optional `desc` fields
- TypeScript interfaces ensure type safety

### 2. Derived Mapping Objects
- `createMappingFromOptions()` helper function generates mapping objects from `ONBOARDING_OPTIONS`
- All mapping objects (`INVESTOR_TYPE_MAP`, `EXPERIENCE_MAP`, etc.) are now derived
- No manual maintenance required for mapping objects

### 3. Country Mapping with Fallback
- `createCountryMap()` function handles country mappings
- Onboarding country options take precedence
- `countries-list` library provides fallback for countries not in onboarding options
- Maintains backward compatibility for all country codes

### 4. Backward Compatibility
- All existing functions (`formatPreferenceValue`, `getAvailableOptions`, etc.) work unchanged
- Existing code using mapping objects continues to work
- No breaking changes to the public API

## Benefits

### Maintainability
- Single source of truth eliminates duplication
- Changes only need to be made in `ONBOARDING_OPTIONS`
- Reduced risk of inconsistencies

### Type Safety
- TypeScript interfaces ensure proper structure
- Compile-time checking for preference option structure
- Better IDE support and autocomplete

### Extensibility
- Easy to add new preference types by extending `OnboardingOptions` interface
- Easy to add new options to existing preference types
- Consistent structure across all preference types

### Performance
- Mapping objects are generated once at module load
- No runtime overhead for mapping generation
- Efficient lookup for preference formatting

## Migration Notes

### What Changed
- `ONBOARDING_OPTIONS` is now the single source of truth
- Mapping objects are derived automatically
- Added TypeScript interfaces for type safety
- Removed manual mapping object definitions

### What Stayed the Same
- All public API functions work unchanged
- Existing code using mapping objects continues to work
- Country mapping behavior is preserved
- All preference options and their values remain the same

### Future Considerations
- When adding new preference types, extend the `OnboardingOptions` interface
- When adding new options, only update `ONBOARDING_OPTIONS`
- Consider adding validation for preference option structure
- Consider adding unit tests for mapping generation functions
