# ThePrintProject Electron App

This is the desktop client application for ThePrintProject, which integrates with Windows printer systems.

## Project Structure

- `electron/` - Contains main process code for Electron
  - `main.cjs` - Main Electron process entry point
  - `preload.cjs` - Preload script for Electron
  - `printJobController.cjs` - Manages print jobs and distribution
  - `windowsPrinterManager.cjs` - Handles Windows printer discovery and status
  - `test-mongo-connection.cjs` - Test script for MongoDB connection handling
- `src/` - Front-end React application
  - `components/` - React UI components
  - `pages/` - Main application pages
  - `services/` - API and service integration

## Recent Updates

### Module System Fix

We've resolved issues with ES modules vs CommonJS compatibility by:
1. Renaming Electron backend files to use `.cjs` extension
2. Updating imports to reference the correct file extensions
3. See `README-MODULES.md` for detailed information

### MongoDB Connection Handling

Fixed the `MongoExpiredSessionError: Cannot use a session that has ended` error by:
1. Creating dedicated MongoDB connections for each operation
2. Properly closing connections in finally blocks
3. Avoiding passing database handles between async functions
4. See `README-MODULES.md` for complete details

## Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev:electron

# Build for production
npm run build:electron
```

## Testing

```bash
# Test MongoDB connection handling
node electron/test-mongo-connection.cjs
```

## Troubleshooting

If you encounter issues with the application:

1. Check the application logs in the terminal
2. Verify printer connections in Windows settings
3. Run the MongoDB connection test script
4. Use the cleanup.bat script to remove temporary files
5. Refer to WINDOWS-PRINTING.md for printer-specific troubleshooting

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cbde041b-74c4-4bce-a5ea-a39616b3470b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
