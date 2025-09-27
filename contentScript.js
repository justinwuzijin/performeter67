// Safer Tinder scraper - won't break the page
console.log('🚀 Safe Tinder Extractor Started');

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
    }, 2000);
  });
  
  function startExtraction() {
    console.log('🔍 Starting safe extraction...');
    
    // Create minimal sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'safe-extractor';
    sidebar.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: rgba(0,0,0,0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 10px;
      padding: 10px;
      z-index: 9999;
      overflow-y: auto;
      border-radius: 5px;
      border: 1px solid #0f0;
    `;
    
    document.body.appendChild(sidebar);
    
    function log(message) {
      const div = document.createElement('div');
      div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      sidebar.appendChild(div);
      console.log(message);
      sidebar.scrollTop = sidebar.scrollHeight;
    }
    
    log('✅ Safe extractor active');
    
    // Manual Tinder carousel extractor - captures active profile photo on each click
    let extractedProfileImages = [];
    let carouselPosition = 0;
    let isWaitingForNextImage = false;
    
    function extractActiveProfilePhoto() {
      log(`🔍 Looking for active profile photo at carousel position ${carouselPosition}...`);
      
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
          extractedProfileImages.push(activeProfilePhoto);
          
          log(`📸 FOUND active profile photo at position ${carouselPosition}:`);
          log(`  URL: ${activeProfilePhoto.url}`);
          log(`  Aria: "${activeProfilePhoto.ariaLabel}"`);
          log(`  Position: ${carouselPosition}`);
          log(`  Size: ${activeProfilePhoto.dimensions.width}x${activeProfilePhoto.dimensions.height}`);
          
          // Log to console for easy copying
          console.log('🎯 ACTIVE PROFILE PHOTO COLLECTION:', extractedProfileImages);
        } else {
          log(`⚠️ Profile photo at position ${carouselPosition} already stored`);
        }
      } else {
        log(`❌ No active profile photo found at position ${carouselPosition}`);
      }
      
      // Update download button
      updateDownloadButton();
    }
    
    // Detect clicks on the page (indicating carousel navigation)
    function setupClickDetection() {
      document.addEventListener('click', (event) => {
        // Check if click is on or near the Next Photo button
        const nextButton = document.querySelector('button[aria-label="Next Photo"]');
        if (nextButton && (event.target === nextButton || nextButton.contains(event.target))) {
          log('👆 Next Photo button clicked - waiting for new image...');
          carouselPosition++;
          isWaitingForNextImage = true;
          
          // Wait for the carousel to load the new image, then extract active profile photo
          setTimeout(() => {
            extractActiveProfilePhoto();
            isWaitingForNextImage = false;
          }, 1500); // Wait 1.5 seconds for image to load
        }
      });
      
      log('👆 Click detection active - click Next Photo to capture active profile photo');
    }
    
    function updateDownloadButton() {
      // Remove existing buttons if they exist
      const existingDownloadBtn = document.getElementById('download-profile-images');
      const existingGeminiBtn = document.getElementById('send-to-gemini');
      if (existingDownloadBtn) existingDownloadBtn.remove();
      if (existingGeminiBtn) existingGeminiBtn.remove();
      
      // Create download button
      const downloadBtn = document.createElement('button');
      downloadBtn.id = 'download-profile-images';
      downloadBtn.textContent = `📥 Download ${extractedProfileImages.length} Images`;
      downloadBtn.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        padding: 10px;
        background: #0f0;
        color: #000;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        margin-right: 10px;
      `;
      
      downloadBtn.onclick = () => {
        const dataStr = JSON.stringify(extractedProfileImages, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tinder_profile_images_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        log('📥 Profile images downloaded!');
      };
      
      // Create Gemini button
      const geminiBtn = document.createElement('button');
      geminiBtn.id = 'send-to-gemini';
      geminiBtn.textContent = `🤖 Send ${extractedProfileImages.length} Images to Gemini`;
      geminiBtn.style.cssText = `
        position: fixed;
        top: 10px;
        left: 200px;
        z-index: 10000;
        padding: 10px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        margin-right: 10px;
      `;
      
      geminiBtn.onclick = () => {
        sendToGemini();
      };
      
      document.body.appendChild(downloadBtn);
      document.body.appendChild(geminiBtn);
    }
    
    async function sendToGemini() {
      if (extractedProfileImages.length === 0) {
        log('❌ No images to send to Gemini');
        return;
      }
      
      log('🤖 Sending images to Gemini...');
      
      // Use hardcoded API key
      const apiKey = 'AIzaSyCttLcS-zUTDEPc1fAHsDE7uoJg3YTazoI'; // Replace with your actual API key
      log('✅ Using API key');
      
      // Get custom prompt from user
      const customPrompt = prompt('Enter your prompt for Gemini (or press Enter for default):', 
        'Analyze these Tinder profile photos and provide insights about the person\'s appearance, style, and overall presentation. Be detailed and specific.');
      
      if (customPrompt === null) {
        log('❌ Prompt cancelled');
        return;
      }
      
      const geminiPrompt = customPrompt || 'Analyze these Tinder profile photos and provide insights about the person\'s appearance, style, and overall presentation. Be detailed and specific.';
      
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
        
        // Log the full response for debugging
        console.log('🔍 Full Gemini response:', result);
        log('🔍 Full response logged to console');
        
        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
          const analysis = result.candidates[0].content.parts[0].text;
          log('✅ Gemini analysis received:');
          log('📝 ' + analysis);
          
          // Also log to console for easy copying
          console.log('🤖 GEMINI ANALYSIS:', analysis);
        } else {
          log('❌ Unexpected response format from Gemini');
          log('Response structure: ' + JSON.stringify(result, null, 2));
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
      log('🔍 Active Profile Photo extractor active');
      log('🎯 Looking for whatever profile photo is currently active/visible');
      log('👆 Click Next Photo button to capture the active profile photo from each position');
      log('📊 Current stored images: ' + extractedProfileImages.length);
      
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
        log(`🔄 Changes detected: ${changeCount}`);
        setTimeout(lightExtraction, 2000);
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