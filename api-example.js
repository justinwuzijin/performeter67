// API Integration Example for Tinder Profile Data
// This file shows how to integrate the extracted data with your API

// Example API endpoint configuration
const API_CONFIG = {
  baseUrl: 'https://your-api-endpoint.com/api',
  apiKey: 'your-api-key-here',
  endpoint: '/tinder-profiles'
};

// Function to send profile data to your API
async function sendProfilesToApi(profiles) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      source: 'tinder_extension',
      profiles: profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        job: profile.job,
        education: profile.education,
        distance: profile.distance,
        images: profile.images.map(img => ({
          url: img.url,
          alt: img.alt,
          dimensions: {
            width: img.width,
            height: img.height
          }
        })),
        extractedAt: profile.extractedAt,
        pageUrl: profile.pageUrl
      }))
    };

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'X-Source': 'tinder-extension'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Profiles sent successfully:', result);
      return { success: true, data: result };
    } else {
      console.error('API Error:', response.status, response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Network Error:', error);
    return { success: false, error: error.message };
  }
}

// Function to send individual profile
async function sendSingleProfile(profile) {
  return await sendProfilesToApi([profile]);
}

// Function to batch send profiles (useful for large datasets)
async function batchSendProfiles(profiles, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);
    console.log(`Sending batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profiles.length / batchSize)}`);
    
    const result = await sendProfilesToApi(batch);
    results.push(result);
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < profiles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Example usage in the React component:
/*
// In your React component, replace the sendToApi function with:

const sendToApi = async () => {
  const selected = storedProfiles.filter(p => selectedProfiles.has(p.id));
  if (selected.length === 0) {
    alert('Please select profiles to send to API');
    return;
  }

  try {
    setIsLoading(true);
    const result = await sendProfilesToApi(selected);
    
    if (result.success) {
      alert('Data sent to API successfully!');
      // Optionally clear selected profiles after successful send
      setSelectedProfiles(new Set());
    } else {
      alert('Failed to send data to API: ' + result.error);
    }
  } catch (error) {
    alert('Error sending data to API: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};
*/

// Data validation function
function validateProfileData(profile) {
  const errors = [];
  
  if (!profile.id) errors.push('Missing profile ID');
  if (!profile.images || profile.images.length === 0) errors.push('No images found');
  if (!profile.extractedAt) errors.push('Missing extraction timestamp');
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Data transformation function (if you need to modify data before sending)
function transformProfileForApi(profile) {
  return {
    ...profile,
    // Add any transformations here
    processedAt: new Date().toISOString(),
    imageCount: profile.images.length,
    hasBio: !!profile.bio,
    hasJob: !!profile.job,
    hasEducation: !!profile.education
  };
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sendProfilesToApi,
    sendSingleProfile,
    batchSendProfiles,
    validateProfileData,
    transformProfileForApi,
    API_CONFIG
  };
}
