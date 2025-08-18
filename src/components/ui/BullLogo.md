# BullLogo Component

A theme-aware logo component that automatically switches between light and dark logo variants based on the current theme.

## Features

- **Automatic Theme Switching**: Uses the current theme to display the appropriate logo
- **Manual Override**: Can force a specific logo variant regardless of theme
- **Next.js Image Support**: Uses Next.js Image component for optimal performance
- **Fallback Support**: Includes `BullLogoImg` for contexts where Next.js Image can't be used
- **Responsive**: Supports custom sizing and responsive behavior

## Usage

### Basic Usage (Auto Theme Switching)

```tsx
import { BullLogo } from './ui/BullLogo';

// Automatically switches based on theme
<BullLogo width={40} height={40} alt="Logo" />
```

### Manual Variant Override

```tsx
// Force light logo (regardless of theme)
<BullLogo variant="light" width={40} height={40} />

// Force dark logo (regardless of theme)  
<BullLogo variant="dark" width={40} height={40} />
```

### Using the Image Fallback

For contexts where Next.js Image component can't be used (email templates, server contexts):

```tsx
import { BullLogoImg } from './ui/BullLogo';

<BullLogoImg width={40} height={40} alt="Logo" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `40` | Width of the logo in pixels |
| `height` | `number` | `40` | Height of the logo in pixels |
| `className` | `string` | `''` | Additional CSS classes |
| `alt` | `string` | `'The Bullish Brief'` | Alt text for accessibility |
| `variant` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Logo variant override |
| `priority` | `boolean` | `false` | Priority loading for above-the-fold logos |
| `sizes` | `string` | `undefined` | Custom sizes attribute for responsive images |

## Logo Files

- **Light Theme**: `/images/logo-black.png` (black logo for light backgrounds)
- **Dark Theme**: `/images/logo.png` (white/original logo for dark backgrounds)

## Theme Logic

- `variant="auto"` (default): Shows black logo on light theme, white logo on dark theme
- `variant="light"`: Always shows the original white logo
- `variant="dark"`: Always shows the black logo

## Examples

```tsx
// Header logo with priority loading
<BullLogo width={48} height={48} priority alt="The Bullish Brief" />

// Small logo in sidebar
<BullLogo width={32} height={32} />

// Large logo in modal with forced variant
<BullLogo width={120} height={120} variant="light" />

// Responsive logo with custom sizes
<BullLogo 
  width={40} 
  height={40} 
  sizes="(max-width: 768px) 32px, 40px"
/>
```
