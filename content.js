if (typeof isPicking === 'undefined') {
    var isPicking = false;
    var selectedElement = null;
    var clickInterval = null;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_PICKING") {
        startPickingMode();
        sendResponse({ status: "Picking started" });
    }
    else if (request.action === "STOP_PICKING") {
        stopPickingMode();
        sendResponse({ status: "Picking stopped" });
    }
    else if (request.action === "START_CLICKING") {
        if (!selectedElement) {
            alert("No element selected!");
            return;
        }
        startClicking(request.count, request.delay);
        sendResponse({ status: "Clicking started" });
    }
    else if (request.action === "STOP_CLICKING") {
        stopClicking();
        sendResponse({ status: "Clicking stopped" });
    }
});

function startPickingMode() {
    isPicking = true;
    document.body.style.cursor = "crosshair";
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, { capture: true });
}

function stopPickingMode() {
    isPicking = false;
    document.body.style.cursor = "default";
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("mouseout", handleMouseOut);
    document.removeEventListener("click", handleClick, { capture: true });

    // Remove hover highlight but keep selection if any
    const highlighted = document.querySelectorAll(".autoclicker-highlight");
    highlighted.forEach(el => el.classList.remove("autoclicker-highlight"));
}

function handleMouseOver(e) {
    if (!isPicking) return;
    e.target.classList.add("autoclicker-highlight");
}

function handleMouseOut(e) {
    if (!isPicking) return;
    e.target.classList.remove("autoclicker-highlight");
}

function handleClick(e) {
    if (!isPicking) return;
    e.preventDefault();
    e.stopPropagation();

    // Clear previous selection
    if (selectedElement) {
        selectedElement.classList.remove("autoclicker-selected");
    }

    // Set new selection
    selectedElement = e.target;
    selectedElement.classList.add("autoclicker-selected");

    // Generate a simple selector for display
    let classNames = "";
    if (typeof selectedElement.className === "string") {
        classNames = selectedElement.className;
    } else if (selectedElement.getAttribute) {
        classNames = selectedElement.getAttribute("class") || "";
    }

    const identifiers = classNames.split(" ").filter(c => c && !c.startsWith("autoclicker")).join(".");

    const identifier = selectedElement.tagName.toLowerCase() +
        (selectedElement.id ? `#${selectedElement.id}` : "") +
        (identifiers ? `.${identifiers}` : "");

    console.log("🎯 AutoClicker Target:", selectedElement);

    // Notify popup
    chrome.runtime.sendMessage({
        action: "ELEMENT_SELECTED",
        selector: identifier
    });

    stopPickingMode();
}

function startClicking(count, delay) {
    if (!selectedElement) return;

    let clicked = 0;
    console.log(`🚀 Starting AutoClicker: ${count} times, ~${delay}ms delay`);

    // Clear any existing timer just in case
    clearTimeout(clickInterval);

    const clickLoop = () => {
        if (count > 0 && clicked >= count) {
            stopClicking();
            chrome.runtime.sendMessage({ action: "CLICKING_FINISHED" });
            return;
        }

        if (!isPicking && !selectedElement.isConnected) {
            // Stop if element is removed from DOM
            console.log("⚠️ Element removed, stopping.");
            stopClicking();
            return;
        }

        selectedElement.click();

        // Visual feedback
        selectedElement.style.opacity = "0.5";
        setTimeout(() => selectedElement.style.opacity = "1", 100);

        clicked++;
        console.log(`Click ${clicked}/${count}`);

        // Calculate random delay: Base Delay +/- 20%
        // Example: 1000ms -> Random between 800ms and 1200ms
        const variance = delay * 0.2;
        const randomDelay = delay + (Math.random() * (variance * 2) - variance);

        clickInterval = setTimeout(clickLoop, randomDelay);
    };

    clickLoop();
}

function stopClicking() {
    if (clickInterval) {
        clearTimeout(clickInterval);
        clickInterval = null;
        console.log("🛑 AutoClicker stopped");
    }
}
