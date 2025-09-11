# GTM Tracking Pixels Setup Guide - Canada Compliance

## 🇨🇦 Canadian Privacy Compliance (PIPEDA)

Since you're in Canada, your consent system now properly handles PIPEDA compliance requirements for cookie-based tracking.

**Regions requiring consent:**
- ✅ Canada (PIPEDA compliance)
- ✅ EEA/UK/Switzerland (GDPR compliance)
- ✅ Development (localhost override)

## 🍪 Testing the Consent Banner

### Quick Test Commands (Development Console)
```javascript
// Clear consent data and reload to see banner
consentDebug.clearConsent()

// Check your detected region
consentDebug.checkRegion()

// View current consent state
consentDebug.getConsentState()
```

### Manual Testing
1. **Open Developer Tools** → Application tab → Local Storage
2. **Clear `cookie-consent` key** (if it exists)
3. **Refresh page** → Banner should appear

## 📊 GTM Tags Configuration

### 1. Microsoft Clarity (Analytics Consent Required)

**Tag Name:** `Microsoft Clarity - Consent Mode`
**Type:** Custom HTML
**Consent:** Require `analytics_storage` = granted

```html
<script>
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  
  // Enable Clarity Consent Mode
  c[a]('set', 'consentMode', true);
  c[a]('consent', {{analytics_storage}} === 'granted');
  
  // Block on bull-room pages
  if (window.location.pathname.startsWith('/bull-room')) {
    return;
  }
  
})(window, document, "clarity", "script", "t0h9wf1q4x");
</script>
```

### 2. Meta Pixel (Marketing Consent Required)

**Tag Name:** `Meta Pixel`
**Type:** Custom HTML
**Consent:** Require `ad_storage` = granted

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '{{Meta Pixel ID}}');
fbq('track', 'PageView');
</script>
```

**Variables to Create:**
- `Meta Pixel ID`: Your Facebook Pixel ID

### 3. X (Twitter) Pixel (Marketing Consent Required)

**Tag Name:** `X Pixel`
**Type:** Custom HTML
**Consent:** Require `ad_storage` = granted

```html
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');

twq('config','{{Twitter Pixel ID}}');
</script>
```

**Variables to Create:**
- `Twitter Pixel ID`: Your X/Twitter Pixel ID

### 4. Yahoo Finance Ads Pixel (Marketing Consent Required)

**Tag Name:** `Yahoo Finance Ads`
**Type:** Custom HTML
**Consent:** Require `ad_storage` = granted

```html
<script type="text/javascript">
(function(a,b,c,d,e,f,g){a['YahooAnalyticsObject']=e;a[e]=a[e]||function(){
(a[e].q=a[e].q||[]).push(arguments)},a[e].l=1*new Date();f=b.createElement(c),
g=b.getElementsByTagName(c)[0];f.async=1;f.src=d;g.parentNode.insertBefore(f,g)
})(window,document,'script','https://s.yimg.com/wi/ytc.js','ytc');

ytc('config', {
  accountId: '{{Yahoo Account ID}}',
  siteId: '{{Yahoo Site ID}}'
});
ytc('fire');
</script>
```

**Variables to Create:**
- `Yahoo Account ID`: Your Yahoo account ID
- `Yahoo Site ID`: Your Yahoo site ID

## 🎯 GTM Variables Setup

### Built-in Variables to Enable
1. **Consent Settings**:
   - `analytics_storage`
   - `ad_storage`
   - `functionality_storage`

2. **Page Variables**:
   - `Page Path`
   - `Page Title`
   - `Page URL`
   - `Referrer`

### Custom Variables to Create

**Variable Name:** `Consent State`
**Type:** Data Layer Variable
**Data Layer Variable Name:** `consent_state`

## 🚀 Triggers Configuration

### 1. Analytics Consent Trigger
**Name:** `Analytics Consent Granted`
**Type:** Page View
**Conditions:** `analytics_storage` equals `granted`

### 2. Marketing Consent Trigger
**Name:** `Marketing Consent Granted`
**Type:** Page View
**Conditions:** `ad_storage` equals `granted`

### 3. Consent Update Trigger
**Name:** `Consent Update`
**Type:** Custom Event
**Event name:** `consent_update`

### 4. Bull Room Exclusion (for Clarity)
**Name:** `All Pages - No Bull Room`
**Type:** Page View
**Conditions:** `Page Path` does not start with `/bull-room`

## 📋 Tag Assignment Summary

| Tag | Consent Required | Trigger |
|-----|------------------|---------|
| Microsoft Clarity | `analytics_storage` | Analytics Consent + No Bull Room |
| Meta Pixel | `ad_storage` | Marketing Consent |
| X Pixel | `ad_storage` | Marketing Consent |
| Yahoo Finance | `ad_storage` | Marketing Consent |

## 🔍 Testing Workflow

### 1. Before Consent
- Visit site in incognito mode
- Check Network tab: Only GTM container should load
- Verify banner appears (if Canadian timezone or localhost)

### 2. Analytics Consent Only
- Accept Analytics in consent modal
- Check Network: Only Clarity should load
- Marketing pixels should NOT load

### 3. Marketing Consent
- Accept Marketing in consent modal
- Check Network: All pixels should load
- Verify tracking calls are made

### 4. Consent Updates
- Change preferences in consent modal
- Verify tags fire/stop based on new consent state

## 🛡️ Privacy Compliance Features

### Canadian PIPEDA Compliance
- ✅ Clear consent required for cookie-based tracking
- ✅ Granular control (Analytics vs Marketing)
- ✅ Easy withdrawal mechanism
- ✅ Transparent privacy policy integration

### International Compliance
- ✅ GDPR ready (EEA/UK/Switzerland)
- ✅ Cookie-free fallback options
- ✅ Consent versioning and audit trail
- ✅ Data minimization principles

## 📊 Recommended Event Tracking

### Enhanced Measurement Events
```javascript
// Page views (automatic with Clarity)
// Article engagement
gtag('event', 'article_view', {
  article_id: 'article-123',
  article_title: 'Market Analysis',
  author: 'John Doe'
});

// Brief engagement  
gtag('event', 'brief_view', {
  brief_id: 'brief-456',
  brief_title: 'Daily Brief'
});

// User actions
gtag('event', 'user_action', {
  action_category: 'engagement',
  action_label: 'newsletter_signup'
});
```

Your consent system automatically ensures these events only fire with proper consent! 🎉
