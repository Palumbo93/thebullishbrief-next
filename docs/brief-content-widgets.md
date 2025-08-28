# Brief Content Widget Injection

This feature allows you to inject interactive widgets directly into brief content at specific points, enhancing user engagement and lead generation.

## Usage

### In Brief Content

When creating or editing a brief in the admin panel, you can insert widget markers directly in the HTML content:

```html
<p>This is the first part of your brief content.</p>

<h2>Key Section</h2>
<p>Some important information here...</p>

{INSERT_CTA_BLOCK}

<p>This content will appear after the lead generation widget.</p>

<h2>Another Section</h2>
<p>More content continues here...</p>
```

### Available Widgets

#### `{INSERT_CTA_BLOCK}`
- **Widget**: BriefLeadGenWidget
- **Visibility**: Mobile only (hidden on desktop via CSS)
- **Function**: Lead generation and email collection
- **Features**:
  - Email collection for unauthenticated users
  - One-click signup for authenticated users
  - Company ticker display
  - Customizable copy from brief's `popup_copy` field
  - Thank you message with signup CTA for unauthenticated users

### Widget Behavior

- **Mobile Only**: The widget is wrapped in a `.mobile-only` class and will only appear on mobile devices
- **Responsive**: The widget uses a compact layout optimized for mobile viewing
- **Analytics**: Widget interactions are tracked separately from other lead generation components
- **Multiple Instances**: You can use multiple `{INSERT_CTA_BLOCK}` markers in the same brief

### Technical Implementation

The content processor (`src/utils/contentProcessor.tsx`):
1. Splits HTML content at widget marker points
2. Injects React components between content segments
3. Maintains proper content flow and styling
4. Preserves existing content optimizations (TOC generation, image optimization)

### Content Structure

When a brief contains `{INSERT_CTA_BLOCK}`, the content is processed as follows:

```
[HTML Content Before] → [BriefLeadGenWidget] → [HTML Content After]
```

Multiple markers create a sequence:
```
[HTML Part 1] → [Widget 1] → [HTML Part 2] → [Widget 2] → [HTML Part 3]
```

### Analytics Tracking

Widget interactions are tracked with the source type: `inline_content_widget`

This allows you to differentiate between:
- Popup lead generation (`popup`)
- Sidebar widget lead generation (`sidebar_widget`)  
- Inline content widget lead generation (`inline_content_widget`)

### Best Practices

1. **Strategic Placement**: Place widgets after engaging content sections to maximize conversion
2. **Content Flow**: Ensure the widget placement doesn't interrupt important narrative flow
3. **Mobile-First**: Remember this is mobile-only, so consider the mobile reading experience
4. **Testing**: Preview content on mobile devices to ensure optimal placement
5. **Analytics**: Monitor widget performance through analytics to optimize placement

### Example Usage

```html
<h1>Company Analysis: TechCorp</h1>
<p>TechCorp has shown remarkable growth in the past quarter...</p>

<h2>Financial Highlights</h2>
<p>Revenue increased by 25% year-over-year, with strong performance across all segments.</p>

{INSERT_CTA_BLOCK}

<h2>Market Position</h2>
<p>The company continues to gain market share in the competitive tech sector...</p>

<h2>Investment Outlook</h2>
<p>Based on our analysis, we maintain a bullish outlook on TechCorp's prospects.</p>
```

In this example, the lead generation widget will appear between the Financial Highlights and Market Position sections, capturing reader interest at a natural break point in the content.
