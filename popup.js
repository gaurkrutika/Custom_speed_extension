document.addEventListener("DOMContentLoaded", function() {
    // Initialize UI with current speed value
    chrome.storage.local.get("customSpeed", (data) => {
        if (data.customSpeed) {
            document.getElementById("speedInput").value = data.customSpeed;
        }
    });

    document.getElementById("saveSpeed").addEventListener("click", () => {
        let speedInput = document.getElementById("speedInput").value;
        let speed = parseFloat(speedInput);

        if (isNaN(speed) || speed <= 0) {
            alert("Please enter a valid positive number");
            return;
        }

        // Save the speed to storage first
        chrome.storage.local.set({ customSpeed: speed }, () => {
            // Get the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs.length || !tabs[0].id) {
                    console.error("❌ No active tab found.");
                    return;
                }

                // First try to inject the content script to ensure it's available
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ["content.js"]
                }).then(() => {
                    // Wait a moment for the script to initialize
                    setTimeout(() => {
                        // Now try to send the message
                        chrome.tabs.sendMessage(
                            tabs[0].id, 
                            { action: "applySpeed", speed },
                            (response) => {
                                if (chrome.runtime.lastError) {
                                    console.error("❌ Message error:", chrome.runtime.lastError.message);
                                    // Fall back to using background script
                                    chrome.runtime.sendMessage({ 
                                        action: "applySpeed", 
                                        speed: speed,
                                        tabId: tabs[0].id 
                                    });
                                } else if (response && response.success) {
                                    console.log("✅ Speed updated successfully.");
                                }
                            }
                        );
                    }, 200); // Small delay to ensure script is initialized
                }).catch(err => {
                    console.error("❌ Failed to inject content script:", err);
                    // If we can't inject the script, use the background script as fallback
                    chrome.runtime.sendMessage({ 
                        action: "applySpeed", 
                        speed: speed,
                        tabId: tabs[0].id 
                    });
                });
            });
        });
    });

    // Initialize timeSaved UI on popup load
    chrome.storage.local.get("timeSaved", (data) => {
        let timeSavedElement = document.getElementById("timeSaved");
        if (timeSavedElement && data.timeSaved !== undefined) {
            timeSavedElement.innerText = `Time Saved: ${data.timeSaved.toFixed(2)} mins`;
        }
    });
});

// Update timeSaved UI when storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.timeSaved) {
        let timeSavedElement = document.getElementById("timeSaved");
        if (timeSavedElement) {
            timeSavedElement.innerText = `Time Saved: ${changes.timeSaved.newValue.toFixed(2)} mins`;
        }
    }
});