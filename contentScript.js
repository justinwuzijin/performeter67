// Tinder Profile Photo Extractor with React Sidebar Integration
console.log('🚀 Tinder Extractor Started');

// Check if we're on Tinder
if (window.location.hostname.includes('tinder.com')) {
  console.log('✅ Tinder detected!');
  
  // Wait for page to fully load
  function waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }
  
  // Wait for page to load, then start
  waitForPageLoad().then(() => {
    // Add a small delay to let Tinder finish loading
    setTimeout(() => {
      startExtraction();
    }, 3000);
  });
  
  function startExtraction() {
    console.log('🔍 Starting extraction...');
    
    function log(message) {
      console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
    
    log('✅ Extractor active');
    
    // Manual Tinder carousel extractor - captures active profile photo on each click
    let extractedProfileImages = [];
    let carouselPosition = 0;
    let isWaitingForNextImage = false;
    let isAnalyzing = false; // Flag to prevent multiple simultaneous requests
    
    // Create React sidebar container
    function createSidebarContainer() {
      // Remove existing elements if they exist
      const existingSidebar = document.getElementById('performeter-sidebar');
      if (existingSidebar) existingSidebar.remove();
      
      // Create main container for React app
      const mainContainer = document.createElement('div');
      mainContainer.id = 'performeter-sidebar';
      mainContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        pointer-events: none;
      `;
      
      // Create left meter container
      const meterContainer = document.createElement('div');
      meterContainer.id = 'meter-container';
      meterContainer.style.cssText = `
        position: fixed;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 60px;
        height: 400px;
        z-index: 10000;
        pointer-events: auto;
      `;
      
      // Create right sidebar container
      const sidebarContainer = document.createElement('div');
      sidebarContainer.id = 'sidebar-container';
      sidebarContainer.style.cssText = `
        position: fixed;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 350px;
        height: 600px;
        z-index: 10000;
        pointer-events: auto;
      `;
      
      mainContainer.appendChild(meterContainer);
      mainContainer.appendChild(sidebarContainer);
      document.body.appendChild(mainContainer);
      
      // Load React app
      loadReactApp();
      
      return mainContainer;
    }
    
    // Load React app from the sidebar build
    function loadReactApp() {
      const meterContainer = document.getElementById('meter-container');
      const sidebarContainer = document.getElementById('sidebar-container');
      
      if (!meterContainer || !sidebarContainer) return;
      
      // Create iframe for meter (left side)
      const meterIframe = document.createElement('iframe');
      meterIframe.src = chrome.runtime.getURL('sidebar/dist/index.html#meter');
      meterIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        pointer-events: auto;
      `;
      
      // Create iframe for sidebar (right side)
      const sidebarIframe = document.createElement('iframe');
      sidebarIframe.src = chrome.runtime.getURL('sidebar/dist/index.html#sidebar');
      sidebarIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        pointer-events: auto;
      `;
      
      meterContainer.appendChild(meterIframe);
      sidebarContainer.appendChild(sidebarIframe);
      
      // Debug: Check if iframes are loading
      meterIframe.onload = () => {
        console.log('✅ Meter iframe loaded');
        // Send initial update once iframe is ready
        setTimeout(() => updateReactApp(), 500);
      };
      sidebarIframe.onload = () => {
        console.log('✅ Sidebar iframe loaded');
        // Send initial update once iframe is ready
        setTimeout(() => updateReactApp(), 500);
      };
      
      meterIframe.onerror = () => console.error('❌ Meter iframe failed to load');
      sidebarIframe.onerror = () => console.error('❌ Sidebar iframe failed to load');
      
      // Listen for messages from the React app
      window.addEventListener('message', (event) => {
        console.log('📨 Message received:', event.data);
        if (event.data.type === 'PERFORMETER_ANALYZE') {
          console.log('🚀 Analyze button clicked, starting Gemini analysis...');
          sendToGemini();
        }
      });
    }
    
    function extractActiveProfilePhoto() {
      // Target the specific div structure for Tinder profile photos
      // Look for divs with the specific class pattern and aria-label containing "Profile Photo"
      const profilePhotoDivs = document.querySelectorAll('div[aria-label*="Profile Photo"]');
      let activeProfilePhoto = null;
      
      profilePhotoDivs.forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1].includes('gotinder.com')) {
            const ariaLabel = el.getAttribute('aria-label') || '';
            if (ariaLabel.includes('Profile Photo') && ariaLabel !== 'Profile Photo') {
              // This is a profile photo (but not the user's own profile photo)
              // Check if it's the active/visible one
              const rect = el.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0 && 
                               rect.top >= 0 && rect.left >= 0 &&
                               rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
              
              if (isVisible) {
                activeProfilePhoto = {
                  url: urlMatch[1],
                  ariaLabel: ariaLabel,
                  className: el.className,
                  extractedAt: new Date().toISOString(),
                  carouselPosition: carouselPosition,
                  dimensions: { width: rect.width, height: rect.height }
                };
              }
            }
          }
        }
      });
      
      if (activeProfilePhoto) {
        // Check if this exact image is already stored
        const isDuplicate = extractedProfileImages.some(existing => 
          existing.url === activeProfilePhoto.url
        );
        
        if (!isDuplicate) {
          // Check if this is a new person (same profile photo number but different URL)
          const sameProfileNumber = extractedProfileImages.some(existing => 
            existing.ariaLabel === activeProfilePhoto.ariaLabel && 
            existing.url !== activeProfilePhoto.url
          );
          
          if (sameProfileNumber) {
            // New person detected - clear all stored images and reset UI
            log(`🔄 New person detected (${activeProfilePhoto.ariaLabel}) - clearing previous images`);
            extractedProfileImages = [];
            clearMeterAndSidebar();
          }
          
          extractedProfileImages.push(activeProfilePhoto);
          
          log(`📸 Logged photo at: ${activeProfilePhoto.url}`);
          console.log('🎯 ACTIVE PROFILE PHOTO COLLECTION:', extractedProfileImages);
          
          // Update React app with new data
          updateReactApp();
        }
      }
    }
    
    // Clear meter and sidebar for new person
    function clearMeterAndSidebar() {
      const resetData = {
        type: 'PERFORMETER_UPDATE',
        overallScore: 0,
        imageCount: 0,
        analysisData: null,
        isAnalyzing: false
      };

      // Send message to meter iframe
      const meterIframe = document.querySelector('#meter-container iframe');
      if (meterIframe && meterIframe.contentWindow) {
        meterIframe.contentWindow.postMessage(resetData, '*');
      }

      // Send message to sidebar iframe
      const sidebarIframe = document.querySelector('#sidebar-container iframe');
      if (sidebarIframe && sidebarIframe.contentWindow) {
        sidebarIframe.contentWindow.postMessage(resetData, '*');
      }
      
      // Clear global analysis data
      window.geminiAnalysisData = null;
      
      log('🔄 Meter and sidebar cleared for new person');
    }
    
    // Update UI with current data
    function updateReactApp() {
      const updateData = {
        type: 'PERFORMETER_UPDATE',
        overallScore: window.geminiAnalysisData ? window.geminiAnalysisData.overall_score : 0,
        imageCount: extractedProfileImages.length,
        analysisData: window.geminiAnalysisData,
        isAnalyzing: isAnalyzing
      };

      log(`📊 Updating UI: ${updateData.imageCount} images, score: ${updateData.overallScore}`);

      // Send message to meter iframe
      const meterIframe = document.querySelector('#meter-container iframe');
      if (meterIframe && meterIframe.contentWindow) {
        meterIframe.contentWindow.postMessage(updateData, '*');
        log('📤 Sent update to meter iframe');
      } else {
        log('⚠️ Meter iframe not found or not ready');
      }

      // Send message to sidebar iframe
      const sidebarIframe = document.querySelector('#sidebar-container iframe');
      if (sidebarIframe && sidebarIframe.contentWindow) {
        sidebarIframe.contentWindow.postMessage(updateData, '*');
        log('📤 Sent update to sidebar iframe');
      } else {
        log('⚠️ Sidebar iframe not found or not ready');
      }
    }
    
    // Create tea and labubu rain effect
    function createTeaRain() {
      const rainCount = 40; // Number of items total
      const labubuCount = 15; // Number of labubu images
      
      for (let i = 0; i < rainCount; i++) {
        setTimeout(() => {
          const rainItem = document.createElement('div');
          rainItem.className = 'tea-rain';
          
          // Mix tea emojis and labubu images
          if (i < labubuCount) {
            // Create labubu image
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL('images/labubu.png');
            img.style.width = '30px';
            img.style.height = '30px';
            img.style.objectFit = 'contain';
            rainItem.appendChild(img);
          } else {
            // Create tea emoji
            rainItem.textContent = '🍵';
          }
          
          rainItem.style.left = Math.random() * window.innerWidth + 'px';
          rainItem.style.animationDelay = Math.random() * 2 + 's';
          rainItem.style.animationDuration = (Math.random() * 2 + 2) + 's';
          
          document.body.appendChild(rainItem);
          
          // Remove the element after animation completes
          setTimeout(() => {
            if (rainItem.parentNode) {
              rainItem.parentNode.removeChild(rainItem);
            }
          }, 5000);
        }, i * 100); // Stagger the creation
      }
    }
    
    // Display Gemini analysis in the sidebar
    function displayGeminiAnalysis(analysis) {
      try {
        // Extract JSON from markdown code blocks if present
        let jsonString = analysis;
        const jsonMatch = analysis.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1].trim();
        }
        
        // Parse the JSON response
        const analysisData = JSON.parse(jsonString);
        window.geminiAnalysisData = analysisData;
        
        // Trigger tea rain for high scores (8 or greater)
        if (analysisData.overall_score >= 8) {
          log('🍵 High score detected! Tea rain activated!');
          createTeaRain();
        }
        
        // Update React app with analysis data
        updateReactApp();
        
      } catch (error) {
        console.error('Error parsing Gemini analysis:', error);
        log('❌ Error parsing analysis JSON');
      }
    }
    
    // Detect clicks on the page (indicating carousel navigation)
    function setupClickDetection() {
      document.addEventListener('click', (event) => {
        log(`🖱️ Click detected on: ${event.target.tagName} - ${event.target.className || 'no class'}`);
        
        // Check multiple possible selectors for the Next Photo button
        const nextButtonSelectors = [
          'button[aria-label="Next Photo"]',
          'button[aria-label*="Next"]',
          'button[title*="Next"]',
          '[role="button"][aria-label*="Next"]'
        ];
        
        let nextButton = null;
        for (const selector of nextButtonSelectors) {
          nextButton = document.querySelector(selector);
          if (nextButton) {
            log(`🔍 Next Photo button found with selector: ${selector}`);
            break;
          }
        }
        
        if (nextButton) {
          log(`🎯 Next button aria-label: "${nextButton.getAttribute('aria-label')}"`);
          log(`🎯 Click target: ${event.target.tagName}, Next button contains target: ${nextButton.contains(event.target)}`);
          
          // Check if the clicked element is the button itself or any of its children
          let isClickOnButton = false;
          let currentElement = event.target;
          
          // Walk up the DOM tree to see if we're inside the button
          let depth = 0;
          while (currentElement && currentElement !== document.body && depth < 10) {
            log(`🔍 Walking up DOM: depth ${depth}, element: ${currentElement.tagName}, class: ${currentElement.className || 'no class'}`);
            if (currentElement === nextButton) {
              isClickOnButton = true;
              log(`✅ Found button at depth ${depth}`);
              break;
            }
            currentElement = currentElement.parentElement;
            depth++;
          }
          
          log(`🎯 Is click on button (walking up DOM): ${isClickOnButton}`);
          
          // Also check if the button is near the click coordinates
          const rect = nextButton.getBoundingClientRect();
          const clickX = event.clientX;
          const clickY = event.clientY;
          const isNearButton = clickX >= rect.left && clickX <= rect.right && 
                              clickY >= rect.top && clickY <= rect.bottom;
          
          log(`🎯 Click coordinates: (${clickX}, ${clickY}), Button rect: (${rect.left}, ${rect.top}, ${rect.right}, ${rect.bottom})`);
          log(`🎯 Is click near button: ${isNearButton}`);
          
          // Check if click is on profile photo area (common way to navigate photos)
          const profilePhotoDiv = event.target.closest('div[aria-label*="Profile Photo"]');
          const isClickOnProfilePhoto = profilePhotoDiv && profilePhotoDiv.getAttribute('aria-label') !== 'Profile Photo';
          
          log(`🎯 Is click on profile photo: ${isClickOnProfilePhoto}`);
          if (isClickOnProfilePhoto) {
            log(`🎯 Profile photo aria-label: "${profilePhotoDiv.getAttribute('aria-label')}"`);
          }
          
          if (event.target === nextButton || nextButton.contains(event.target) || isClickOnButton || isNearButton || isClickOnProfilePhoto) {
            log('🖱️ Next Photo action detected - starting immediate image extraction...');
            carouselPosition++;
            isWaitingForNextImage = true;
            
            // Extract active profile photo immediately
            extractActiveProfilePhoto();
            isWaitingForNextImage = false;
          } else {
            log('❌ Click was not on Next Photo button or profile photo');
          }
        } else {
          log('❌ No Next Photo button found with any selector');
        }
      });
    }
    
    async function sendToGemini() {
      if (extractedProfileImages.length === 0) {
        log('❌ No images to send to Gemini');
        return;
      }
      
      if (isAnalyzing) {
        log('⚠️ Analysis already in progress, please wait...');
        return;
      }
      
      isAnalyzing = true;
      updateReactApp(); // Update to show analyzing state
      log('🤖 Sending images to Gemini...');
      
      // Use hardcoded API key
      const apiKey = 'AIzaSyCttLcS-zUTDEPc1fAHsDE7uoJg3YTazoI';
      
      // Load prompt from file
      let geminiPrompt;
      try {
        const response = await fetch(chrome.runtime.getURL('gemini-prompt.txt'));
        geminiPrompt = await response.text();
      } catch (error) {
        geminiPrompt = 'Analyze these Tinder profile photos and provide insights about the person\'s appearance, style, and overall presentation. Be detailed and specific.';
      }
      
      try {
        // Prepare the request
        const imageUrls = extractedProfileImages.map(img => img.url);
        
        // Fetch all images as base64 first
        const imageDataPromises = imageUrls.map(url => fetchImageAsBase64(url));
        const imageDataArray = await Promise.all(imageDataPromises);
        
        const requestBody = {
          contents: [{
            parts: [
              { text: geminiPrompt },
              ...imageDataArray.map(data => ({
                inline_data: {
                  mime_type: "image/jpeg",
                  data: data
                }
              }))
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        };
        
        log('📤 Sending request to Gemini API...');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
          const analysis = result.candidates[0].content.parts[0].text;
          log('✅ Gemini response received');
          console.log('🤖 GEMINI ANALYSIS:', analysis);
          
          // Display analysis in sidebar
          displayGeminiAnalysis(analysis);
        } else {
          log('❌ Unexpected response format from Gemini');
          console.log('Gemini response:', result);
        }
        
      } catch (error) {
        log('❌ Error sending to Gemini: ' + error.message);
        console.error('Gemini error:', error);
      } finally {
        isAnalyzing = false;
        updateReactApp(); // Update to hide analyzing state
      }
    }
    
    async function fetchImageAsBase64(url) {
      try {
        // Send to background script to fetch the image
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'fetchImage',
            url: url
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.base64);
            }
          });
        });
      } catch (error) {
        log('❌ Error fetching image: ' + error.message);
        throw error;
      }
    }
    
    // Manual extraction function
    function lightExtraction() {
      // Extract active profile photo from current position
      extractActiveProfilePhoto();
    }
    
    // Create the sidebar
    createSidebarContainer();
    
    // Set up click detection once
    setupClickDetection();
    
    // Run light extraction
    lightExtraction();
    
    // Run every 10 seconds (less frequent)
    setInterval(lightExtraction, 10000);
    
    // Minimal observer - only watch for major changes
    let changeCount = 0;
    const observer = new MutationObserver(() => {
      changeCount++;
      if (changeCount % 10 === 0) { // Only log every 10th change
        lightExtraction();
      }
    });
    
    // Only observe body, not the entire subtree
    observer.observe(document.body, {
      childList: true,
      subtree: false // Don't watch all children
    });
  }
  
} else {
  console.log('❌ Not on Tinder - extractor not active');
}