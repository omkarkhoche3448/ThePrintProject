import React from 'react';
import ResizableLayout from '../components/dashboard/ResizableLayout';
import PendingJobsList from '../components/dashboard/PendingJobsList';
import CompletedJobsList from '../components/dashboard/CompletedJobsList';
import PrintersList from '../components/dashboard/PrintersList';
import { mockPendingJobs, mockCompletedJobs, mockPrinters } from '../data/mockData';

const DashboardPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-64px)] bg-xerox-gray-100">
      <div className="bg-white border-b border-xerox-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-xerox-gray-900">Xerox Wall Dashboard</h1>
          <p className="text-xerox-gray-600">Manage print jobs and monitor printer status</p>
        </div>
      </div>
      
      <div className="h-[calc(100%-72px)]">
        <ResizableLayout defaultSizes={[30, 40, 30]}>
          <PendingJobsList jobs={mockPendingJobs} />
          <CompletedJobsList jobs={mockCompletedJobs} />
          <PrintersList printers={mockPrinters} />
        </ResizableLayout>
      </div>
    </div>
  );
};

export default DashboardPage;