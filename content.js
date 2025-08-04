// content.js

let muteIcon;
let isMuted = false;
let isDragging = false;
let offsetX, offsetY;

// Function to create and inject the mute icon into the page
function createMuteIcon() {
    muteIcon = document.createElement('div');
    muteIcon.id = 'universal-mute-button-icon';
    
    const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="100%" height="100%">
            <path id="unmuted-path" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            <path id="muted-path" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" style="display: none;"/>
        </svg>
    `;

    muteIcon.innerHTML = iconSvg;
    
    // --- Styling for the icon ---
    muteIcon.style.position = 'fixed';
    muteIcon.style.zIndex = '99999999';
    muteIcon.style.cursor = 'pointer';
    muteIcon.style.borderRadius = '50%';
    muteIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    muteIcon.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    muteIcon.style.transition = 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out';
    muteIcon.style.padding = '8px';

    // Apply stored styles and position
    applyStoredSettings();

    document.body.appendChild(muteIcon);
    
    // --- Event Listeners ---
    muteIcon.addEventListener('click', (e) => {
        if (!isDragging) {
            toggleMute();
        }
    });

    muteIcon.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - muteIcon.getBoundingClientRect().left;
        offsetY = e.clientY - muteIcon.getBoundingClientRect().top;
        muteIcon.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const newRight = window.innerWidth - (e.clientX - offsetX + muteIcon.offsetWidth);
            const newBottom = window.innerHeight - (e.clientY - offsetY + muteIcon.offsetHeight);

            muteIcon.style.right = `${newRight}px`;
            muteIcon.style.bottom = `${newBottom}px`;
            muteIcon.style.left = 'auto';
            muteIcon.style.top = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            muteIcon.style.cursor = 'pointer';
            
            // NEW: Save the final position to storage
            const finalPosition = {
                right: muteIcon.style.right,
                bottom: muteIcon.style.bottom
            };
            chrome.storage.sync.set({ iconPosition: finalPosition });

            setTimeout(() => { isDragging = false; }, 0);
        }
    });
}

// MODIFIED: Renamed function and added position loading
function applyStoredSettings() {
    // Get all settings from storage: size, opacity, and now position
    chrome.storage.sync.get(['iconSize', 'iconOpacity', 'iconPosition'], (result) => {
        if (muteIcon) {
            // Apply size and opacity
            muteIcon.style.width = `${result.iconSize || 50}px`;
            muteIcon.style.height = `${result.iconSize || 50}px`;
            muteIcon.style.opacity = `${result.iconOpacity || 0.8}`;

            // NEW: Apply stored position or use default
            if (result.iconPosition) {
                muteIcon.style.right = result.iconPosition.right;
                muteIcon.style.bottom = result.iconPosition.bottom;
            } else {
                // Default position if none is saved
                muteIcon.style.right = '20px';
                muteIcon.style.bottom = '20px';
            }
        }
    });
}

function toggleMute() {
    isMuted = !isMuted;
    updateIconState(isMuted);
    chrome.runtime.sendMessage({ type: 'TOGGLE_MUTE', payload: { muted: isMuted } });
}

function updateIconState(muted) {
    if (muteIcon) {
        const unmutedPath = muteIcon.querySelector('#unmuted-path');
        const mutedPath = muteIcon.querySelector('#muted-path');
        if (muted) {
            unmutedPath.style.display = 'none';
            mutedPath.style.display = 'block';
            muteIcon.style.backgroundColor = 'rgba(220, 38, 38, 0.7)';
        } else {
            unmutedPath.style.display = 'block';
            mutedPath.style.display = 'none';
            muteIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        }
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_STYLE') {
        if (muteIcon) {
            if (message.payload.size) {
                muteIcon.style.width = `${message.payload.size}px`;
                muteIcon.style.height = `${message.payload.size}px`;
            }
            if (message.payload.opacity) {
                muteIcon.style.opacity = `${message.payload.opacity}`;
            }
        }
    }
});

createMuteIcon();
