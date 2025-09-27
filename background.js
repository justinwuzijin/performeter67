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
  }
});
