# AutoClicker Tool

A dual-purpose auto-clicking solution containing a **Chrome Extension** for DOM-based clicking and a **Modern AutoHotkey Script** for human-like desktop clicking.

## 1. Chrome Extension
A simple extension to select elements on a webpage and auto-click them.

### Installation
1.  Open Chrome and go to `chrome://extensions/`.
2.  Enable **Developer mode** (top right).
3.  Click **Load unpacked**.
4.  Select this folder (`AutoClicker-extension`).

### Usage
1.  Click the extension icon.
2.  Click **Pick Element** and select a button/link on the page.
3.  Set the **Count** (0 for infinite) and **Delay** (ms).
4.  Click **Start Clicking**.

---

## 2. Modern AutoHotkey (AHK) Script
A sophisticated desktop auto-clicker designed to mimic human behavior using statistical randomization.

### Features
*   **Gaussian Random Delays**: Uses a Bell Curve distribution for click intervals (more natural than simple random).
*   **Spatial Jitter**: Cursor micro-movements (tremble) while clicking.
*   **Safety**: Minimum delay guards.

### Prerequisites
*   [AutoHotkey v2.0+](https://www.autohotkey.com/)

### Usage
1.  Double-click `modern_autoclicker.ahk` to run.
2.  Press **F8** to Toggle ON/OFF.
3.  **Edit the script** to change settings:
    ```autohotkey
    TargetCPS := 12  ; Clicks Per Second
    ```

### Why use this over the extension?
Use the AHK script when you need to click outside the browser, or when you need to bypass bot detection that analyzes click timing/position exactness.
