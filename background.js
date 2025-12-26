// Minimal background script
console.log("AutoClicker background service loaded");

chrome.runtime.onInstalled.addListener(() => {
    console.log("AutoClicker Extension Installed");
});

// Listen for selection from content script (since popup might be closed)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "ELEMENT_SELECTED") {
        console.log("Background received selection:", msg.selector);
        chrome.storage.local.set({ targetSelector: msg.selector });
    }
});
