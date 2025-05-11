import { useState, useEffect } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      onUpdateMessage: (callback: (message: string) => void) => (() => void);
    };
  }
}

export const UpdateNotification = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [version, setVersion] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get app version if running in Electron
    if (window.electronAPI) {
      window.electronAPI.getAppVersion()
        .then((version) => {
          setVersion(version);
        })
        .catch((error) => {
          console.error('Failed to get app version:', error);
          setError('Could not retrieve app version');
        });

      // Listen for update messages from the main process
      try {
        // Use the new onUpdateMessage method which returns a cleanup function
        const removeListener = window.electronAPI.onUpdateMessage((message) => {
          setMessage(message);
          setShowNotification(true);
        });
        
        // Return the cleanup function to remove the listener when component unmounts
        return removeListener;
      } catch (error) {
        console.error('Error setting up update message listener:', error);
      }
    }
  }, []);

  // Hide the notification after 5 seconds if it's not about downloading
  useEffect(() => {
    if (message && !message.includes('Downloading')) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!showNotification || (!message && !error)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg flex flex-col">
      <div className="flex items-center justify-between">
        <span>{message || error}</span>
        <button 
          onClick={() => setShowNotification(false)}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
      {version && (
        <div className="text-xs mt-1">
          Current version: {version}
        </div>
      )}
    </div>
  );
};