// injectScript.js
(function() {
  'use strict';

  /**
   * Sends captured event data to content script via postMessage.
   * @param {Object} eventData 
   */
  function sendToExtension(eventData) {
    window.postMessage(
      { type: 'DATA_LAYER_EVENT', data: eventData },
      '*'
    );
  }

  /**
   * Hooks window.dataLayer.push to intercept GTM events.
   */
  function hookDataLayerPush() {
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    // Avoid double hooking
    if (window.dataLayer.push._isHookedByDataLayerTracker) {
      return;
    }

    const originalPush = window.dataLayer.push;
    const customPush = function(...args) {
      const eventData = args[0];
      if (eventData && typeof eventData === 'object') {
        sendToExtension(eventData);
      }
      return originalPush.apply(this, args);
    };

    customPush._isHookedByDataLayerTracker = true;
    window.dataLayer.push = customPush;
  }

  /**
   * Initialize the hook and capture pre-existing events.
   */
  function initialize() {
    hookDataLayerPush();

    // Capture events already in dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.forEach(event => {
        if (event && typeof event === 'object') {
          sendToExtension(event);
        }
      });
    }
  }

  // Init immediately
  initialize();

  // Ensure hook stays in place (GTM might reassign push)
  setInterval(hookDataLayerPush, 3000);

})();
