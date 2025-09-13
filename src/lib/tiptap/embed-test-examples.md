# Embed Extension Test Examples

This document contains test examples for the new Embed extension in the RichTextEditor.

## YouTube Iframe Example

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```

## TradingView Widget Example

```html
<!-- TradingView Widget BEGIN -->
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
  {
    "symbols": [
      {"proName":"FOREXCOM:SPXUSD","title":"S&P 500"},
      {"proName":"FOREXCOM:NSXUSD","title":"Nasdaq 100"},
      {"proName":"FX_IDC:EURUSD","title":"EUR/USD"}
    ],
    "colorTheme": "light",
    "isTransparent": false,
    "displayMode": "adaptive",
    "locale": "en"
  }
  </script>
</div>
<!-- TradingView Widget END -->
```

## Simple HTML Example

```html
<div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 20px; border-radius: 10px; color: white; text-align: center;">
  <h3>Custom HTML Embed</h3>
  <p>This is a custom HTML embed with styling.</p>
</div>
```

## Usage Instructions

1. Open the RichTextEditor
2. Click the "Add Embed" button (FileText icon) in the toolbar
3. Paste one of the above examples into the "Embed Code" field
4. The extension will auto-detect the type (iframe, script, or html)
5. Adjust width/height as needed
6. Click "Add Embed" to insert into the editor

## Security Features

- Dangerous attributes (onclick, onload, etc.) are automatically removed
- Malicious CSS expressions are filtered out
- Iframes get sandbox attributes for security
- Content is sanitized before rendering

## Supported Content Types

- **Iframe**: YouTube videos, embedded content, etc.
- **Script**: TradingView widgets, interactive content, etc.
- **HTML**: Custom styled content, divs, etc.
