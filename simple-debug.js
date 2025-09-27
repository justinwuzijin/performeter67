// Simple debug version - replace contentScript.js with this
console.log('🚀 Simple Debug Version Loaded');

// Check if we're on Tinder
if (window.location.hostname.includes('tinder.com')) {
  console.log('✅ Tinder detected!');
  
  // Create simple sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'debug-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    background: #000;
    color: #0f0;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    z-index: 9999;
    overflow-y: auto;
  `;
  
  document.body.appendChild(sidebar);
  
  // Add debug info
  function addDebugInfo(message) {
    const div = document.createElement('div');
    div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    sidebar.appendChild(div);
    console.log(message);
  }
  
  addDebugInfo('🔍 Starting Tinder analysis...');
  
  // Check for Tinder elements
  setTimeout(() => {
    addDebugInfo('🔍 Looking for Tinder elements...');
    
    // Check for the specific div you found
    const tinderDivs = document.querySelectorAll('div[class*="Bdrs(8px)"]');
    addDebugInfo(`Found ${tinderDivs.length} Tinder profile divs`);
    
    tinderDivs.forEach((div, index) => {
      const style = window.getComputedStyle(div);
      const bgImage = style.backgroundImage;
      const ariaLabel = div.getAttribute('aria-label') || '';
      
      addDebugInfo(`Div ${index + 1}: aria="${ariaLabel}"`);
      addDebugInfo(`Div ${index + 1}: has background image: ${bgImage !== 'none'}`);
      
      if (bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          addDebugInfo(`Div ${index + 1}: image URL found!`);
          addDebugInfo(`Div ${index + 1}: ${urlMatch[1].substring(0, 50)}...`);
        }
      }
    });
    
    // Check for all images
    const allImages = document.querySelectorAll('img');
    addDebugInfo(`Found ${allImages.length} total img tags`);
    
    // Check for background images
    let bgImageCount = 0;
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        bgImageCount++;
      }
    });
    addDebugInfo(`Found ${bgImageCount} elements with background images`);
    
    // Check for text
    const allText = document.body.textContent;
    const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    addDebugInfo(`Found ${lines.length} text lines`);
    
    // Look for profile-like text
    const profileText = lines.filter(line => 
      line.includes('age') || 
      line.includes('km') || 
      line.includes('miles') || 
      /^\d+$/.test(line) ||
      line.length > 20
    );
    addDebugInfo(`Found ${profileText.length} potential profile text lines`);
    
    // Show some examples
    profileText.slice(0, 5).forEach((text, i) => {
      addDebugInfo(`Text ${i + 1}: "${text}"`);
    });
    
  }, 2000);
  
  // Watch for changes
  let changeCount = 0;
  const observer = new MutationObserver(() => {
    changeCount++;
    addDebugInfo(`DOM changed (${changeCount} times)`);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
} else {
  console.log('❌ Not on Tinder');
}
