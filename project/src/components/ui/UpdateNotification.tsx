import { useState, useEffect, useCallback } from 'react';

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

  // Wrap message handler in useCallback to prevent unnecessary recreations
  const handleUpdateMessage = useCallback((message: string) => {
    try {
      setMessage(message);
      setShowNotification(true);
      setError(null);
    } catch (err) {
      console.error('Error handling update message:', err);
      setError('Failed to process update message');
    }
  }, []);

  useEffect(() => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return;
    }

    // Get app version
    window.electronAPI.getAppVersion()
      .then((version) => {
        setVersion(version);
        setError(null);
      })
      .catch((error) => {
        console.error('Failed to get app version:', error);
        setError('Could not retrieve app version');
      });

    // Set up update message listener
    let cleanup: (() => void) | undefined;
    try {
      cleanup = window.electronAPI.onUpdateMessage(handleUpdateMessage);
    } catch (error) {
      console.error('Error setting up update message listener:', error);
      setError('Failed to initialize update notifications');
    }

    // Return cleanup function
    return () => {
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error cleaning up update message listener:', error);
        }
      }
    };
  }, [handleUpdateMessage]);

  // Hide the notification after 5 seconds if it's not about downloading
  useEffect(() => {
    if (message && !message.includes('Downloading') && showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message, showNotification]);

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