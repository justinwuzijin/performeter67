import React, { useState, useEffect } from 'react'
import './styles.css'

function App() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [storedProfiles, setStoredProfiles] = useState([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState(new Set());

  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (event) => {
      if (event.data.type === 'PROFILE_DATA') {
        setCurrentProfile(event.data.data.currentProfile);
        setStoredProfiles(event.data.data.storedProfiles);
        setTotalProfiles(event.data.data.totalProfiles);
        setIsExtracting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request current data
    setIsExtracting(true);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const extractData = () => {
    setIsExtracting(true);
    // Send message to parent window to trigger extraction
    window.parent.postMessage({ type: 'EXTRACT_DATA' }, '*');
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all stored profiles?')) {
      localStorage.removeItem('tinder_profiles');
      setStoredProfiles([]);
      setTotalProfiles(0);
      setCurrentProfile(null);
      setSelectedProfiles(new Set());
    }
  };

  const toggleProfileSelection = (profileId) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(profileId)) {
      newSelected.delete(profileId);
    } else {
      newSelected.add(profileId);
    }
    setSelectedProfiles(newSelected);
  };

  const selectAllProfiles = () => {
    const allIds = storedProfiles.map(p => p.id);
    setSelectedProfiles(new Set(allIds));
  };

  const deselectAllProfiles = () => {
    setSelectedProfiles(new Set());
  };

  const exportSelectedProfiles = () => {
    const selected = storedProfiles.filter(p => selectedProfiles.has(p.id));
    if (selected.length === 0) {
      alert('Please select profiles to export');
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalProfiles: selected.length,
      profiles: selected
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tinder_profiles_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const selected = storedProfiles.filter(p => selectedProfiles.has(p.id));
    if (selected.length === 0) {
      alert('Please select profiles to copy');
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalProfiles: selected.length,
      profiles: selected
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => alert('Data copied to clipboard!'))
      .catch(() => alert('Failed to copy to clipboard'));
  };

  const getApiPayload = () => {
    const selected = storedProfiles.filter(p => selectedProfiles.has(p.id));
    if (selected.length === 0) {
      alert('Please select profiles to generate API payload');
      return;
    }

    return {
      timestamp: new Date().toISOString(),
      source: 'tinder_extension',
      profiles: selected.map(profile => ({
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
  };

  const sendToApi = async () => {
    const payload = getApiPayload();
    if (!payload) return;

    // This is where you'd send to your API
    console.log('API Payload:', payload);
    alert('API payload generated! Check console for details. Replace this with your actual API call.');
    
    // Example API call (uncomment and modify):
    /*
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert('Data sent to API successfully!');
      } else {
        alert('Failed to send data to API');
      }
    } catch (error) {
      alert('Error sending data to API: ' + error.message);
    }
    */
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Performative Meter</h1>
        <p className="subtitle">Tinder Carousel Extractor!!</p>
      </header>
      
      <main className="app-main">
        <div className="extraction-controls">
          <button 
            onClick={extractData}
            disabled={isExtracting}
            className="extract-button"
          >
            {isExtracting ? 'Extracting...' : 'Extract Carousel Data'}
          </button>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">{totalProfiles}</span>
            <span className="stat-label">Total Profiles</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{selectedProfiles.size}</span>
            <span className="stat-label">Selected</span>
          </div>
        </div>

        {currentProfile && (
          <div className="current-profile">
            <h3>Current Profile</h3>
            <div className="profile-preview">
              {currentProfile.images.length > 0 && (
                <div className="current-images">
                  {currentProfile.images.slice(0, 3).map((img, index) => (
                    <img key={index} src={img.url} alt={img.alt} />
                  ))}
                  {currentProfile.images.length > 3 && (
                    <div className="more-images">+{currentProfile.images.length - 3}</div>
                  )}
                </div>
              )}
              <div className="profile-info">
                <p><strong>{currentProfile.name || 'Unknown'}</strong> {currentProfile.age && `, ${currentProfile.age}`}</p>
                {currentProfile.distance && <p>{currentProfile.distance}</p>}
                {currentProfile.bio && <p className="bio-preview">{currentProfile.bio.substring(0, 100)}...</p>}
              </div>
            </div>
          </div>
        )}

        {storedProfiles.length > 0 && (
          <div className="stored-profiles">
            <div className="profiles-header">
              <h3>Stored Profiles ({storedProfiles.length})</h3>
              <div className="profile-actions">
                <button onClick={selectAllProfiles} className="action-button">Select All</button>
                <button onClick={deselectAllProfiles} className="action-button">Deselect All</button>
              </div>
            </div>

            <div className="profiles-list">
              {storedProfiles.map((profile, index) => (
                <div 
                  key={profile.id} 
                  className={`profile-item ${selectedProfiles.has(profile.id) ? 'selected' : ''}`}
                  onClick={() => toggleProfileSelection(profile.id)}
                >
                  <div className="profile-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedProfiles.has(profile.id)}
                      onChange={() => toggleProfileSelection(profile.id)}
                    />
                  </div>
                  <div className="profile-content">
                    {profile.images.length > 0 && (
                      <img src={profile.images[0].url} alt={profile.images[0].alt} className="profile-thumb" />
                    )}
                    <div className="profile-details">
                      <p><strong>{profile.name || 'Unknown'}</strong> {profile.age && `, ${profile.age}`}</p>
                      <p className="profile-meta">
                        {profile.images.length} images • {new Date(profile.extractedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProfiles.size > 0 && (
          <div className="export-section">
            <h3>Export Selected ({selectedProfiles.size})</h3>
            <div className="export-buttons">
              <button onClick={exportSelectedProfiles} className="export-button">
                Download JSON
              </button>
              <button onClick={copyToClipboard} className="export-button">
                Copy to Clipboard
              </button>
              <button onClick={sendToApi} className="export-button api-button">
                Send to API
              </button>
            </div>
          </div>
        )}

        <div className="data-actions">
          <button onClick={clearAllData} className="clear-button">
            Clear All Data
          </button>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  )
}

export default App