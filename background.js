// background.js

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the message is to toggle mute
    if (message.type === 'TOGGLE_MUTE') {
        // Get the tab where the content script sent the message from
        const tabId = sender.tab.id;
        if (tabId) {
            // Use the chrome.tabs.update API to change the muted state
            chrome.tabs.update(tabId, { muted: message.payload.muted });
        }
    }
    // Return true to indicate you wish to send a response asynchronously
    // (although we don't in this case, it's good practice)
    return true;
});

// Optional: Set initial state when a tab is updated or created
// This can help ensure the icon state is correct on page load/reload.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // If the tab is audible, you could potentially send a message
    // to the content script to ensure the icon is visible and in the correct state.
    // This part is more complex as it requires more state management.
    // For this version, we keep it simple and let the user control the initial state.
});
