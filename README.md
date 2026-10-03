# DataLayer Tracker

A lightweight Chromium extension for inspecting Google Tag Manager `dataLayer` events as they are pushed. Each captured event is shown in the extension popup with its timestamp and page URL, and is also written to the page's browser console.

## Features

- Captures object entries pushed to `window.dataLayer`.
- Displays the 100 most recent events in the extension popup.
- Records an ISO 8601 timestamp, page URL, and tab ID for each event.
- Logs captured events to the browser console with configurable colors.
- Stores events locally with `chrome.storage.local` and color preferences with `chrome.storage.sync`.
- Uses Manifest V3.

## Install for development

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Microsoft Edge.
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose this project's directory.
5. Visit a page that uses a `dataLayer` array, then open the extension popup or that page's developer console.

To apply code changes, reload the extension from the browser's extensions page.

## How it works

The content script injects `injectScript.js` into the page context so it can wrap `window.dataLayer.push`. Captured objects are forwarded to the extension's background service worker, which adds metadata, retains up to 100 events, and logs them to the console. Existing object entries in `dataLayer` are also captured when the hook initializes.

## Permissions and data

The extension requests the `storage` and `activeTab` permissions and uses `<all_urls>` match patterns to run on pages where a data layer may be present. Captured events can contain page-provided information, which may include personal or sensitive values. Event data and page URLs are stored in the browser's local extension storage; this project does not send them to a remote service. Use it only on pages and data you are authorized to inspect, and clear stored events from the popup when appropriate.

## Project files

```text
manifest.json       Extension metadata and permissions
background.js       Event storage, timestamps, and console logging
content.js          Bridge between page context and extension
injectScript.js     dataLayer.push hook
popup.html          Popup interface
popup.js            Popup behavior
icons/              Extension icons
test.html           Local test page
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
