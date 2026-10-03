// Popup JavaScript - manages events display, color settings, and tab functionality
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const closeBtn = document.getElementById('closeBtn');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const clearEventsBtn = document.getElementById('clearEvents');
  const eventsContent = document.getElementById('eventsContent');
  const eventCount = document.getElementById('eventCount');
  const bgColorInput = document.getElementById('bgColor');
  const fontColorInput = document.getElementById('fontColor');
  const bgColorPreview = document.getElementById('bgColorPreview');
  const fontColorPreview = document.getElementById('fontColorPreview');
  const saveColorsBtn = document.getElementById('saveColorsBtn');
  const status = document.getElementById('status');
  
  // Initialize popup
  initializePopup();
  
  // Event listeners
  closeBtn.addEventListener('click', closePopup);
  clearEventsBtn.addEventListener('click', clearEvents);
  saveColorsBtn.addEventListener('click', saveColorSettings);
  
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Color input changes
  bgColorInput.addEventListener('input', updateColorPreviews);
  fontColorInput.addEventListener('input', updateColorPreviews);
  
  // Prevent popup from closing when clicking inside
  document.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Initialize popup functionality
  function initializePopup() {
    loadColorSettings();
    loadEvents();
    updateColorPreviews();
    
    // Test background script communication
    testBackgroundScript();
  }
  
  // Test if background script is working
  function testBackgroundScript() {
    console.log('Popup: Testing background script communication...');
    chrome.runtime.sendMessage({ type: 'test' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Popup: Background script test failed:', chrome.runtime.lastError);
      } else {
        console.log('Popup: Background script test successful:', response);
      }
    });
  }
  
  // Switch between tabs
  function switchTab(tabName) {
    // Update tab states
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content visibility
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabName + 'Tab');
    });
  }
  
  // Load color settings from storage
  function loadColorSettings() {
    chrome.runtime.sendMessage({ type: 'getColorSettings' }, (response) => {
      if (response && response.bgColor) {
        bgColorInput.value = response.bgColor;
        fontColorInput.value = response.fontColor;
        updateColorPreviews();
      }
    });
  }
  
  // Update color previews
  function updateColorPreviews() {
    bgColorPreview.style.backgroundColor = bgColorInput.value;
    fontColorPreview.style.color = fontColorInput.value;
  }
  
  // Save color settings
  function saveColorSettings() {
    const settings = {
      bgColor: bgColorInput.value,
      fontColor: fontColorInput.value
    };
    
    // Disable save button
    saveColorsBtn.disabled = true;
    saveColorsBtn.textContent = 'Saving...';
    
    // Save to storage
    chrome.runtime.sendMessage({
      type: 'saveColorSettings',
      bgColor: settings.bgColor,
      fontColor: settings.fontColor
    }, (response) => {
      if (response && response.success) {
        showStatus('Color settings saved successfully!', 'success');
      } else {
        showStatus('Failed to save color settings', 'error');
      }
      
      // Re-enable save button
      saveColorsBtn.disabled = false;
      saveColorsBtn.textContent = 'Save Color Settings';
      
      // Hide status after 3 seconds
      setTimeout(hideStatus, 3000);
    });
  }
  
  // Load events from storage
  function loadEvents() {
    console.log('Popup: Loading events...');
    chrome.runtime.sendMessage({ type: 'getEvents' }, (response) => {
      console.log('Popup: Received response:', response);
      if (response && response.events) {
        console.log('Popup: Displaying', response.events.length, 'events');
        displayEvents(response.events);
      } else {
        console.log('Popup: No events found, displaying empty state');
        displayNoEvents();
      }
    });
  }
  
  // Display events in the list
  function displayEvents(events) {
    console.log('__displayEvents start', events)
    if (events.length === 0) {
      displayNoEvents();
      return;
    }
    
    // Update event count
    eventCount.textContent = events.length;
    
    // Create events list
    const eventsList = document.createElement('ul');
    eventsList.className = 'events-list';
    
    events.forEach((event) => {
      const eventItem = createEventItem(event);
      eventsList.appendChild(eventItem);
    });
    
    // Update content
    eventsContent.innerHTML = '';
    eventsContent.appendChild(eventsList);
  }
  
  // Create a single event item
  function createEventItem(event) {
    const li = document.createElement('li');
    li.className = 'event-item';
    
    // Event header (clickable)
    const eventHeader = document.createElement('div');
    eventHeader.className = 'event-header';
    
    // Left side of header
    const headerLeft = document.createElement('div');
    headerLeft.className = 'event-header-left';
    
    // Event name
    const eventName = document.createElement('div');
    eventName.className = 'event-name';
    eventName.textContent = event.event || 'Unknown Event';
    
    // Timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'event-timestamp';
    const date = new Date(event.timestamp);
    timestamp.textContent = date.toLocaleString('en-US');
    
    headerLeft.appendChild(eventName);
    headerLeft.appendChild(timestamp);
    
    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'event-toggle';
    toggleBtn.innerHTML = '▼';
    toggleBtn.setAttribute('aria-label', 'Toggle event details');
    
    eventHeader.appendChild(headerLeft);
    eventHeader.appendChild(toggleBtn);
    
    // Event content (collapsible)
    const eventContent = document.createElement('div');
    eventContent.className = 'event-content';
    
    // Event data
    const eventData = document.createElement('div');
    eventData.className = 'event-data';
    
    // Format event data as JSON
    const eventDataStr = JSON.stringify(event, null, 2);
    eventData.textContent = eventDataStr;
    
    // Add URL info if available
    if (event.url && event.url !== 'unknown') {
      const urlInfo = document.createElement('div');
      urlInfo.style.marginTop = '8px';
      urlInfo.style.fontSize = '11px';
      urlInfo.style.color = '#6c757d';
      urlInfo.textContent = `URL: ${event.url}`;
      eventData.appendChild(urlInfo);
    }
    
    eventContent.appendChild(eventData);
    
    // Toggle functionality
    eventHeader.addEventListener('click', () => {
      const isExpanded = eventContent.classList.contains('expanded');
      
      if (isExpanded) {
        eventContent.classList.remove('expanded');
        toggleBtn.innerHTML = '▼';
      } else {
        eventContent.classList.add('expanded');
        toggleBtn.innerHTML = '▲';
      }
    });
    
    li.appendChild(eventHeader);
    li.appendChild(eventContent);
    
    return li;
  }
  
  // Display no events message
  function displayNoEvents() {
    eventCount.textContent = '0';
    eventsContent.innerHTML = '<div class="no-events">No events captured yet</div>';
  }
  
  // Clear all events
  function clearEvents() {
    if (confirm('Are you sure you want to clear all events?')) {
      chrome.runtime.sendMessage({ type: 'clearEvents' }, (response) => {
        if (response && response.success) {
          // displayNoEvents();
        }
      });
    }
  }
  
  // Close popup
  function closePopup() {
    window.close();
  }
  
  // Show status message
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
  }
  
  // Hide status message
  function hideStatus() {
    status.style.display = 'none';
  }
  
  // Listen for storage changes (updates from other parts of extension)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('WTF')
    if (namespace === 'local' && changes.events) {
      // Events updated, refresh display
      loadEvents();
    }
    
    if (namespace === 'sync' && (changes.bgColor || changes.fontColor)) {
      // Color settings updated, refresh display
      loadColorSettings();
    }
  });
});
