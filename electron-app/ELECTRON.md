# Gemini Property Dashboard - Desktop Application

This is an Electron-based desktop application for the Gemini Property Dashboard.

## Development

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the app in development mode:

```bash
npm run dev:electron
```

This will start the Vite development server and launch the Electron app that connects to it.

## Building the Application

To build the desktop application for your current platform:

```bash
npm run build:electron
```

This will:
1. Build the React app with Vite
2. Compile the Electron main process code
3. Package everything into a distributable format using electron-builder

The packaged application will be available in the `dist-app` directory.

## Application Structure

- `/src` - React application code
- `/electron` - Electron main process code
  - `main.ts` - Main process entry point
  - `preload.ts` - Preload script for secure IPC communication
- `/dist` - Built React app (after running build)
- `/dist-electron` - Built Electron code (after running build)
- `/dist-app` - Packaged desktop application (after running build:electron)

## Features

- Cross-platform desktop application (Windows, macOS, Linux)
- All the features of the web application in a native desktop environment
- Offline capabilities (coming soon)
- Native system integration (coming soon)

## Technology Stack

- Electron - Desktop application framework
- React - UI library
- Vite - Build tool
- TypeScript - Programming language
- Shadcn UI - UI component library
- Tailwind CSS - Utility-first CSS framework
