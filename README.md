<p align="center">
  <img src="./public/images/icon-128.png" alt="AutoGem Icon" width="128" height="128">
</p>

# ✨ AutoGem Chrome Extension

🤖 Turn your AI chat experience into a magical journey! AutoGem is like having a smart co-pilot that reads your mind and suggests exactly what you want to ask next. It's Google's "I'm Feeling Lucky" button, but for your AI conversations!

## 🌟 What's Cool About It?

- 🧠 Reads your mind (well, your conversation context)
- 💡 Suggests questions before you even think of them
- 🚀 Auto-pilot mode when it's super confident
- 🌙 Dark mode for night owls
- 🏃‍♂️ Lightning fast - runs right in your browser!

## 🛠️ Before You Start

- Chrome Canary (required for AI features)
- Chrome AI flags enabled:
  ```
  chrome://flags/#prompt-api-for-gemini-nano
  chrome://flags/#optimization-guide-on-device-model
  ```
- Get your trial code from [here](https://developer.chrome.com/origintrials/#/view_trial/320318523496726529) and update manifest.json file.

## 🚀 Quick Start

1. 📥 Grab the code
```bash
git clone https://github.com/autogem/autogem.git
```

2. 📦 Install dependencies
```bash
npm install
```

3. 🛠️ Build extension
```bash
npm run build
```

4. 🔧 Load extension:
   - Open Chrome Canary
   - Navigate to chrome://extensions
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `dist` folder
   - Don't forget to enable the required Chrome flags.

## 🎯 How to Use It

1. 🎹 Hit Cmd/Ctrl + Shift + U to summon AutoGem
2. 👀 Watch as magical suggestions appear
3. 🖱️ Click any suggestion to beam it into chat
4. 🤖 Let auto-mode take the wheel when it's feeling confident
5. ⏹️ Hit the brakes anytime with the stop button

## 👩‍💻 Development Zone

### 🛠️ Tech Arsenal
- ⚛️ React 18
- 📘 TypeScript
- 🧩 Chrome Extension APIs
- 🤖 Chrome AI APIs (Gemini)
- 💅 Tailwind CSS

### 📁 Where Everything Lives
```
autogem-extension/
├── src/
│   ├── background/    # Service workers & AI logic
│   ├── content/       # Main UI components
│   ├── popup/         # Extension popup
│   └── tailwind.css   # Global styles
```

### 🧱 Build Commands
```bash
npm run dev
```

## 🤝 Join the Fun!
Want to make AutoGem even more awesome?

- 🍴 Fork our project
- 🌱 Grow your cool feature
- 💫 Commit your magic
- 🎁 Share with the community


### 🛡️Security First!
We take your privacy seriously:

  - 🏠 Everything stays on your machine
  - 🚫 No data leaves your browser
  - 🔒 Protected by Chrome's built-in superpowers
