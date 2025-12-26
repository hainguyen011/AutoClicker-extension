document.addEventListener("DOMContentLoaded", () => {
    const pickBtn = document.getElementById("pickBtn");
    const targetDisplay = document.getElementById("targetDisplay");
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const statusDiv = document.getElementById("status");
    const clickCountInput = document.getElementById("clickCount");
    const clickDelayInput = document.getElementById("clickDelay");

    let isRunning = false;
    let targetSelector = null;

    // --- Pick Element ---
    // --- Pick Element ---
    pickBtn.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab?.id) {
                statusDiv.textContent = "Error: No active tab.";
                return;
            }

            // Try sending message first (Content script should be there from manifest)
            chrome.tabs.sendMessage(tab.id, { action: "START_PICKING" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Message failed, trying injection:", chrome.runtime.lastError.message);
                    // Fallback: Inject if content script isn't responsive (e.g. freshly installed extension on existing tab)
                    injectAndStart(tab.id);
                } else {
                    window.close();
                }
            });
        } catch (err) {
            console.error("Pick error", err);
            statusDiv.textContent = "Error starting pick mode";
        }
    });

    function injectAndStart(tabId) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Injection failed:", chrome.runtime.lastError);
                statusDiv.textContent = "Cannot access page (restricted?)";
                return;
            }
            chrome.tabs.sendMessage(tabId, { action: "START_PICKING" });
            window.close();
        });
    }

    // --- Start Clicking ---
    startBtn.addEventListener("click", async () => {
        const count = parseInt(clickCountInput.value) || 0;
        const delay = parseInt(clickDelayInput.value) || 1000;

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.tabs.sendMessage(tab.id, {
            action: "START_CLICKING",
            count: count,
            delay: delay
        });

        isRunning = true;
        updateUI();
        statusDiv.textContent = "Running...";
    });

    // --- Stop Clicking ---
    stopBtn.addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.tabs.sendMessage(tab.id, { action: "STOP_CLICKING" });

        isRunning = false;
        updateUI();
        statusDiv.textContent = "Stopped.";
    });

    // --- Listen to messages from Content Script ---
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === "ELEMENT_SELECTED") {
            // Save selection to storage
            chrome.storage.local.set({ targetSelector: msg.selector }, () => {
                targetSelector = msg.selector;
                updateUI();
            });
        }

        if (msg.action === "CLICKING_FINISHED") {
            isRunning = false;
            statusDiv.textContent = "Finished.";
            updateUI();
        }
    });

    // --- Init/Restore State ---
    chrome.storage.local.get(["targetSelector"], (data) => {
        if (data.targetSelector) {
            targetSelector = data.targetSelector;
            updateUI();
        }
    });

    function updateUI() {
        if (targetSelector) {
            targetDisplay.textContent = `Selected: ${targetSelector}`;
            targetDisplay.style.color = "#10b981";
            startBtn.disabled = isRunning;
            stopBtn.disabled = !isRunning;
        } else {
            targetDisplay.textContent = "No element selected";
            targetDisplay.style.color = "#6b7280";
            startBtn.disabled = true;
            stopBtn.disabled = true;
        }
    }
});
