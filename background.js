// background.js - Background service worker

// ===== Initialization =====
chrome.runtime.onInstalled.addListener(() => {
  initializeDefaultColorSettings();
  initializeEventsStorage();
});

function initializeDefaultColorSettings() {
  chrome.storage.sync.get(['bgColor', 'fontColor'], (result) => {
    if (result.bgColor === undefined) {
      chrome.storage.sync.set({
        bgColor: '#000000',
        fontColor: '#00ff00'
      });
    }
  });
}

function initializeEventsStorage() {
  chrome.storage.local.set({ events: [] }, () => {
    if (chrome.runtime.lastError) {
      console.error('Storage init error:', chrome.runtime.lastError);
    }
  });
}

// ===== Event Handlers =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'test':
      sendResponse({ success: true, message: 'Background script is working!' });
      break;

    case 'dataLayerEvent':
      handleDataLayerEvent(request.event, sender, sendResponse);
      return true; // async

    case 'getEvents':
      getStoredEvents(sendResponse);
      return true; // async

    case 'clearEvents':
      clearStoredEvents(sendResponse);
      break;

    case 'getColorSettings':
      getColorSettings(sendResponse);
      return true; // async

    case 'saveColorSettings':
      saveColorSettings(request.bgColor, request.fontColor, sendResponse);
      return true; // async
  }
});

// ===== Core Logic =====
function handleDataLayerEvent(event, sender, sendResponse) {
  console.log('handleDataLayerEvent____', event, sender, sendResponse);
  chrome.storage.local.get(['events'], (result) => {
    let events = result.events || [];

    const newEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      url: sender.tab?.url || 'unknown',
      tabId: sender.tab?.id
    };

    events.unshift(newEvent);
    if (events.length > 100) {
      events = events.slice(0, 100);
    }

    chrome.storage.local.set({ events }, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
      }
    });

    logEventToConsole(newEvent);

    sendResponse({ success: true, eventId: newEvent.timestamp });
  });
}

function getStoredEvents(sendResponse) {
  chrome.storage.local.get(['events'], (result) => {
    sendResponse({ events: result.events || [] });
  });
}

function clearStoredEvents(sendResponse) {
  chrome.storage.local.set({ events: [] }, () => {
    sendResponse({ success: true });
  });
}

function getColorSettings(sendResponse) {
  chrome.storage.sync.get(['bgColor', 'fontColor'], (result) => {
    sendResponse({
      bgColor: result.bgColor || '#000000',
      fontColor: result.fontColor || '#00ff00'
    });
  });
}

function saveColorSettings(bgColor, fontColor, sendResponse) {
  chrome.storage.sync.set({ bgColor, fontColor }, () => {
    sendResponse({ success: true });
  });
}

// ===== Logging =====
function logEventToConsole(event) {
  chrome.storage.sync.get(['bgColor', 'fontColor'], (settings) => {
    const bgColor = settings.bgColor || '#000000';
    const fontColor = settings.fontColor || '#00ff00';

    console.log(
      `%c[DataLayer Event] ${event.event || 'Unknown Event'}`,
      `background: ${bgColor}; color: ${fontColor}; padding: 2px 6px; border-radius: 3px; font-weight: bold;`
    );
    console.log('Event Data:', event);
  });
}
