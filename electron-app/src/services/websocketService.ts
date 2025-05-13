// WebSocket service for real-time updates
import { toast } from "@/hooks/use-toast";
import authService from "./authService";

// Define event handler types
export type PrintJobHandler = (job: any) => void;
export type ConnectionStatusHandler = (status: 'connected' | 'disconnected' | 'error') => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000; // 5 seconds
  
  // Event callbacks
  private onNewJobCallback: PrintJobHandler | null = null;
  private onJobUpdateCallback: PrintJobHandler | null = null;
  private onConnectionStatusCallback: ConnectionStatusHandler | null = null;
  
  // Store job-specific callbacks
  private onJobStatusCallbacks: { [key: string]: PrintJobHandler } = {
    pending: null,
    processing: null,
    completed: null,
    cancelled: null,
    failed: null
  };

  /**
   * Initialize WebSocket connection
   * @returns Promise that resolves when connected
   */
  public connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      // Close existing socket if any
      this.disconnect();
      
      const shopkeeper = authService.getCurrentUser();
      if (!shopkeeper) {
        console.error('Cannot connect to WebSocket: User not logged in');
        resolve(false);
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('Cannot connect to WebSocket: No auth token');
        resolve(false);
        return;
      }

      try {
        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const baseUrl = 'localhost:3000'; // Use your backend URL
        this.socket = new WebSocket(`${protocol}//${baseUrl}?token=${token}&type=shopkeeper&id=${shopkeeper.id}`);
        
        // Connection opened
        this.socket.addEventListener('open', () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          if (this.onConnectionStatusCallback) {
            this.onConnectionStatusCallback('connected');
          }
          resolve(true);
        });
        
        // Listen for messages
        this.socket.addEventListener('message', this.handleMessage);
        
        // Connection closed
        this.socket.addEventListener('close', this.handleClose);
        
        // Connection error
        this.socket.addEventListener('error', (event) => {
          console.error('WebSocket error:', event);
          if (this.onConnectionStatusCallback) {
            this.onConnectionStatusCallback('error');
          }
          resolve(false);
        });
      } catch (error) {
        console.error('WebSocket connection error:', error);
        if (this.onConnectionStatusCallback) {
          this.onConnectionStatusCallback('error');
        }
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.removeEventListener('message', this.handleMessage);
      this.socket.removeEventListener('close', this.handleClose);
      
      if (this.socket.readyState === WebSocket.OPEN || 
          this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      
      this.socket = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'newPrintJob':
          if (this.onNewJobCallback) {
            this.onNewJobCallback(message.data);
          }
          toast({
            title: "New Print Job",
            description: `Job #${message.data.orderId} has been received.`
          });
          break;
          
        case 'updatedPrintJob':
          if (this.onJobUpdateCallback) {
            this.onJobUpdateCallback(message.data);
          }
          break;
          
        // Handle status-specific events
        case 'printJob_pending':
        case 'printJob_processing':
        case 'printJob_completed':
        case 'printJob_cancelled':
        case 'printJob_failed':
          const status = message.type.split('_')[1];
          const callback = this.onJobStatusCallbacks[status];
          if (callback) {
            callback(message.data);
          }
          break;
          
        case 'ping':
          // Server ping to keep connection alive
          this.socket?.send(JSON.stringify({
            event: 'pong',
            data: { timestamp: new Date().toISOString() }
          }));
          break;
          
        case 'connection':
          console.log('Connection confirmed:', message.message);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  /**
   * Handle WebSocket connection close
   */
  private handleClose = (): void => {
    console.log('WebSocket disconnected');
    
    if (this.onConnectionStatusCallback) {
      this.onConnectionStatusCallback('disconnected');
    }
    
    // Try to reconnect after delay if not disconnected manually
    if (this.socket && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    }
  };

  // Event handler setters
  public onNewJob(callback: PrintJobHandler): void {
    this.onNewJobCallback = callback;
  }
  
  public onJobUpdate(callback: PrintJobHandler): void {
    this.onJobUpdateCallback = callback;
  }
  
  public onConnectionStatus(callback: ConnectionStatusHandler): void {
    this.onConnectionStatusCallback = callback;
  }
  
  // Status-specific handlers
  public onJobPending(callback: PrintJobHandler): void {
    this.onJobStatusCallbacks.pending = callback;
  }
  
  public onJobProcessing(callback: PrintJobHandler): void {
    this.onJobStatusCallbacks.processing = callback;
  }
  
  public onJobCompleted(callback: PrintJobHandler): void {
    this.onJobStatusCallbacks.completed = callback;
  }
  
  public onJobCancelled(callback: PrintJobHandler): void {
    this.onJobStatusCallbacks.cancelled = callback;
  }
  
  public onJobFailed(callback: PrintJobHandler): void {
    this.onJobStatusCallbacks.failed = callback;
  }
}

// Export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;