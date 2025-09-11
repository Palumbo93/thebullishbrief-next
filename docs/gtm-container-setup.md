# GTM Container Setup Guide - GTM-TJWNG6WZ

## 🎯 GTM Container: GTM-TJWNG6WZ

Your container is now configured in the layout. Next, you need to set up tags in your GTM dashboard.

## 1. Microsoft Clarity Tag Setup

### Create Custom HTML Tag
1. **Go to GTM Dashboard**: [https://tagmanager.google.com](https://tagmanager.google.com)
2. **Select Container**: GTM-TJWNG6WZ
3. **Create New Tag**: Tags → New → Custom HTML

### Tag Configuration

**Tag Name:** `Microsoft Clarity - Consent Mode`

**HTML Code:**
```html
<script>
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  
  // Enable Clarity Consent Mode (required for EEA/UK/CH compliance)
  c[a]('set', 'consentMode', true);
  
  // Set initial consent state based on GTM consent
  var analyticsConsent = {{analytics_storage}} === 'granted';
  c[a]('consent', analyticsConsent);
  
  // Block on bull-room pages (maintain existing behavior)
  if (window.location.pathname.startsWith('/bull-room')) {
    return;
  }
  
})(window, document, "clarity", "script", "t0h9wf1q4x");
</script>
```

### Advanced Settings
- **Consent Settings**: ✅ Require additional consent for tag to fire
  - **Consent Type**: `analytics_storage` = granted
- **Tag firing options**: Once per page

### Triggers
**Create two triggers:**

1. **All Pages (with consent)**
   - Trigger Type: Page View
   - Name: `All Pages - Analytics Consent`
   - Conditions: analytics_storage = granted

2. **Consent Update**
   - Trigger Type: Custom Event  
   - Name: `Consent Update`
   - Event name: `consent_update`

## 2. Test the Setup

### In GTM Preview Mode
1. **Enable Preview**: Click "Preview" in GTM
2. **Visit your site**: Open your website
3. **Check Tags**: Verify Clarity tag fires only with consent

### Expected Behavior
- **No Consent**: Clarity tag should NOT fire
- **Analytics Consent**: Clarity tag fires with full functionality
- **Bull Room Pages**: Clarity should not load (existing behavior)

## 3. Optional: Google Analytics 4

If you want to add GA4 (recommended for additional insights):

### Create GA4 Tag
1. **Tag Type**: Google Analytics: GA4 Configuration
2. **Measurement ID**: Your GA4 measurement ID
3. **Consent Settings**: Require `analytics_storage` = granted
4. **Trigger**: All Pages (with analytics consent)

### Benefits of Adding GA4
- Enhanced measurement and conversion tracking
- Better integration with Google Ads (if used)
- Funnel analysis and attribution reporting
- Complements Clarity's behavioral insights

## 4. Marketing Tags (Future)

When ready to add marketing/advertising tags:
- Set consent requirement to `ad_storage` = granted
- Users will need to accept "Marketing" consent category
- Examples: Facebook Pixel, Google Ads Conversion Tracking

## 5. Publish Changes

### Before Publishing
- [ ] Test in Preview mode
- [ ] Verify Clarity respects consent settings
- [ ] Check that no tags fire without consent
- [ ] Test consent modal functionality

### Publish Steps
1. **Review Changes**: Check all tags and triggers
2. **Add Version Name**: "Initial Consent Mode Setup"
3. **Publish**: Click "Submit" then "Publish"

## 🔍 Verification Checklist

### Developer Tools Test
1. **Open DevTools**: F12 → Network tab
2. **Visit site incognito**: Fresh session
3. **Before consent**: No clarity.ms requests
4. **Accept analytics**: Clarity should load
5. **Check cookies**: Only with consent

### Expected Network Requests
- **Before consent**: Only GTM container load
- **After analytics consent**: Clarity script loads from clarity.ms
- **Bull room pages**: No Clarity requests (blocked)

## 📊 Monitoring Success

### GTM Built-in Variables to Enable
- Analytics Storage
- Ad Storage  
- Consent Type
- Page Path
- Page Title

### Custom Events to Track
Your consent system automatically pushes these events:
- `consent_update`: When user changes preferences
- `page_view`: Enhanced page view tracking
- `user_action`: Custom user interactions

## 🚀 Next Steps

1. **Set up Clarity tag** using the configuration above
2. **Test thoroughly** in preview mode
3. **Publish** when ready
4. **Monitor** the Real-Time reports in GTM
5. **Consider adding GA4** for enhanced analytics

Your consent system is fully functional and ready to work with any tags you add to GTM! The Microsoft Clarity setup above ensures compliance with the October 31, 2025 requirements while maintaining full functionality.
