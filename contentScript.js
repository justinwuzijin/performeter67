// Tinder Profile Photo Extractor with Gemini Analysis
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
    
    function extractActiveProfilePhoto() {
      const allElements = document.querySelectorAll('*');
      let activeProfilePhoto = null;
      
      allElements.forEach((el) => {
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
            // New person detected - clear all stored images
            log(`🔄 New person detected (${activeProfilePhoto.ariaLabel}) - clearing previous images`);
            extractedProfileImages = [];
          }
          
          extractedProfileImages.push(activeProfilePhoto);
          
          log(`📸 Logged photo at: ${activeProfilePhoto.url}`);
          console.log('🎯 ACTIVE PROFILE PHOTO COLLECTION:', extractedProfileImages);
        }
      }
      
      // Update Gemini button
      updateGeminiButton();
    }
    
    // Detect clicks on the page (indicating carousel navigation)
    function setupClickDetection() {
      document.addEventListener('click', (event) => {
        // Check if click is on or near the Next Photo button
        const nextButton = document.querySelector('button[aria-label="Next Photo"]');
        if (nextButton && (event.target === nextButton || nextButton.contains(event.target))) {
          carouselPosition++;
          isWaitingForNextImage = true;
          
          // Extract active profile photo immediately
          extractActiveProfilePhoto();
          isWaitingForNextImage = false;
        }
      });
    }
    
    function updateGeminiButton() {
      // Remove existing button if it exists
      const existingGeminiBtn = document.getElementById('send-to-gemini');
      if (existingGeminiBtn) existingGeminiBtn.remove();
      
      // Create Gemini button
      const geminiBtn = document.createElement('button');
      geminiBtn.id = 'send-to-gemini';
      geminiBtn.textContent = `🤖 Send ${extractedProfileImages.length} Images to Gemini`;
      geminiBtn.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        padding: 10px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
      `;
      
      geminiBtn.onclick = () => {
        sendToGemini();
      };
      
      document.body.appendChild(geminiBtn);
    }
    
    async function sendToGemini() {
      if (extractedProfileImages.length === 0) {
        log('❌ No images to send to Gemini');
        return;
      }
      
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
        } else {
          log('❌ Unexpected response format from Gemini');
          console.log('Gemini response:', result);
        }
        
      } catch (error) {
        log('❌ Error sending to Gemini: ' + error.message);
        console.error('Gemini error:', error);
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
      // Set up click detection
      setupClickDetection();
      
      // Extract active profile photo from current position
      extractActiveProfilePhoto();
    }
    
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