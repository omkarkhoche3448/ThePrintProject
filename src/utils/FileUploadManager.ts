import { PrintFile, PendingUpload, UploadStatus } from '../types/print';

// IndexedDB setup for offline storage
const DB_NAME = 'fileUploadDB';
const DB_VERSION = 1;
const PENDING_UPLOADS_STORE = 'pendingUploads';

// Initialize the database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PENDING_UPLOADS_STORE)) {
        const store = db.createObjectStore(PENDING_UPLOADS_STORE, { keyPath: 'id' });
        store.createIndex('uploadStatus', 'uploadStatus', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// Add a pending upload to the queue
export const addPendingUpload = async (pendingUpload: PendingUpload): Promise<string> => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_UPLOADS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_UPLOADS_STORE);
    const request = store.add(pendingUpload);

    request.onsuccess = () => {
      resolve(pendingUpload.id);
    };

    request.onerror = () => {
      reject('Error adding pending upload');
    };
  });
};

// Get all pending uploads
export const getPendingUploads = async (): Promise<PendingUpload[]> => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_UPLOADS_STORE], 'readonly');
    const store = transaction.objectStore(PENDING_UPLOADS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Error getting pending uploads');
    };
  });
};

// Update a pending upload
export const updatePendingUpload = async (id: string, updates: Partial<PendingUpload>): Promise<void> => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_UPLOADS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_UPLOADS_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const data = getRequest.result;
      if (!data) {
        reject(`Pending upload with id ${id} not found`);
        return;
      }

      const updatedData = { ...data, ...updates };
      const updateRequest = store.put(updatedData);

      updateRequest.onsuccess = () => {
        resolve();
      };

      updateRequest.onerror = () => {
        reject('Error updating pending upload');
      };
    };

    getRequest.onerror = () => {
      reject('Error getting pending upload for update');
    };
  });
};

// Remove a pending upload
export const removePendingUpload = async (id: string): Promise<void> => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_UPLOADS_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_UPLOADS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject('Error removing pending upload');
    };
  });
};

// Process the upload queue
export const processUploadQueue = async (
  uploadFunction: (file: File, onProgress: (progress: number) => void) => Promise<string>
): Promise<void> => {
  // Check if online
  if (!navigator.onLine) {
    console.log('Device is offline, skipping upload queue processing');
    return;
  }

  const pendingUploads = await getPendingUploads();
  
  // Sort by priority and then by creation date
  const sortedUploads = pendingUploads.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority ? -1 : 1; // Priority items first
    }
    return a.createdAt.getTime() - b.createdAt.getTime(); // Older items first
  });

  for (const upload of sortedUploads) {
    if (upload.uploadStatus === 'queued' || upload.uploadStatus === 'error') {
      try {
        // Update status to uploading
        await updatePendingUpload(upload.id, { uploadStatus: 'uploading' });
        
        // Create a File object from the stored Blob
        const file = new File([upload.fileData], upload.metadata.name, {
          type: upload.metadata.type,
        });
        
        // Upload the file
        const fileUrl = await uploadFunction(file, (progress) => {
          console.log(`Upload progress for ${upload.id}: ${progress}%`);
        });
        
        // If successful, remove from queue
        await removePendingUpload(upload.id);
        
        console.log(`Successfully uploaded file ${upload.id}`);
      } catch (error) {
        console.error(`Error uploading file ${upload.id}:`, error);
        
        // Update status to error
        await updatePendingUpload(upload.id, { 
          uploadStatus: 'error',
          lastAttempt: new Date()
        });
      }
    }
  }
};

// Convert a File to a PendingUpload
export const createPendingUpload = async (file: File, priority: boolean = false): Promise<PendingUpload> => {
  return {
    id: crypto.randomUUID(),
    fileData: await file.arrayBuffer().then(buffer => new Blob([buffer], { type: file.type })),
    metadata: {
      name: file.name,
      type: file.type,
      size: file.size,
    },
    uploadStatus: 'queued',
    priority,
    createdAt: new Date(),
  };
};

// Upload manager class
export class FileUploadManager {
  private uploadQueue: PrintFile[] = [];
  private isProcessing: boolean = false;
  private maxRetries: number = 3;
  private retryDelay: number = 5000; // 5 seconds
  
  constructor(
    private uploadFunction: (file: File, onProgress: (progress: number) => void) => Promise<string>,
    private onStatusChange: (fileId: string, status: UploadStatus, url?: string) => void
  ) {}
  
  // Add a file to the upload queue
  public async addToQueue(file: PrintFile): Promise<void> {
    // Add to IndexedDB for offline persistence
    const pendingUpload = await createPendingUpload(file.file, !!file.options.priority);
    await addPendingUpload(pendingUpload);
    
    // Add to in-memory queue
    this.uploadQueue.push({
      ...file,
      uploadStatus: 'queued',
    });
    
    this.onStatusChange(file.id, 'queued');
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  // Process the upload queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.uploadQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    // Sort by priority and then by retry count (fewer retries first)
    this.uploadQueue.sort((a, b) => {
      if ((a.options.priority || false) !== (b.options.priority || false)) {
        return (a.options.priority || false) ? -1 : 1;
      }
      return a.retryCount - b.retryCount;
    });
    
    const file = this.uploadQueue[0];
    
    // Skip if we're offline
    if (!navigator.onLine) {
      this.onStatusChange(file.id, 'queued');
      this.isProcessing = false;
      return;
    }
    
    try {
      this.onStatusChange(file.id, 'uploading');
      
      const fileUrl = await this.uploadFunction(file.file, (progress) => {
        // You could update a progress indicator here
        console.log(`Upload progress for ${file.id}: ${progress}%`);
      });
      
      // Success - remove from queue
      this.uploadQueue.shift();
      this.onStatusChange(file.id, 'success', fileUrl);
      
      // Remove from IndexedDB
      try {
        await removePendingUpload(file.id);
      } catch (e) {
        console.error('Error removing pending upload from IndexedDB:', e);
      }
    } catch (error) {
      console.error(`Error uploading file ${file.id}:`, error);
      
      // Increment retry count
      file.retryCount++;
      file.lastAttempt = new Date();
      
      if (file.retryCount >= this.maxRetries) {
        // Max retries reached - remove from queue
        this.uploadQueue.shift();
        this.onStatusChange(file.id, 'error');
      } else {
        // Move to the end of the queue for retry
        this.uploadQueue.shift();
        this.uploadQueue.push(file);
        this.onStatusChange(file.id, 'error');
        
        // Update in IndexedDB
        try {
          await updatePendingUpload(file.id, { 
            uploadStatus: 'error',
            lastAttempt: new Date()
          });
        } catch (e) {
          console.error('Error updating pending upload in IndexedDB:', e);
        }
      }
    }
    
    this.isProcessing = false;
    
    // Continue processing if there are more files
    if (this.uploadQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }
  
  // Retry a failed upload
  public retryUpload(fileId: string): void {
    const fileIndex = this.uploadQueue.findIndex(file => file.id === fileId);
    if (fileIndex !== -1) {
      const file = this.uploadQueue[fileIndex];
      
      // Reset retry count
      file.retryCount = 0;
      file.lastAttempt = undefined;
      
      // Move to the front of the queue
      this.uploadQueue.splice(fileIndex, 1);
      this.uploadQueue.unshift(file);
      
      // Start processing if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    }
  }
  
  // Remove a file from the queue
  public removeFromQueue(fileId: string): void {
    const fileIndex = this.uploadQueue.findIndex(file => file.id === fileId);
    if (fileIndex !== -1) {
      this.uploadQueue.splice(fileIndex, 1);
      
      // Remove from IndexedDB
      removePendingUpload(fileId).catch(e => {
        console.error('Error removing pending upload from IndexedDB:', e);
      });
    }
  }
  
  // Get the current queue
  public getQueue(): PrintFile[] {
    return [...this.uploadQueue];
  }
  
  // Check if a file is in the queue
  public isInQueue(fileId: string): boolean {
    return this.uploadQueue.some(file => file.id === fileId);
  }
  
  // Initialize from IndexedDB (call on app startup)
  public async initFromStorage(): Promise<void> {
    try {
      const pendingUploads = await getPendingUploads();
      
      // Convert PendingUpload to PrintFile and add to queue
      for (const upload of pendingUploads) {
        const file = new File([upload.fileData], upload.metadata.name, {
          type: upload.metadata.type,
        });
        
        // Create a minimal PrintFile object
        const printFile: PrintFile = {
          id: upload.id,
          file,
          pageCount: 0, // This would need to be determined
          selectedPages: '1',
          options: {
            paperSize: 'A4',
            paperType: 'Standard',
            colorMode: 'BlackAndWhite',
            copies: 1,
            doubleSided: false,
            priority: upload.priority,
          },
          price: 0, // This would need to be calculated
          uploadStatus: upload.uploadStatus as UploadStatus,
          retryCount: 0,
        };
        
        this.uploadQueue.push(printFile);
        this.onStatusChange(printFile.id, printFile.uploadStatus);
      }
      
      // Start processing if there are files in the queue
      if (this.uploadQueue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
  }
  
  // Listen for online/offline events
  public setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Device is online, resuming uploads');
      if (this.uploadQueue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('Device is offline, pausing uploads');
      // No need to do anything, the queue processing will pause naturally
    });
  }
}