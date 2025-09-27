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
      const existingMeter = document.getElementById('performeter-meter');
      if (existingSidebar) existingSidebar.remove();
      if (existingMeter) existingMeter.remove();
      
      // Create main container for both elements
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
      
      // Create React app container
      const reactContainer = document.createElement('div');
      reactContainer.id = 'react-sidebar-root';
      reactContainer.style.cssText = `
        width: 100%;
        height: 100%;
        pointer-events: none;
      `;
      mainContainer.appendChild(reactContainer);
      
      // Add Gemini button
      const geminiButton = document.createElement('button');
      geminiButton.id = 'gemini-analyze-btn';
      geminiButton.textContent = 'run dat';
      geminiButton.style.cssText = `
        position: fixed;
        bottom: 150px;
        left: 60%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        z-index: 10001;
        pointer-events: auto;
      `;
      mainContainer.appendChild(geminiButton);
      
      // Add loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'loading-indicator';
      loadingIndicator.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 60%;
        transform: translateX(-50%);
        color: #4CAF50;
        font-size: 18px;
        font-weight: bold;
        z-index: 10001;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      loadingIndicator.innerHTML = '⏳ analyzing...';
      mainContainer.appendChild(loadingIndicator);
      
      document.body.appendChild(mainContainer);
      
      // Load React app
      loadReactApp();
      
      return mainContainer;
    }
    
    // Create the meter and sidebar elements directly
    function loadReactApp() {
      const reactContainer = document.getElementById('react-sidebar-root');
      if (!reactContainer) return;
      
      // Create meter element (left side)
      const meterElement = document.createElement('div');
      meterElement.className = 'meter-sidebar';
      meterElement.innerHTML = `
        <div class="progress-bar">
          <div class="progress-fill" style="height: 0%"></div>
          <div class="progress-icon">🍵</div>
        </div>
      `;
      
      // Create sidebar panel element (right side)
      const sidebarElement = document.createElement('div');
      sidebarElement.className = 'sidebar-panel';
      sidebarElement.innerHTML = `
        <div class="performeter-header">
          <h2 class="performeter-title">performeter</h2>
          <img src="${chrome.runtime.getURL('images/performeter.png')}" alt="Performeter Logo" class="performeter-icon">
        </div>
        <div class="overall-score">0</div>
        <div class="image-counter">
          <span>0 photos captured</span>
        </div>
        <div class="category-breakdown">
          <h3>category breakdown</h3>
          <div class="category-buttons">
            <button class="category-button active" data-category="trendy">Trendy</button>
            <button class="category-button" data-category="personality">Personality</button>
            <button class="category-button" data-category="aesthetic">Aesthetic</button>
          </div>
        </div>
        <div class="category-details">
          <h4>Click "Analyze Profile" to get started</h4>
          <ul>
            <li>No analysis available yet</li>
          </ul>
        </div>
      `;
      
      // Add CSS
      const style = document.createElement('style');
      style.textContent = `
        .meter-sidebar {
          position: fixed;
          left: 400px;
          top: 50%;
          transform: translateY(-50%);
          width: 60px;
          height: 400px;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 8px;
          border-radius: 0 30px 30px 0;
          box-shadow: 2px 0 15px rgba(0,0,0,0.2);
          pointer-events: auto;
          z-index: 10000;
        }
        
        .progress-bar {
          width: 40px;
          height: 320px;
          background: white;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          border: 2px solid #e0e0e0;
          margin-top: 20px;
        }
        
        .progress-fill {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: #4CAF50;
          border-radius: 20px 20px 18px 18px;
          transition: height 0.3s ease;
        }
        
        .progress-icon {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 18px;
          line-height: 1;
        }
        
        .sidebar-panel {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 350px;
          height: 600px;
          background: #4CAF50;
          padding: 20px;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 30px 0 0 30px;
          overflow-y: auto;
          pointer-events: auto;
          z-index: 10000;
          font-family: 'Comic Sans MS', cursive;
        }
        
        .performeter-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
        }
        
        .performeter-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: white;
        }
        
        .performeter-icon {
          width: 20px;
          height: 20px;
        }
        
        .overall-score {
          font-size: 48px;
          font-weight: bold;
          margin: 20px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-counter {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 15px;
          font-size: 12px;
          margin: 10px 0;
          text-align: center;
          color: white;
        }
        
        .category-breakdown {
          margin-top: 15px;
          width: 100%;
        }
        
        .category-breakdown h3 {
          font-size: 12px;
          margin-bottom: 12px;
          text-align: center;
          color: white;
        }
        
        .category-buttons {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .category-button {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 12px;
          font-family: 'Comic Sans MS', cursive;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          width: 100%;
        }
        
        .category-button:hover {
          background: #1B5E20;
          transform: translateY(-1px);
        }
        
        .category-button.active {
          background: #FFD700;
          color: #2E7D32;
          font-weight: bold;
        }
        
        .category-details {
          margin-top: 15px;
          padding: 15px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          min-height: 120px;
          width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .category-details h4 {
          font-size: 16px;
          margin-bottom: 10px;
          color: white;
          line-height: 1.3;
        }
        
        .category-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .category-details li {
          font-size: 13px;
          margin-bottom: 8px;
          padding-left: 12px;
          position: relative;
          color: white;
          line-height: 1.4;
          word-wrap: break-word;
        }
        
        .category-details li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #FFD700;
          font-weight: bold;
        }
        
        .gemini-analysis {
          background: rgba(0, 0, 0, 0.3);
          padding: 12px;
          border-radius: 8px;
          margin: 10px 0;
          width: 100%;
          max-height: 120px;
          overflow-y: auto;
        }
        
        .gemini-analysis h4 {
          font-size: 12px;
          margin-bottom: 8px;
          color: #FFD700;
        }
        
        .analysis-content {
          font-size: 10px;
          line-height: 1.3;
          color: white;
          white-space: pre-wrap;
        }
        
        /* Tea emoji rain animation */
        .tea-rain {
          position: fixed;
          top: -50px;
          font-size: 24px;
          pointer-events: none;
          z-index: 10001;
          animation: teaFall 3s linear infinite;
        }
        
        @keyframes teaFall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      
      reactContainer.appendChild(style);
      reactContainer.appendChild(meterElement);
      reactContainer.appendChild(sidebarElement);
      
      // Add category button click handlers
      setupCategoryButtons();
    }
    
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
    
    // Setup category button click handlers
    function setupCategoryButtons() {
      const categoryButtons = document.querySelectorAll('.category-button');
      categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons
          categoryButtons.forEach(btn => btn.classList.remove('active'));
          // Add active class to clicked button
          button.classList.add('active');
          
          // Update category details if we have analysis data
          if (window.geminiAnalysisData) {
            updateCategoryDetails(button.dataset.category);
          }
        });
      });
    }
    
    // Update category details based on selected category
    function updateCategoryDetails(category) {
      if (!window.geminiAnalysisData || !window.geminiAnalysisData.categories) return;
      
      const categoryData = window.geminiAnalysisData.categories[category];
      if (!categoryData) return;
      
      const categoryDetails = document.querySelector('.category-details');
      if (categoryDetails) {
        categoryDetails.innerHTML = `
          <h4>${categoryData.explanation}</h4>
          <ul>
            <li>Score: ${categoryData.score}/10</li>
          </ul>
        `;
      }
    }
    
    // Clear meter and sidebar for new person
    function clearMeterAndSidebar() {
      // Reset overall score
      const overallScore = document.querySelector('.overall-score');
      if (overallScore) {
        overallScore.textContent = '0';
      }
      
      // Reset meter progress bar
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.height = '0%';
      }
      
      // Clear category details
      const categoryDetails = document.querySelector('.category-details');
      if (categoryDetails) {
        categoryDetails.innerHTML = `
          <h4>Click "Analyze Profile" to get started</h4>
          <ul>
            <li>No analysis available yet</li>
          </ul>
        `;
      }
      
      // Remove existing analysis
      const existingAnalysis = document.querySelector('.gemini-analysis');
      if (existingAnalysis) {
        existingAnalysis.remove();
      }
      
      // Reset category buttons
      const categoryButtons = document.querySelectorAll('.category-button');
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      if (categoryButtons[0]) {
        categoryButtons[0].classList.add('active');
      }
      
      // Clear global analysis data
      window.geminiAnalysisData = null;
      
      log('🔄 Meter and sidebar cleared for new person');
    }
    
    // Update UI with current data
    function updateReactApp() {
      // Update image counter
      const imageCounter = document.querySelector('.image-counter span');
      if (imageCounter) {
        imageCounter.textContent = `${extractedProfileImages.length} photos captured`;
      }
      
      // Don't update score until we have analysis
      if (!window.geminiAnalysisData) {
        const overallScore = document.querySelector('.overall-score');
        if (overallScore) {
          overallScore.textContent = '0';
        }
      }
    }
    
    // Show loading indicator
    function showLoading() {
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.opacity = '1';
      }
    }
    
    // Hide loading indicator
    function hideLoading() {
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.opacity = '0';
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
        
        // Update overall score (scale 1-10)
        const overallScore = document.querySelector('.overall-score');
        if (overallScore && analysisData.overall_score) {
          overallScore.textContent = analysisData.overall_score;
        }
        
        // Update meter progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill && analysisData.overall_score) {
          const percentage = (analysisData.overall_score / 10) * 100;
          progressFill.style.height = `${percentage}%`;
        }
        
        // Trigger tea rain for high scores (8 or greater)
        if (analysisData.overall_score >= 8) {
          log('🍵 High score detected! Tea rain activated!');
          createTeaRain();
        }
        
        // Update category details for the active category
        const activeButton = document.querySelector('.category-button.active');
        if (activeButton) {
          updateCategoryDetails(activeButton.dataset.category);
        }
        
        // Remove existing analysis if any
        const existingAnalysis = document.querySelector('.gemini-analysis');
        if (existingAnalysis) {
          existingAnalysis.remove();
        }
        
        // Create analysis element with overall_note
        if (analysisData.overall_note) {
          const analysisElement = document.createElement('div');
          analysisElement.className = 'gemini-analysis';
          analysisElement.innerHTML = `
            <h4>Overall Note:</h4>
            <div class="analysis-content">${analysisData.overall_note}</div>
          `;
          
          // Add to sidebar panel
          const sidebarPanel = document.querySelector('.sidebar-panel');
          if (sidebarPanel) {
            // Insert after image counter
            const imageCounter = sidebarPanel.querySelector('.image-counter');
            if (imageCounter) {
              imageCounter.insertAdjacentElement('afterend', analysisElement);
            } else {
              sidebarPanel.appendChild(analysisElement);
            }
          }
        }
        
      } catch (error) {
        console.error('Error parsing Gemini analysis:', error);
        log('❌ Error parsing analysis JSON');
      }
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
      
      // Listen for Gemini button clicks
      document.addEventListener('click', (event) => {
        if (event.target.id === 'gemini-analyze-btn') {
          sendToGemini();
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
      showLoading();
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
        hideLoading();
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
    
    // Create the sidebar
    createSidebarContainer();
    
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