// Content script to inject the React sidebar into Tinder pages

console.log('Performative Meter content script loaded');

// Check if we're on Tinder
if (window.location.hostname.includes('tinder.com')) {
  console.log('Tinder detected, injecting sidebar...');
  
  // Create the sidebar container
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'performative-meter-sidebar';
  sidebarContainer.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    background: #fff;
    border-left: 2px solid #e0e0e0;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Add to page
  document.body.appendChild(sidebarContainer);
  
  // Load the React app
  loadReactApp();
}

function loadReactApp() {
  // Get the extension ID and construct the path to the built React app
  const extensionId = chrome.runtime.id;
  const reactAppPath = chrome.runtime.getURL('sidebar/dist/index.html');
  
  console.log('Loading React app from:', reactAppPath);
  
  // Create an iframe to load the React app
  const iframe = document.createElement('iframe');
  iframe.src = reactAppPath;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `;
  
  // Add iframe to sidebar container
  const sidebarContainer = document.getElementById('performative-meter-sidebar');
  if (sidebarContainer) {
    sidebarContainer.appendChild(iframe);
    
    // Handle iframe load
    iframe.onload = () => {
      console.log('React app loaded successfully');
    };
    
    iframe.onerror = (error) => {
      console.error('Failed to load React app:', error);
      // Fallback: show placeholder content
      sidebarContainer.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>Performative Meter Sidebar</h3>
          <p>React app failed to load. Please check the build.</p>
        </div>
      `;
    };
  }
}

// Handle page navigation (for SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Page navigation detected, checking for sidebar...');
    
    // Check if sidebar still exists, if not, recreate it
    if (!document.getElementById('performative-meter-sidebar')) {
      setTimeout(() => {
        if (window.location.hostname.includes('tinder.com')) {
          console.log('Recreating sidebar after navigation...');
          // Re-run the injection logic
          const sidebarContainer = document.createElement('div');
          sidebarContainer.id = 'performative-meter-sidebar';
          sidebarContainer.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 300px;
            height: 100vh;
            background: #fff;
            border-left: 2px solid #e0e0e0;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          `;
          document.body.appendChild(sidebarContainer);
          loadReactApp();
        }
      }, 1000);
    }
  }
}).observe(document, {subtree: true, childList: true});
