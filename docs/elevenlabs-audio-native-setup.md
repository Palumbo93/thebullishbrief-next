# ElevenLabs Audio Native Setup

This document explains how to set up and configure ElevenLabs Audio Native for the application.

## Overview

The ElevenLabs Audio Native integration allows users to listen to articles and briefs as audio content. The audio player is positioned strategically on the page and smoothly transitions between locations based on scroll position.

## Features

- **Smart Positioning**: Audio player appears under the meta info bar initially
- **Scroll Animation**: When user scrolls past the meta info, player smoothly moves to the action panel
- **Responsive Design**: Works on both desktop and mobile devices
- **Content-Aware**: Automatically identifies article/brief titles for better user experience

## Setup Instructions

### 1. Get ElevenLabs Public User ID

1. Visit [ElevenLabs Audio Native](https://elevenlabs.io/docs/product-guides/audio-tools/audio-native/react)
2. Follow their setup guide to create an Audio Native project
3. Copy your Public User ID from the embed code snippet

### 2. Configure Environment Variable

Add your ElevenLabs Public User ID to your environment variables:

```bash
# .env.local or your environment configuration
NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID=your-public-user-id-here
```

### 3. Verify Integration

The audio player should now appear on:
- Article pages (under the article meta info section)
- Brief pages (under the brief meta info section)

## Components

### ElevenLabsAudioNative
Core component that renders the ElevenLabs audio player widget.

**Props:**
- `publicUserId?: string` - ElevenLabs public user ID (optional if env var is set)
- `size?: 'small' | 'large'` - Player size (default: 'small')
- `textColorRgba?: string` - Text color for the player
- `backgroundColorRgba?: string` - Background color for the player

### AudioNativeController
Wrapper component that handles scroll-based positioning and animations.

**Props:**
- `contentType?: 'article' | 'brief'` - Type of content being displayed
- `title?: string` - Content title for accessibility
- `triggerOffset?: number` - Scroll distance before moving to action panel (default: 400px)
- `metaInfoSelector?: string` - CSS selector for meta info section
- `actionPanelSelector?: string` - CSS selector for action panel

## Customization

### Styling
The audio player can be customized using CSS variables:
- `--color-bg-secondary` - Player background
- `--color-border-primary` - Player border
- `--radius-lg` - Border radius
- `--transition-base` - Transition timing

### Animation Timing
Scroll trigger offset can be adjusted per page:

```tsx
<AudioNativeController
  triggerOffset={300} // Adjust this value
  // ... other props
/>
```

### Player Appearance
Colors can be customized:

```tsx
<AudioNativeController
  textColorRgba="rgba(255, 255, 255, 1.0)"
  backgroundColorRgba="rgba(0, 0, 0, 0.9)"
  // ... other props
/>
```

## Troubleshooting

### Player Not Appearing
1. Check that `NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID` is set correctly
2. Verify the ElevenLabs script is loading (check browser network tab)
3. Check browser console for any error messages

### Animation Issues
1. Ensure CSS selectors match your page structure
2. Check that scroll trigger offset is appropriate for your content layout
3. Verify that the action panel sticky sections exist

### Mobile Issues
1. Test on actual mobile devices, not just browser dev tools
2. Check that touch scrolling works properly
3. Verify responsive styling is applied correctly

## Security Notes

- The public user ID is safe to expose in client-side code
- No additional API keys or secrets are required
- ElevenLabs handles all audio processing server-side

## Support

For ElevenLabs-specific issues, refer to their [documentation](https://elevenlabs.io/docs/product-guides/audio-tools/audio-native/react) or contact their support team.
