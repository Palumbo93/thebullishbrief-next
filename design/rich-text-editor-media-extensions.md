# Rich Text Editor Media Extensions

## Problem Statement

The current RichTextEditor only supports basic text formatting, images, links, and tables. Users need the ability to embed videos, GIFs, and interactive buttons within article content to create more engaging and dynamic content.

## Requirements

1. **Video Support**: Embed videos from URLs (YouTube, Vimeo, direct video files)
2. **GIF Support**: Embed GIFs from URLs or upload them
3. **Button Support**: Create interactive buttons with custom text, links, and styling
4. **Responsive Design**: All new elements must be responsive and work on mobile/desktop
5. **Admin Interface**: Easy-to-use modals for adding these elements in the admin panel
6. **Content Rendering**: Proper rendering of these elements in the ArticlePage

## Technical Design

### TipTap Extensions

We'll create custom TipTap extensions for each new element type:

#### 1. Video Extension
```typescript
interface VideoAttributes {
  src: string;
  title?: string;
  width?: string;
  height?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}
```

#### 2. GIF Extension
```typescript
interface GifAttributes {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
}
```

#### 3. Button Extension
```typescript
interface ButtonAttributes {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  target?: '_blank' | '_self';
  icon?: string;
  iconSide?: 'left' | 'right';
}
```

### Admin Interface Components

#### 1. VideoModal
- URL input for video source
- Preview of video
- Options for controls, autoplay, muted, loop
- Support for YouTube/Vimeo embedding

#### 2. GifModal
- URL input for GIF source
- File upload option
- Alt text input
- Preview of GIF

#### 3. ButtonModal
- Button text input
- Link URL input
- Style options (variant, size)
- Icon selection
- Preview of button

### Content Rendering

The ArticlePage will need to handle these new elements:

1. **Video Rendering**: 
   - YouTube/Vimeo iframe embedding
   - Direct video file with HTML5 video player
   - Responsive container with aspect ratio

2. **GIF Rendering**:
   - Standard img tag with responsive sizing
   - Loading states for large GIFs

3. **Button Rendering**:
   - Use existing Button component
   - Apply custom styling based on attributes
   - Handle click events and navigation

### Implementation Plan

#### Phase 1: Dependencies and Extensions
1. Add required TipTap extensions to package.json
2. Create custom TipTap extensions for video, GIF, and button
3. Update RichTextEditor to include new extensions

#### Phase 2: Admin Interface
1. Create VideoModal component
2. Create GifModal component  
3. Create ButtonModal component
4. Add toolbar buttons to RichTextEditor
5. Update ArticleCreateModal and ArticleEditModal

#### Phase 3: Content Rendering
1. Update ArticlePage content rendering
2. Add CSS styles for new elements
3. Test responsive behavior
4. Add loading states and error handling

#### Phase 4: Testing and Polish
1. Test all new features
2. Add validation and error handling
3. Optimize performance
4. Update documentation

## File Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── VideoModal.tsx
│   │   ├── GifModal.tsx
│   │   ├── ButtonModal.tsx
│   │   └── RichTextEditor.tsx (updated)
│   └── ui/
│       └── Button.tsx (existing)
├── lib/
│   └── tiptap/
│       ├── video-extension.ts
│       ├── gif-extension.ts
│       └── button-extension.ts
└── page-components/
    └── ArticlePage.tsx (updated)
```

## Dependencies to Add

```json
{
  "@tiptap/extension-iframe": "^3.1.0",
  "@tiptap/extension-node-view": "^3.1.0"
}
```

## Success Criteria

1. ✅ Users can embed videos from URLs in articles
2. ✅ Users can embed GIFs from URLs or uploads in articles  
3. ✅ Users can add interactive buttons with custom styling
4. ✅ All new elements render properly on ArticlePage
5. ✅ Admin interface is intuitive and easy to use
6. ✅ Content is responsive on all devices
7. ✅ Performance is not significantly impacted

## Risks and Mitigation

**Risk**: Large GIFs/videos could impact page load performance
**Mitigation**: Add loading states, lazy loading, and size limits

**Risk**: Malicious content in video/GIF URLs
**Mitigation**: URL validation and sanitization

**Risk**: Complex TipTap extensions could be buggy
**Mitigation**: Thorough testing and fallback rendering
