export interface PrintJob {
  id: string;
  filename: string;
  pages: number;
  copies: number;
  submitted: string; // ISO date string
  status: 'pending' | 'completed' | 'canceled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  userId: string;
  userEmail: string;
  price?: number;
  completedAt?: string;
}

export interface Printer {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  isActive: boolean;
  model: string;
  location: string;
  jobCount: number;
}