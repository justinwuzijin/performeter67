// Background service worker for Performative Meter extension

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Performative Meter extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.url);
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  
  if (request.action === 'getActiveTab') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      sendResponse({tab: tabs[0]});
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'fetchImage') {
    // Fetch image from background script (has different CORS permissions)
    fetch(request.url)
      .then(response => response.blob())
      .then(blob => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .then(base64 => {
        sendResponse({ base64: base64 });
      })
      .catch(error => {
        console.error('Error fetching image:', error);
        sendResponse({ error: error.message });
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
