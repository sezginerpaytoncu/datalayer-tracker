// content.js
(function() {
  'use strict';

  /**
   * Injects a script file into the page context.
   * @param {string} filePath 
   */
  function injectScript(filePath) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  /**
   * Handles messages from the injected script and forwards them to the background.
   * @param {MessageEvent} event 
   */
  function handlePageMessage(event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'DATA_LAYER_EVENT') {
      chrome.runtime.sendMessage({
        type: 'dataLayerEvent',
        event: event.data.data
      });
    }
  }

  // Inject the hook script into page context
  injectScript('injectScript.js');

  // Listen for events from page context
  window.addEventListener('message', handlePageMessage, false);

})();
