// Settings page for Performeter extension

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');

    // Load saved API key
    loadApiKey();

    // Save API key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Validate API key format (basic check)
        if (!apiKey.startsWith('AIza')) {
            showStatus('Invalid API key format. Gemini keys start with "AIza"', 'error');
            return;
        }

        // Save to Chrome storage
        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
            if (chrome.runtime.lastError) {
                showStatus('Error saving API key: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus('API key saved successfully!', 'success');
            }
        });
    });

    // Clear API key
    clearBtn.addEventListener('click', () => {
        chrome.storage.sync.remove(['geminiApiKey'], () => {
            if (chrome.runtime.lastError) {
                showStatus('Error clearing API key: ' + chrome.runtime.lastError.message, 'error');
            } else {
                apiKeyInput.value = '';
                showStatus('API key cleared successfully!', 'success');
            }
        });
    });

    // Load API key from storage
    function loadApiKey() {
        chrome.storage.sync.get(['geminiApiKey'], (result) => {
            if (result.geminiApiKey) {
                apiKeyInput.value = result.geminiApiKey;
            }
        });
    }

    // Show status message
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
});
