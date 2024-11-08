# Timer Extension

A clean and simple Chrome extension that helps you manage time with customizable countdown timers.

![Timer Screenshot](timer.png)

## Features

- Quick preset timers (10, 30, and 60 minutes)
- Custom timer input (1 minute to 24 hours)
- Visual countdown display
- Browser badge showing remaining minutes
- Desktop notifications
  - Timer completion notification
  - One-minute remaining warning
- Timer persists across browser sessions
- Clean, modern theme interface

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your browser toolbar to open the timer
2. Set a timer using either:
   - Preset buttons (10, 30, or 60 minutes)
   - Custom input field (1-1440 minutes)
3. Click "Start" to begin the countdown
4. The timer will run in the background even when the popup is closed
5. You'll receive notifications when:
   - One minute remains
   - The timer completes

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses Chrome Extension Manifest V3
- Implements Chrome's storage, notifications, and background services
- Responsive and accessible design

## Files Structure

- `popup.html` - Main timer interface
- `popup.js` - Timer logic and UI interactions
- `background.js` - Background service worker
- `styles.css` - Extension styling
- `manifest.json` - Extension configuration
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

## Permissions

- `alarms` - For timer functionality
- `storage` - For persisting timer state
- `notifications` - For timer alerts

## License

[Add your chosen license here]
