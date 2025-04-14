

if (!window.__videoSpeedScriptInjected) {
    window.__videoSpeedScriptInjected = true;

    let extensionContextValid = true;
    let checkInterval = null;

    function safeExtensionCall(callback) {
        if (!extensionContextValid) return;
        try {
            return callback();
        } catch (error) {
            if (error.message.includes("Extension context invalidated")) {
                console.log("Extension context is no longer valid.");
                extensionContextValid = false;
            } else {
                console.error("Extension error:", error);
            }
            return null;
        }
    }

    function findVideosInDocument(doc = document) {
        let videos = Array.from(doc.querySelectorAll("video"));

        document.querySelectorAll("*").forEach(el => {
            if (el.shadowRoot) {
                videos.push(...el.shadowRoot.querySelectorAll("video"));
            }
        });

        return videos;
    }

    function applySpeed(speed) {
        const videos = findVideosInDocument();

        // DRM/custom platforms where speed control doesn't work
        const unsupportedPlatforms = [
            "hotstar.com",
            "netflix.com",
            "primevideo.com",
            "sonyliv.com",
            "disneyplus.com",
            "jio.com",
            "zee5.com"
        ];

        const host = location.hostname;

        if (unsupportedPlatforms.some(site => host.includes(site))) {
            showUnsupportedUI();
            return;
        }

        if (videos.length === 0) {
            console.info("No videos detected on this page.");
            return;
        }

        videos.forEach(video => {
            try {
                video.playbackRate = speed;
            } catch (e) {
                console.warn("⚠️ Couldn't apply speed to a video element:", e);
            }
        });

        console.log(`✅ Speed applied: ${speed}x`);
        updateSpeedUI(speed);
    }

    function updateSpeedUI(speed) {
        let speedUI = document.getElementById("speedUI");
        if (!speedUI) {
            speedUI = document.createElement("div");
            speedUI.id = "speedUI";
            speedUI.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 8px;
                border-radius: 5px;
                cursor: pointer;
                z-index: 9999;
                font-size: 16px;
            `;
            document.body.appendChild(speedUI);
        }
        speedUI.innerText = `🎥 Speed: ${speed.toFixed(1)}x`;
    }

    function showUnsupportedUI() {
        let speedUI = document.getElementById("speedUI");
        if (!speedUI) {
            speedUI = document.createElement("div");
            speedUI.id = "speedUI";
            speedUI.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 8px;
                border-radius: 5px;
                z-index: 9999;
                font-size: 14px;
            `;
            document.body.appendChild(speedUI);
        }
        speedUI.innerText = "⚠️ Speed control not supported on this platform.";
    }

    function checkAndApplySpeed() {
        const videos = findVideosInDocument();
        if (videos.length > 0) {
            safeExtensionCall(() => {
                chrome.storage.local.get(["customSpeed"], (data) => {
                    if (data.customSpeed) {
                        window.__lastKnownSpeed = data.customSpeed;
                        applySpeed(data.customSpeed);
                    }
                });
            });
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = null;
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        checkAndApplySpeed();
        checkInterval = setInterval(() => {
            checkAndApplySpeed();
        }, 2000);
    });

    safeExtensionCall(() => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "applySpeed") {
                window.__lastKnownSpeed = message.speed;
                applySpeed(message.speed);
                sendResponse({ success: true });
            }
            return true;
        });
    });

    const observer = new MutationObserver(() => {
        checkAndApplySpeed();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.shiftKey && event.key === "ArrowUp") {
            let currentSpeed = window.__lastKnownSpeed || 1.0;
            let newSpeed = Math.min(Math.round((currentSpeed + 0.1) * 10) / 10, 10.0);
            window.__lastKnownSpeed = newSpeed;
            safeExtensionCall(() => {
                chrome.storage.local.set({ customSpeed: newSpeed });
            });
            applySpeed(newSpeed);
        }

        if (event.ctrlKey && event.shiftKey && event.key === "ArrowDown") {
            let currentSpeed = window.__lastKnownSpeed || 1.0;
            let newSpeed = Math.max(Math.round((currentSpeed - 0.1) * 10) / 10, 0.1);
            window.__lastKnownSpeed = newSpeed;
            safeExtensionCall(() => {
                chrome.storage.local.set({ customSpeed: newSpeed });
            });
            applySpeed(newSpeed);
        }
    });
}
