// popup.js

// Get references to the UI elements
const sizeSlider = document.getElementById('size-slider');
const sizeValue = document.getElementById('size-value');
const opacitySlider = document.getElementById('opacity-slider');
const opacityValue = document.getElementById('opacity-value');

// Function to update the display values
function updateDisplayValues(size, opacity) {
    sizeValue.textContent = `${size}px`;
    opacityValue.textContent = `${Math.round(opacity * 100)}%`;
}

// Load saved settings from chrome.storage and initialize the sliders
chrome.storage.sync.get(['iconSize', 'iconOpacity'], (result) => {
    const size = result.iconSize || 50;
    const opacity = result.iconOpacity || 0.8;

    sizeSlider.value = size;
    opacitySlider.value = opacity;
    
    updateDisplayValues(size, opacity);
});

// Add event listener for the size slider
sizeSlider.addEventListener('input', (event) => {
    const newSize = parseInt(event.target.value, 10);
    // Save the new size to storage
    chrome.storage.sync.set({ iconSize: newSize });
    updateDisplayValues(newSize, opacitySlider.value);
    // Send a message to the active content script to update the icon's style
    sendMessageToContentScript({ size: newSize });
});

// Add event listener for the opacity slider
opacitySlider.addEventListener('input', (event) => {
    const newOpacity = parseFloat(event.target.value);
    // Save the new opacity to storage
    chrome.storage.sync.set({ iconOpacity: newOpacity });
    updateDisplayValues(sizeSlider.value, newOpacity);
    // Send a message to the active content script to update the icon's style
    sendMessageToContentScript({ opacity: newOpacity });
});

// Helper function to send messages to the content script of the active tab
function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'UPDATE_STYLE',
                payload: message
            });
        }
    });
}
