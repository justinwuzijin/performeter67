// Popup script for Performative Meter extension

document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  
  // Check if we're on Tinder
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    
    if (currentTab.url.includes('tinder.com')) {
      statusElement.textContent = 'Active on Tinder';
      statusElement.classList.add('active');
    } else {
      statusElement.textContent = 'Navigate to Tinder to use this extension';
    }
  });
  
  // Listen for tab updates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      if (tab.url.includes('tinder.com')) {
        statusElement.textContent = 'Active on Tinder';
        statusElement.classList.add('active');
      } else {
        statusElement.textContent = 'Navigate to Tinder to use this extension';
        statusElement.classList.remove('active');
      }
    }
  });
});
