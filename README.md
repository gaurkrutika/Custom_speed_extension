# 🎥 Video Speed Controller Chrome Extension

Easily control the playback speed of videos on **any website** using keyboard shortcuts, a floating UI, or from the extension popup.

---

## 🚀 Features

- ⏩ Change video playback speed from **0.1x to 10x**
- 🔼 Keyboard shortcuts: `Ctrl + Shift + ↑` to increase, `↓` to decrease
- 🎛️ Set speed from popup window
- 🧠 Remembers your last used speed
- 📦 Works on platforms like YouTube, Coursera, Google Drive, ZEE5, etc.


---

## 📦 How to Use

### 1. Download this Repository

- Click the green **Code** button
- Choose **Download ZIP**
- Extract the folder

### 2. Load into Chrome

- Go to `chrome://extensions/`
- Enable **Developer Mode** (top-right)
- Click **Load unpacked**
- Select the folder where you extracted this extension

---

## 🧩 Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome Extension config |
| `content.js` | Injected into pages to modify video speed |
| `background.js` | Handles keyboard shortcuts |
| `popup.html / popup.js` | UI to set speed manually |
| `styles.css` | Styles for popup |
| `icon1.png` | Icon for your extension |

---

## 🔒 Privacy Policy

This Chrome extension **does not collect, store, transmit, or share any personal user data**.

All functionality runs **locally in the user's browser** and is only used to modify the playback speed of HTML5 video elements on webpages.

---

### 📊 Data Usage

The extension uses the **Chrome Storage API (`chrome.storage.local`)** only to store the user's preferred playback speed so it can remember the setting between sessions.

The stored data may include:

- Selected video playback speed
- Extension configuration settings

This data:

- is stored **locally on the user's device**
- is **never transmitted to any external servers**
- is **never shared with third parties**

---

### 🔑 Permissions Used

| Permission | Purpose |
|------------|---------|
| `storage` | Save the user's preferred playback speed |
| `activeTab` | Apply playback speed changes to the active tab |
| `scripting` | Execute scripts that modify video playback |

These permissions are used **only for the core functionality of the extension**.

---

### 🌐 Third-Party Services

This extension **does not use any third-party analytics, tracking tools, or external APIs**.

---

### 🔄 Changes to This Policy

If the extension functionality changes in the future, this privacy policy will be updated accordingly.

---


## ✨ Author

Made by [Krutika Gaur](https://github.com/gaurkrutika)

