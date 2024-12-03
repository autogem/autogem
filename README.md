# AutoGem Chrome Extension

AutoGem enhances your AI conversations with predictive suggestions and auto-mode capabilities, similar to Google's "I'm Feeling Lucky" but for chat interactions.

## Features

- Real-time conversation analysis
- Context-aware question suggestions
- Automatic mode with confidence scoring
- Dark mode support
- Local processing using Chrome's Built-in AI

## Requirements

- Chrome Canary (required for AI features)
- Chrome AI flags enabled:
  ```
  chrome://flags/#prompt-api-for-gemini-nano
  chrome://flags/#optimization-guide-on-device-model
  ```

## Installation

1. Clone repository
```bash
git clone https://github.com/autogem/autogem.git
```

2. Install dependencies
```bash
npm install
```

3. Build extension
```bash
npm run build
```

4. Load extension:
   - Open Chrome Canary
   - Navigate to chrome://extensions
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `dist` folder
   - Don't forget to enable the required Chrome flags.

## Usage

1. Use Cmd/Ctrl + Shift + U to toggle interface
2. View suggestions based on conversation context
3. Click suggestions to insert into chat
4. Auto-mode activates when confidence reaches threshold
5. Stop auto-mode anytime with button

## Development

### Tech Stack
- React 18
- TypeScript
- Chrome Extension APIs
- Chrome AI APIs (Gemini)
- Tailwind CSS

### Project Structure
```
autogem-extension/
├── src/
│   ├── background/    # Service workers & AI logic
│   ├── content/       # Main UI components
│   ├── popup/         # Extension popup
│   └── tailwind.css   # Global styles
```

### Build Commands
```bash
npm run dev     # Development with watch
npm run build   # Production build
```

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Open pull request

## License

MIT License

## Security

- All processing happens locally
- No data sent to external servers
- Uses Chrome's built-in AI capabilities