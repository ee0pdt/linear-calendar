# PWA and iOS Homescreen Setup

## Current Status ✅

The Linear Calendar app now has enhanced PWA and iOS homescreen support with:

### iOS Specific Features:

- `apple-mobile-web-app-capable` - Enables full-screen mode when added to homescreen
- `apple-mobile-web-app-status-bar-style` - Uses black-translucent status bar
- `apple-mobile-web-app-title` - Custom app title on homescreen
- Apple touch icons for various device sizes

### PWA Features:

- Enhanced manifest.json with proper categories and orientation
- Multiple icon sizes declared for different devices
- Standalone display mode for app-like experience
- Proper scope and start URL configuration

## How to Add to iOS Homescreen:

1. Open Safari on iOS device
2. Navigate to your Linear Calendar URL
3. Tap the Share button (square with arrow up)
4. Scroll down and tap "Add to Home Screen"
5. The app will appear as a native-looking icon on your homescreen
6. When opened, it will run in full-screen mode without browser UI

## Icon Optimization (Optional Enhancement):

Currently using the existing 192x192 logo for all iOS icon sizes. For optimal appearance, you could create specific sized icons:

- 120x120px (iPhone)
- 152x152px (iPad)
- 167x167px (iPad Pro)
- 180x180px (iPhone Plus/Pro)

## Future Enhancements:

- Service Worker for offline functionality
- Push notifications support
- Background sync capabilities
- Install prompts for better discoverability

The app now provides a native-like experience when saved to the iOS homescreen!
