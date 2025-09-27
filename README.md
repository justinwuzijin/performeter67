# Performative Meter Chrome Extension

A Chrome extension that adds a React-powered sidebar to Tinder for performance tracking and analytics.

## Features

- **Chrome Extension (Manifest V3)** targeting `tinder.com`
- **React + Vite** sidebar application
- **Fixed right-side sidebar** that injects into Tinder pages
- **Modern UI** with gradient background and glassmorphism effects
- **Responsive design** optimized for the sidebar format

## Project Structure

```
performeter67/
│
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker
├── contentScript.js       # Content script for injection
│
├── sidebar/               # React + Vite application
│   ├── src/
│   │   ├── App.jsx        # Main sidebar component
│   │   ├── main.jsx       # React entry point
│   │   └── styles.css     # Styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── popup/                 # Extension popup
    ├── popup.html
    └── popup.js
```

## Setup Instructions

### 1. Install Dependencies

Navigate to the sidebar directory and install the React dependencies:

```bash
cd sidebar/
npm install
```

### 2. Build the React App

Build the React sidebar application:

```bash
npm run build
```

This will create a `dist/` folder with the built React app.

### 3. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `performeter67/` folder (the root directory containing `manifest.json`)
5. The extension should now appear in your extensions list

### 4. Test the Extension

1. Navigate to `tinder.com`
2. You should see the sidebar appear on the right side of the page
3. The sidebar will display "Performative Meter Sidebar" with a modern UI

## Development

### Running the React App in Development Mode

To work on the sidebar UI:

```bash
cd sidebar/
npm run dev
```

This will start the Vite development server at `http://localhost:3000`.

### Building for Production

After making changes to the React app:

```bash
cd sidebar/
npm run build
```

Then reload the extension in Chrome (`chrome://extensions/` → click the refresh icon on your extension).

## Customization

The React app is located in the `sidebar/src/` directory:

- **`App.jsx`** - Main sidebar component (customize this for your features)
- **`styles.css`** - Styling (modern gradient design with glassmorphism)
- **`main.jsx`** - React entry point

## Extension Details

- **Manifest Version**: 3
- **Target**: `*://*.tinder.com/*`
- **Permissions**: `activeTab`, `storage`
- **Host Permissions**: `*://*.tinder.com/*`

## Troubleshooting

1. **Sidebar not appearing**: Make sure you're on `tinder.com` and the extension is enabled
2. **React app not loading**: Ensure you've run `npm run build` in the `sidebar/` directory
3. **Extension not loading**: Check the Chrome console for errors and ensure all files are present

## Next Steps

- Customize the `App.jsx` component to add your performance tracking features
- Add state management (Redux, Zustand, etc.) if needed
- Implement data persistence using Chrome storage APIs
- Add analytics and metrics tracking functionality