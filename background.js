chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ customSpeed: 1.0, timeSaved: 0 });
    console.log("Video Speed Controller Installed");
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "applySpeed") {
        const tabId = message.tabId;
        const speed = message.speed;
        
        if (!tabId) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0 || !tabs[0].id) {
                    console.error("No active tab found");
                    sendResponse({ success: false, error: "No active tab found" });
                    return;
                }
                applySpeedToTab(tabs[0].id, speed, sendResponse);
            });
        } else {
            applySpeedToTab(tabId, speed, sendResponse);
        }
        
        return true; // Keep the message channel open for sendResponse
    }
});

// Function to apply speed to a specific tab
function applySpeedToTab(tabId, speed, sendResponse) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (speedValue) => {
            // Apply speed to all videos on the page
            const videos = document.querySelectorAll("video");
            videos.forEach(video => video.playbackRate = speedValue);
            
            // Create or update the speed indicator UI
            let speedUI = document.getElementById("speedUI");
            if (!speedUI) {
                speedUI = document.createElement("div");
                speedUI.id = "speedUI";
                speedUI.style.cssText = `position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 8px; border-radius: 5px; cursor: pointer; z-index: 9999; font-size: 16px;`;
                document.body.appendChild(speedUI);
            }
            speedUI.innerText = `🎥 Speed: ${speedValue.toFixed(1)}x`;
            
            return videos.length; // Return the number of videos affected
        },
        args: [speed]
    })
    .then(results => {
        if (results && results[0]) {
            console.log(`Speed applied to ${results[0].result} videos`);
            if (sendResponse) {
                sendResponse({ success: true, count: results[0].result });
            }
        }
    })
    .catch(err => {
        console.error("Failed to execute script:", err);
        if (sendResponse) {
            sendResponse({ success: false, error: err.message });
        }
    });
}

// Handle commands (keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
    chrome.storage.local.get("customSpeed", (data) => {
        let currentSpeed = data.customSpeed || 1.0;
        let newSpeed = currentSpeed;
        
        if (command === "increase_speed") {
            newSpeed = Math.min(Math.round((currentSpeed + 0.1) * 10) / 10, 10.0);
        } else if (command === "decrease_speed") {
            newSpeed = Math.max(Math.round((currentSpeed - 0.1) * 10) / 10, 0.1);
        }
        
        if (newSpeed !== currentSpeed) {
            chrome.storage.local.set({ customSpeed: newSpeed });
            
            // Apply to active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0 && tabs[0].id) {
                    applySpeedToTab(tabs[0].id, newSpeed);
                }
            });
        }
    });
});